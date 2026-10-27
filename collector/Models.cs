namespace Observatory;

public sealed record Country(string Id, string Name, string Region, string Color);
public sealed record Catalog(int SchemaVersion, int StartYear, int EndYear, Country[] Countries, Indicator[] Indicators);
public sealed record Indicator(string Id, string Name, string Code, string Category, string Unit,
    string Frequency, string Provider, string Source, string SourceUrl, string Description,
    string Notes, string StatusDefault, string? Start = null, double Factor = 1, string? Transform = null);
public sealed record Observation(string Period, double? Value, string Status);
public sealed record Series(string Country, Observation[] Observations);
public sealed record Provenance(string Url, string Sha256, string? ETag, string? LastModified);
public sealed record Dataset(int SchemaVersion, string Id, string RetrievedAt, string? SourceNote,
    Provenance[] Provenance, Series[] Series);
public sealed record Summary(string? First, string? Last, double? Value, int Count, Observation[] Sparkline);
public sealed record Entry(Indicator Definition, string Status, string LastAttempt, string? LastSuccess,
    string? Error, Dictionary<string, Summary> Summaries);
public sealed record Manifest(int SchemaVersion, string GeneratedAt, string AsOf, int StartYear, int EndYear,
    Country[] Countries, Entry[] Indicators, int ObservationCount, int FailedSources);
public sealed record Revision(string Indicator, string Country, string Period, double? Previous, double? Current, string DetectedAt);
