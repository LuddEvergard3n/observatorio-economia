using System.Globalization;
using System.Text.Json;
using Microsoft.VisualBasic.FileIO;

namespace Observatory;

public sealed class Providers(HttpStore http, Catalog catalog, DateOnly asOf, string output)
{
    private const string UndpUrl = "https://hdr.undp.org/sites/default/files/2025_HDR/HDR25_Composite_indices_complete_time_series.csv";
    private readonly HashSet<string> countries = catalog.Countries.Select(c => c.Id).ToHashSet();

    /// <summary>Fetch one series definition. A failed response never replaces the prior snapshot.</summary>
    public async Task<Dataset> Fetch(Indicator definition, Dataset? prior, bool full)
    {
        var urls = new List<string>();
        string? note = null;
        async Task<string> Read(string url) { urls.Add(url); return await http.Get(url); }
        var series = new List<Series>();
        switch (definition.Provider)
        {
            case "derived":
            {
                var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
                async Task<Dataset> Load(string id) => JsonSerializer.Deserialize<Dataset>(await File.ReadAllTextAsync(Path.Combine(output, "series", id + ".json")), options) ?? throw new InvalidDataException("Missing derivation input.");
                var nominal = await Load("minimum-wage");
                var inflation = await Load("inpc");
                var points = DataRules.Deflate(nominal.Series.Single(s => s.Country == "BRA").Observations, inflation.Series.Single(s => s.Country == "BRA").Observations, "2025-12");
                return new Dataset(1, definition.Id, DateTimeOffset.UtcNow.ToString("O"), "Salário mínimo nominal corrigido pelo INPC para dezembro de 2025. Entradas coletadas em " + nominal.RetrievedAt + " e " + inflation.RetrievedAt, nominal.Provenance.Concat(inflation.Provenance).Distinct().ToArray(), [new Series("BRA", points)]);
            }
            case "worldbank":
            {
                var url = $"https://api.worldbank.org/v2/country/{string.Join(';', countries)}/indicator/{definition.Code}?source=2&date={catalog.StartYear}:{Math.Min(catalog.EndYear, asOf.Year)}&format=json&per_page=20000";
                using var doc = JsonDocument.Parse(await Read(url));
                var root = doc.RootElement;
                if (root.ValueKind != JsonValueKind.Array || root.GetArrayLength() != 2 || root[1].ValueKind != JsonValueKind.Array)
                    throw new InvalidDataException("World Bank returned an error or an unexpected response.");
                if (root[0].GetProperty("pages").GetInt32() != 1) throw new InvalidDataException("Unprocessed World Bank pagination.");
                foreach (var group in root[1].EnumerateArray().Where(r => countries.Contains(r.GetProperty("countryiso3code").GetString()!)).GroupBy(r => r.GetProperty("countryiso3code").GetString()!))
                    series.Add(new Series(group.Key, group.Select(row => new Observation(row.GetProperty("date").GetString()!, Transform(Number(row.GetProperty("value")), definition), definition.StatusDefault)).ToArray()));
                var metadataUrl = $"https://api.worldbank.org/v2/indicator/{definition.Code}?format=json";
                using var meta = JsonDocument.Parse(await Read(metadataUrl));
                if (meta.RootElement.ValueKind == JsonValueKind.Array && meta.RootElement.GetArrayLength() == 2)
                    note = string.Join("\n", meta.RootElement[1].EnumerateArray().Where(m => m.GetProperty("source").GetProperty("id").GetString() == "2")
                        .Select(m => $"{m.GetProperty("sourceOrganization").GetString()}\n{m.GetProperty("sourceNote").GetString()}"));
                break;
            }
            case "bcb":
            {
                var start = definition.Start is null ? new DateOnly(catalog.StartYear, 1, 1) : DateOnly.Parse(definition.Start, CultureInfo.InvariantCulture);
                if (!full && prior?.Series.Any(s => s.Observations.Length > 0) == true) start = new DateOnly(asOf.Year - 2, asOf.Month, 1);
                var fetched = new List<Observation>();
                for (var from = start; from <= asOf; from = from.AddYears(5))
                {
                    var to = from.AddYears(5).AddDays(-1);
                    if (to > asOf) to = asOf;
                    var url = $"https://api.bcb.gov.br/dados/serie/bcdata.sgs.{definition.Code}/dados?formato=json&dataInicial={from:dd/MM/yyyy}&dataFinal={to:dd/MM/yyyy}";
                    using var doc = JsonDocument.Parse(await Read(url));
                    if (doc.RootElement.ValueKind != JsonValueKind.Array) throw new InvalidDataException("BCB returned an unexpected response.");
                    foreach (var row in doc.RootElement.EnumerateArray())
                    {
                        var date = DateOnly.ParseExact(row.GetProperty("data").GetString()!, "dd/MM/yyyy", CultureInfo.InvariantCulture);
                        var period = date.ToString(definition.Frequency == "daily" ? "yyyy-MM-dd" : "yyyy-MM", CultureInfo.InvariantCulture);
                        fetched.Add(new Observation(period, Transform(DataRules.ParseNumber(row.GetProperty("valor").GetString()), definition), definition.StatusDefault));
                    }
                }
                // The refreshed interval replaces old points so source removals are visible too.
                var retained = !full && prior is not null ? prior.Series.SelectMany(s => s.Observations).Where(p => string.CompareOrdinal(p.Period, start.ToString("yyyy-MM", CultureInfo.InvariantCulture)) < 0) : [];
                series.Add(new Series("BRA", retained.Concat(fetched).ToArray()));
                note = "BCB/SGS " + definition.Code + ". " + definition.Notes;
                break;
            }
            case "ibge":
            {
                var parts = definition.Code.Split('/');
                var extra = parts.Length > 2 ? "/" + string.Join('/', parts.Skip(2)) : "";
                var url = $"https://apisidra.ibge.gov.br/values/t/{parts[0]}/n1/1/v/{parts[1]}/p/all{extra}?formato=json";
                using var doc = JsonDocument.Parse(await Read(url));
                if (doc.RootElement.ValueKind != JsonValueKind.Array || doc.RootElement.GetArrayLength() < 2) throw new InvalidDataException("Empty or invalid SIDRA response.");
                var header = doc.RootElement[0];
                var periodKey = header.EnumerateObject().First(p => p.Name.EndsWith('C') && new[] { "Mês", "Trimestre", "Ano" }.Any(term => p.Value.GetString()!.StartsWith(term, StringComparison.Ordinal))).Name;
                series.Add(new Series("BRA", doc.RootElement.EnumerateArray().Skip(1).Select(row => new Observation(
                    DataRules.SidraPeriod(row.GetProperty(periodKey).GetString()!, definition.Frequency), DataRules.ParseNumber(row.GetProperty("V").GetString()), definition.StatusDefault)).ToArray()));
                note = "Tabela SIDRA " + parts[0] + "; variável " + parts[1] + ". " + definition.Notes;
                break;
            }
            case "undp":
            {
                using var reader = new StringReader(await Read(UndpUrl));
                using var parser = new TextFieldParser(reader) { HasFieldsEnclosedInQuotes = true };
                parser.SetDelimiters(",");
                var headers = parser.ReadFields() ?? throw new InvalidDataException("Missing UNDP header.");
                var columns = headers.Select((name, index) => (name, index)).Where(c => c.name.StartsWith(definition.Code + "_", StringComparison.Ordinal) && c.name.Length == definition.Code.Length + 5).ToArray();
                if (headers[0] != "iso3" || columns.Length == 0) throw new InvalidDataException("UNDP schema changed.");
                while (!parser.EndOfData)
                {
                    var row = parser.ReadFields()!;
                    if (!countries.Contains(row[0])) continue;
                    if (row.Length != headers.Length) throw new InvalidDataException("Malformed UNDP row.");
                    series.Add(new Series(row[0], columns.Select(c => new Observation(c.name[^4..], DataRules.ParseNumber(row[c.index]), definition.StatusDefault)).ToArray()));
                }
                note = "HDR 2025 · complete composite indices time series, 1990–2023. Frozen edition; no automatic substitution of methodology.";
                break;
            }
            case "imf":
            {
                var url = $"https://www.imf.org/external/datamapper/api/v1/{definition.Code}/{string.Join('/', countries)}";
                using var doc = JsonDocument.Parse(await Read(url));
                var values = doc.RootElement.GetProperty("values").GetProperty(definition.Code);
                foreach (var country in values.EnumerateObject().Where(p => countries.Contains(p.Name)))
                    series.Add(new Series(country.Name, country.Value.EnumerateObject().Where(p => int.Parse(p.Name, CultureInfo.InvariantCulture) < asOf.Year)
                        .Select(p => new Observation(p.Name, Number(p.Value), "estimate")).ToArray()));
                note = definition.Notes;
                break;
            }
            default: throw new InvalidOperationException("Provider not implemented.");
        }
        if (series.Count == 0) throw new InvalidDataException("Provider returned no selected countries.");
        return new Dataset(1, definition.Id, DateTimeOffset.UtcNow.ToString("O"), note, http.Evidence(urls), DataRules.Validate(series, countries, asOf, catalog.StartYear));
    }

    private static double? Number(JsonElement value) => value.ValueKind == JsonValueKind.Null ? null : value.ValueKind == JsonValueKind.Number ? value.GetDouble() : DataRules.ParseNumber(value.GetString());
    private static double? Transform(double? value, Indicator definition) => value is null ? null : definition.Transform == "complement" ? 100 - value : value * definition.Factor;
}
