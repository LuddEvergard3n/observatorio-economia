using System.IO.Compression;
using System.Xml;
using System.Xml.Linq;

namespace Observatory;

/// <summary>Read cached XLSX cell values without executing formulas, macros or external relationships.</summary>
public sealed class Workbook : IDisposable
{
    private readonly ZipArchive archive;
    private readonly string[] strings;
    private static readonly XNamespace Ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    public Workbook(byte[] bytes)
    {
        archive = new ZipArchive(new MemoryStream(bytes), ZipArchiveMode.Read);
        strings = Read("xl/sharedStrings.xml").Descendants(Ns + "si").Select(s => string.Concat(s.Descendants(Ns + "t").Select(t => t.Value))).ToArray();
    }
    private XDocument Read(string path)
    {
        var entry = archive.GetEntry(path) ?? throw new InvalidDataException("Missing XLSX part: " + path);
        if (entry.Length > 64 * 1024 * 1024) throw new InvalidDataException("Oversized XLSX part.");
        using var stream = entry.Open();
        using var reader = XmlReader.Create(stream, new XmlReaderSettings { DtdProcessing = DtdProcessing.Prohibit, XmlResolver = null, MaxCharactersInDocument = 64 * 1024 * 1024 });
        return XDocument.Load(reader);
    }
    private Dictionary<string, string> Cells(XElement row) => row.Elements(Ns + "c").ToDictionary(
        c => new string(((string?)c.Attribute("r") ?? throw new InvalidDataException("Missing cell reference.")).TakeWhile(char.IsLetter).ToArray()),
        c => (string?)c.Attribute("t") == "s" ? strings[int.Parse(c.Element(Ns + "v")!.Value)] : c.Element(Ns + "v")?.Value ?? c.Element(Ns + "is")?.Value ?? "");
    /// <summary>Return nonempty rows keyed by column letters. Missing cells remain absent.</summary>
    public Dictionary<string, string>[] Rows(string part) => Read(part).Descendants(Ns + "row").Select(Cells).Where(r => r.Count > 0).ToArray();
    /// <summary>Stream a large worksheet and retain only rows accepted by the caller.</summary>
    public IEnumerable<Dictionary<string, string>> FindRows(string part, Func<Dictionary<string, string>, bool> accept)
    {
        var entry = archive.GetEntry(part) ?? throw new InvalidDataException("Missing XLSX part: " + part);
        if (entry.Length > 128 * 1024 * 1024) throw new InvalidDataException("Oversized XLSX part.");
        using var stream = entry.Open();
        using var reader = XmlReader.Create(stream, new XmlReaderSettings { DtdProcessing = DtdProcessing.Prohibit, XmlResolver = null, MaxCharactersInDocument = 128 * 1024 * 1024 });
        while (reader.Read())
        {
            if (reader.NodeType != XmlNodeType.Element || reader.LocalName != "row") continue;
            var cells = Cells((XElement)XNode.ReadFrom(reader));
            if (accept(cells)) yield return cells;
        }
    }
    public void Dispose() => archive.Dispose();
}
