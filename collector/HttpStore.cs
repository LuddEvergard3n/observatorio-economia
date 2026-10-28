using System.IO.Compression;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace Observatory;

public sealed class HttpStore : IDisposable
{
    private readonly HttpClient client = new() { Timeout = TimeSpan.FromSeconds(60) };
    private readonly Dictionary<string, DateTimeOffset> lastRequest = [];
    private readonly Dictionary<string, string> memory = [];
    private readonly Dictionary<string, Provenance> evidence = [];
    private readonly string cache;
    private readonly string archive;
    private static readonly HashSet<string> Hosts = ["api.worldbank.org", "api.bcb.gov.br", "apisidra.ibge.gov.br", "hdr.undp.org", "www.imf.org", "www.tesourotransparente.gov.br"];

    public HttpStore(string cache, string archive)
    {
        this.cache = cache; this.archive = archive;
        Directory.CreateDirectory(cache); Directory.CreateDirectory(archive);
        client.DefaultRequestHeaders.UserAgent.ParseAdd("ObservatorioEconomia/0.1 (+https://github.com/LuddEvergard3n/observatorio-economia)");
    }

    /// <summary>Return only the evidence used since the last indicator began.</summary>
    public Provenance[] Evidence(IEnumerable<string> urls) => urls.Distinct().Select(u => evidence[u]).ToArray();

    /// <summary>Fetch a bounded HTTPS response with per-host pacing, conditional caching and Retry-After handling.</summary>
    public async Task<string> Get(string url)
    {
        var uri = new Uri(url);
        if (uri.Scheme != "https" || !Hosts.Contains(uri.Host)) throw new InvalidOperationException("Unapproved data host.");
        if (memory.TryGetValue(url, out var content)) return content;
        var key = Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(url)));
        var payloadPath = Path.Combine(cache, key + ".txt");
        var metaPath = Path.Combine(cache, key + ".json");
        Provenance? prior = File.Exists(metaPath) ? JsonSerializer.Deserialize<Provenance>(await File.ReadAllTextAsync(metaPath)) : null;
        for (var attempt = 0; attempt < 3; attempt++)
        {
            var pause = TimeSpan.FromSeconds(1) - (DateTimeOffset.UtcNow - lastRequest.GetValueOrDefault(uri.Host, DateTimeOffset.MinValue));
            if (pause > TimeSpan.Zero) await Task.Delay(pause);
            using var request = new HttpRequestMessage(HttpMethod.Get, uri);
            if (prior?.ETag is not null) request.Headers.TryAddWithoutValidation("If-None-Match", prior.ETag);
            if (prior?.LastModified is not null) request.Headers.TryAddWithoutValidation("If-Modified-Since", prior.LastModified);
            lastRequest[uri.Host] = DateTimeOffset.UtcNow;
            using var response = await client.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
            if (response.StatusCode == HttpStatusCode.NotModified && File.Exists(payloadPath) && prior is not null)
            {
                evidence[url] = prior;
                return memory[url] = await File.ReadAllTextAsync(payloadPath);
            }
            if ((response.StatusCode == HttpStatusCode.TooManyRequests || (int)response.StatusCode >= 500) && attempt < 2)
            {
                var delay = response.Headers.RetryAfter?.Delta ?? (response.Headers.RetryAfter?.Date - DateTimeOffset.UtcNow) ?? TimeSpan.FromSeconds(2 << attempt);
                if (delay > TimeSpan.FromSeconds(30)) throw new HttpRequestException("Provider requests a later retry; retained previous dataset.");
                await Task.Delay(delay > TimeSpan.Zero ? delay : TimeSpan.FromSeconds(1));
                continue;
            }
            response.EnsureSuccessStatusCode();
            const int limit = 32 * 1024 * 1024;
            if (response.Content.Headers.ContentLength > limit) throw new InvalidDataException("Source file exceeds the 32 MiB limit.");
            await using var stream = await response.Content.ReadAsStreamAsync();
            using var bytes = new MemoryStream();
            var buffer = new byte[81920];
            int count;
            while ((count = await stream.ReadAsync(buffer)) > 0)
            {
                if (bytes.Length + count > limit) throw new InvalidDataException("Source file exceeds the size limit.");
                bytes.Write(buffer, 0, count);
            }
            var raw = bytes.ToArray();
            content = Encoding.UTF8.GetString(raw).TrimStart('\uFEFF');
            if (content.TrimStart().StartsWith('<'))
            {
                if (attempt < 2) { await Task.Delay(TimeSpan.FromSeconds(2 << attempt)); continue; }
                throw new InvalidDataException("Provider returned an HTML error instead of the requested data.");
            }
            var hash = Convert.ToHexStringLower(SHA256.HashData(raw));
            evidence[url] = new Provenance(url, hash, response.Headers.ETag?.ToString(), response.Content.Headers.LastModified?.ToString("R"));
            await File.WriteAllTextAsync(payloadPath, content);
            await File.WriteAllTextAsync(metaPath, JsonSerializer.Serialize(evidence[url]));
            var archivePath = Path.Combine(archive, hash + ".gz");
            if (!File.Exists(archivePath))
            {
                await using var file = File.Create(archivePath);
                await using var compressed = new GZipStream(file, CompressionLevel.SmallestSize);
                await compressed.WriteAsync(raw);
            }
            return memory[url] = content;
        }
        throw new HttpRequestException("Retry budget exhausted.");
    }

    public void Dispose() => client.Dispose();
}
