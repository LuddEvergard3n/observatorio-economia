using Observatory;
using System.Diagnostics;
using System.Text.Json;

var checks = 0;
void Check(bool condition, string label) { if (!condition) throw new Exception(label); checks++; }
void Reject(Action action, string label) { try { action(); } catch (Exception e) when (e is InvalidDataException or FormatException) { checks++; return; } throw new Exception(label); }
Observation Point(string period, double? value) => new(period, value, "published");
Dataset Data(params Observation[] points) => new(1, "sample", "2026-01-01T00:00:00Z", null, [], [new("BRA", points)]);
Check(DataRules.ParseNumber("12,5") == 12.5, "Decimal comma");
Check(DataRules.ParseNumber("...") is null, "Missing marker");
Reject(() => DataRules.ParseNumber("NaN"), "Reject non-finite values");
Check(DataRules.SidraPeriod("202403", "quarterly") == "2024-Q3", "Quarter code");
Check(DataRules.SidraPeriod("202403", "rolling-quarter") == "2024-03", "Rolling quarter code");
Reject(() => DataRules.SidraPeriod("202405", "quarterly"), "Reject invalid quarter");
var allowed = new HashSet<string> { "BRA" };
var cutoff = new DateOnly(2026, 3, 15);
var valid = DataRules.Validate([new("BRA", [Point("1987", 1), Point("2026-03", 2), Point("2026-04", 3), Point("2026-03-16", 4), Point("2026-Q2", 5)])], allowed, cutoff, 1988);
Check(valid[0].Observations.Length == 1, "Filter out-of-window observations");
Reject(() => DataRules.Validate([new("BRA", [Point("2025", 1), Point("2025", 2)])], allowed, cutoff, 1988), "Reject duplicates");
Reject(() => DataRules.Validate([new("BRA", [Point("2025-13", 1)])], allowed, cutoff, 1988), "Reject invalid month");
var revisions = DataRules.Diff(Data(Point("2020", 1), Point("2021", 2)), Data(Point("2020", 3), Point("2022", 4)), "now");
Check(revisions.Length == 2 && revisions.Any(r => r.Period == "2021" && r.Current is null), "Record revisions and removals, not additions");
var deflated = DataRules.Deflate([Point("2025-01", 100), Point("2025-02", 110), Point("2025-03", 121)], [Point("2025-02", 10), Point("2025-03", 10)], "2025-02");
Check(Math.Abs(deflated[0].Value!.Value - 110) < 1e-8 && Math.Abs(deflated[2].Value!.Value - 110) < 1e-8, "Deflate in both directions");
Check(DataRules.Deflate([Point("2025-01", 100)], [], "2025-02")[0].Value is null, "No imputed inflation");
// Exercise the real publication boundary without network: an unsupported provider must preserve the existing file.
var fixture = Path.GetFullPath(Path.Combine(".cache", "retention-check", Guid.NewGuid().ToString("N")));
Directory.CreateDirectory(Path.Combine(fixture, "series"));
var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
var datasetFile = Path.Combine(fixture, "series", "sample.json");
var original = JsonSerializer.Serialize(Data(Point("2025", 42)), options);
await File.WriteAllTextAsync(datasetFile, original);
var catalogFile = Path.Combine(fixture, "catalog.json");
var catalog = new Catalog(1, 1988, 2026, [new("BRA", "Brasil", "América", "#000000")], [new("sample", "Sample", "", "activity", "%", "annual", "unsupported-test-provider", "Fixture", "https://example.org", "Fixture", "", "published")]);
await File.WriteAllTextAsync(catalogFile, JsonSerializer.Serialize(catalog, options));
using var process = new Process { StartInfo = new ProcessStartInfo("dotnet") { RedirectStandardOutput = true, RedirectStandardError = true, UseShellExecute = false } };
foreach (var argument in new[] { typeof(Providers).Assembly.Location, "--catalog", catalogFile, "--output", fixture, "--as-of", "2026-03-15" }) process.StartInfo.ArgumentList.Add(argument);
process.Start();
var stdout = process.StandardOutput.ReadToEndAsync();
var stderr = process.StandardError.ReadToEndAsync();
await process.WaitForExitAsync();
await Task.WhenAll(stdout, stderr);
Check(process.ExitCode == 1, "All-failed collection signals failure");
Check(await File.ReadAllTextAsync(datasetFile) == original, "Failed connector never overwrites existing series");
var retainedManifest = JsonSerializer.Deserialize<Manifest>(await File.ReadAllTextAsync(Path.Combine(fixture, "manifest.json")), options)!;
Check(retainedManifest.Indicators[0].Status == "error" && retainedManifest.Indicators[0].Summaries["BRA"].Value == 42, "Manifest preserves the value and reports the failure");
Console.WriteLine($"{checks} collector checks passed.");
