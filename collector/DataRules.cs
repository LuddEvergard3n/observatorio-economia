using System.Globalization;
using System.Text.RegularExpressions;
using Microsoft.VisualBasic.FileIO;

namespace Observatory;

public static partial class DataRules
{
    /// <summary>Aggregate the Tesouro title-level CSV into monthly DPF held by the market, expressed in R$ millions.</summary>
    public static Observation[] AggregateFederalDebt(TextReader reader, string status)
    {
        using var parser = new TextFieldParser(reader) { HasFieldsEnclosedInQuotes = true };
        parser.SetDelimiters(";");
        var headers = parser.ReadFields() ?? throw new InvalidDataException("Missing Tesouro header.");
        string[] expected = ["Titulo/Contrato", "Vencimento do Titulo/Contrato", "Valor do Estoque", "Quantidade do Estoque", "Mes do Estoque", "Classe da Carteira", "Tipo de Divida"];
        if (!headers.SequenceEqual(expected)) throw new InvalidDataException("Tesouro DPF schema changed.");
        var totals = new Dictionary<string, double>();
        while (!parser.EndOfData)
        {
            var row = parser.ReadFields()!;
            if (row.Length != headers.Length) throw new InvalidDataException("Malformed Tesouro DPF row.");
            if (row[5] != "Mercado") continue;
            var month = DateOnly.ParseExact("01/" + row[4], "dd/MM/yyyy", CultureInfo.InvariantCulture).ToString("yyyy-MM", CultureInfo.InvariantCulture);
            totals[month] = totals.GetValueOrDefault(month) + (ParseNumber(row[2]) ?? throw new InvalidDataException("Missing DPF stock."));
        }
        return totals.OrderBy(p => p.Key).Select(p => new Observation(p.Key, p.Value / 1_000_000, status)).ToArray();
    }

    /// <summary>Convert monthly nominal wages to a fixed month's purchasing power; any missing intervening rate invalidates that point.</summary>
    public static Observation[] Deflate(Observation[] nominal, Observation[] inflation, string baseMonth)
    {
        var rates = inflation.ToDictionary(p => p.Period, p => p.Value);
        var basis = DateOnly.ParseExact(baseMonth + "-01", "yyyy-MM-dd", CultureInfo.InvariantCulture);
        return nominal.Select(point =>
        {
            var date = DateOnly.ParseExact(point.Period + "-01", "yyyy-MM-dd", CultureInfo.InvariantCulture);
            var start = date < basis ? date : basis;
            var end = date < basis ? basis : date;
            double? factor = 1;
            for (var month = start.AddMonths(1); month <= end; month = month.AddMonths(1))
            {
                if (!rates.TryGetValue(month.ToString("yyyy-MM", CultureInfo.InvariantCulture), out var rate) || rate is null || rate <= -100) { factor = null; break; }
                factor *= 1 + rate.Value / 100;
            }
            return new Observation(point.Period, point.Value is null || factor is null ? null : date <= basis ? point.Value * factor : point.Value / factor, "estimate");
        }).ToArray();
    }
    [GeneratedRegex(@"^\d{4}(-\d{2}(-\d{2})?|-Q[1-4])?$")]
    private static partial Regex PeriodPattern();

    /// <summary>Parse published decimal values; missing markers stay null and malformed numbers fail.</summary>
    public static double? ParseNumber(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw) || raw is ".." or "..." or "-" or "X" or "(X)" or "NA" or "null") return null;
        if (!double.TryParse(raw.Replace(',', '.'), NumberStyles.Float, CultureInfo.InvariantCulture, out var value) || !double.IsFinite(value))
            throw new InvalidDataException("Invalid numeric value in source response.");
        return value;
    }

    /// <summary>Convert a SIDRA reference code without treating rolling quarters as independent quarters.</summary>
    public static string SidraPeriod(string code, string frequency)
    {
        if (frequency == "annual" && code.Length == 4) return code;
        if (code.Length != 6) throw new InvalidDataException("Unexpected SIDRA reference period.");
        var suffix = int.Parse(code[4..], CultureInfo.InvariantCulture);
        if (frequency == "quarterly")
        {
            if (suffix is < 1 or > 4) throw new InvalidDataException("Invalid quarter.");
            return $"{code[..4]}-Q{suffix}";
        }
        if (suffix is < 1 or > 12) throw new InvalidDataException("Invalid month.");
        return $"{code[..4]}-{suffix:00}";
    }

    /// <summary>Validate unique periods, finite values and the observation cutoff. Never fill a gap.</summary>
    public static Series[] Validate(IEnumerable<Series> series, HashSet<string> allowed, DateOnly asOf, int startYear)
    {
        var result = new List<Series>();
        foreach (var item in series)
        {
            if (!allowed.Contains(item.Country)) throw new InvalidDataException("Unexpected country in dataset.");
            var periods = new HashSet<string>();
            var valid = new List<Observation>();
            foreach (var point in item.Observations)
            {
                if (!PeriodPattern().IsMatch(point.Period)) throw new InvalidDataException("Invalid observation period.");
                if (point.Value is not null && !double.IsFinite(point.Value.Value)) throw new InvalidDataException("Non-finite observation.");
                var year = int.Parse(point.Period[..4], CultureInfo.InvariantCulture);
                if (year < startYear || year > asOf.Year) continue;
                var reference = point.Period.Length == 4 ? new DateOnly(year, 1, 1)
                    : point.Period.Contains("-Q", StringComparison.Ordinal) ? new DateOnly(year, (int.Parse(point.Period[^1..], CultureInfo.InvariantCulture) - 1) * 3 + 1, 1)
                    : DateOnly.ParseExact(point.Period.Length == 7 ? point.Period + "-01" : point.Period, "yyyy-MM-dd", CultureInfo.InvariantCulture);
                if (reference > asOf) continue;
                if (!periods.Add(point.Period)) throw new InvalidDataException("Duplicate observation period.");
                valid.Add(point);
            }
            result.Add(new Series(item.Country, valid.OrderBy(p => p.Period, StringComparer.Ordinal).ToArray()));
        }
        return result.ToArray();
    }

    /// <summary>Detect changes and removals relative to a complete previous snapshot.</summary>
    public static Revision[] Diff(Dataset? previous, Dataset current, string at)
    {
        if (previous is null) return [];
        var before = previous.Series.SelectMany(s => s.Observations.Select(p => (Key: (s.Country, p.Period), p.Value))).ToDictionary(p => p.Key, p => p.Value);
        var after = current.Series.SelectMany(s => s.Observations.Select(p => (Key: (s.Country, p.Period), p.Value))).ToDictionary(p => p.Key, p => p.Value);
        return before.Keys.Union(after.Keys).Where(key => before.ContainsKey(key) && before.GetValueOrDefault(key) != after.GetValueOrDefault(key))
            .Select(key => new Revision(current.Id, key.Country, key.Period, before[key], after.GetValueOrDefault(key), at)).ToArray();
    }
}
