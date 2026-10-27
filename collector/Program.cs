using System.Globalization;
using System.Text.Json;
using Observatory;

var options = new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = false };
var root = Directory.GetCurrentDirectory();
string Argument(string name, string fallback) { var index = Array.IndexOf(args, name); return index >= 0 && index + 1 < args.Length ? args[index + 1] : fallback; }
var output = Path.GetFullPath(Argument("--output", "public/data"));
var catalogPath = Path.GetFullPath(Argument("--catalog", "catalog/catalog.json"));
var catalog = JsonSerializer.Deserialize<Catalog>(await File.ReadAllTextAsync(catalogPath), options) ?? throw new InvalidDataException("Missing catalog.");
var localDate = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTimeOffset.UtcNow, "America/Sao_Paulo").DateTime);
var asOf = DateOnly.Parse(Argument("--as-of", localDate.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)), CultureInfo.InvariantCulture);
if (asOf.Year > catalog.EndYear) asOf = new DateOnly(catalog.EndYear, 12, 31);
var localTime = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTimeOffset.UtcNow, "America/Sao_Paulo");
var full = args.Contains("--full") || (localDate.DayOfWeek == DayOfWeek.Sunday && localTime.Hour == 3);
var filter = Argument("--only", "").Split(',', StringSplitOptions.RemoveEmptyEntries).ToHashSet();
Directory.CreateDirectory(output);
Directory.CreateDirectory(Path.Combine(output, "series"));
using var http = new HttpStore(Path.Combine(root, ".cache", "http"), Path.Combine(root, ".cache", "raw"));
var providers = new Providers(http, catalog, asOf, output);
var entries = new List<Entry>();
var revisions = new List<Revision>();
var revisionPath = Path.Combine(output, "revisions.json");
if (File.Exists(revisionPath)) revisions.AddRange(JsonSerializer.Deserialize<Revision[]>(await File.ReadAllTextAsync(revisionPath), options) ?? []);
Manifest? previousManifest = File.Exists(Path.Combine(output, "manifest.json")) ? JsonSerializer.Deserialize<Manifest>(await File.ReadAllTextAsync(Path.Combine(output, "manifest.json")), options) : null;
foreach (var definition in catalog.Indicators)
{
    var file = Path.Combine(output, "series", definition.Id + ".json");
    Dataset? dataset = File.Exists(file) ? JsonSerializer.Deserialize<Dataset>(await File.ReadAllTextAsync(file), options) : null;
    var lastSuccess = dataset?.RetrievedAt;
    var at = DateTimeOffset.UtcNow.ToString("O");
    var status = "pending";
    string? error = null;
    if (filter.Count > 0 && !filter.Contains(definition.Id))
    {
        var oldEntry = previousManifest?.Indicators.FirstOrDefault(e => e.Definition.Id == definition.Id);
        if (oldEntry is not null) { entries.Add(oldEntry); continue; }
    }
    else if (definition.Provider != "pending")
    {
        try
        {
            if (definition.Provider == "derived" && new[] { "minimum-wage", "inpc" }.Any(id => entries.FirstOrDefault(e => e.Definition.Id == id)?.Status != "ready"))
                throw new InvalidDataException("A source needed for this calculation is unavailable; retained prior derived series.");
            var fresh = await providers.Fetch(definition, dataset, full || dataset is null);
            revisions.AddRange(DataRules.Diff(dataset, fresh, at));
            dataset = fresh;
            lastSuccess = fresh.RetrievedAt;
            status = fresh.Series.Any(s => s.Observations.Any(p => p.Value.HasValue)) ? "ready" : "empty";
            await WriteAtomic(file, fresh);
            Console.WriteLine($"OK {definition.Id}: {fresh.Series.Sum(s => s.Observations.Count(p => p.Value.HasValue))} observations");
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or IOException or JsonException or FormatException or InvalidOperationException or KeyNotFoundException)
        {
            status = "error";
            error = ex.Message.Length > 240 ? ex.Message[..240] : ex.Message;
            Console.Error.WriteLine($"RETAINED {definition.Id}: {error}");
        }
    }
    var summaries = new Dictionary<string, Summary>();
    foreach (var country in catalog.Countries)
    {
        var points = dataset?.Series.FirstOrDefault(s => s.Country == country.Id)?.Observations.Where(p => p.Value.HasValue).ToArray() ?? [];
        summaries[country.Id] = new Summary(points.FirstOrDefault()?.Period, points.LastOrDefault()?.Period, points.LastOrDefault()?.Value, points.Length, points.TakeLast(16).ToArray());
    }
    entries.Add(new Entry(definition, status, at, lastSuccess, error, summaries));
}
var failures = entries.Count(e => e.Status == "error");
var manifest = new Manifest(1, DateTimeOffset.UtcNow.ToString("O"), asOf.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture), catalog.StartYear, catalog.EndYear, catalog.Countries, entries.ToArray(), entries.Sum(e => e.Summaries.Values.Sum(s => s.Count)), failures);
await WriteAtomic(revisionPath, revisions.Distinct().ToArray());
await WriteAtomic(Path.Combine(output, "manifest.json"), manifest);
Console.WriteLine($"Published snapshot: {manifest.ObservationCount} observations; {failures} failed connectors; {entries.Count(e => e.Status == "pending")} pending definitions.");
if (!entries.Any(e => e.Status == "ready")) Environment.ExitCode = 1;

/// Write through a temporary file on the same volume to avoid incomplete snapshots.
async Task WriteAtomic<T>(string path, T value)
{
    var temp = path + ".tmp";
    await File.WriteAllTextAsync(temp, JsonSerializer.Serialize(value, options));
    File.Move(temp, path, true);
}
