# Windows PowerShell 5.1 / .NET Framework; no installation or URL ACL needed.
[CmdletBinding()]
param(
    [ValidateRange(1024, 65535)][int]$Port = 18764,
    [switch]$NoBrowser
)
$ErrorActionPreference = 'Stop'
try {
    $root = Join-Path $PSScriptRoot 'public'
    if (-not (Test-Path -LiteralPath (Join-Path $root 'index.html') -PathType Leaf)) {
        throw 'public\index.html is missing. Pull the complete stock repository and keep these scripts in chungyack-apk.'
    }
    # TcpListener avoids HttpListener URL reservations that can require admin rights.
    Add-Type -TypeDefinition @'
using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
public static class ChungYackPcServer {
    public static void Serve(TcpClient client, string root) {
        using (client) {
            client.ReceiveTimeout = 5000;
            client.SendTimeout = 5000;
            try {
                var stream = client.GetStream();
                // Read a bounded header; do not wait for speculative browser connections forever.
                var header = new StringBuilder();
                while (header.Length < 16384) {
                    int b = stream.ReadByte();
                    if (b < 0) return;
                    header.Append((char)b);
                    if (header.ToString().EndsWith("\r\n\r\n")) break;
                }
                if (!header.ToString().EndsWith("\r\n\r\n")) { Reply(stream, 431, "text/plain", Encoding.UTF8.GetBytes("Header too large"), false); return; }
                string[] request = header.ToString().Split(new[]{"\r\n"}, StringSplitOptions.None)[0].Split(' ');
                if (request.Length != 3) { Reply(stream, 400, "text/plain", new byte[0], false); return; }
                bool head = request[0] == "HEAD";
                if (request[0] != "GET" && !head) { Reply(stream, 405, "text/plain", new byte[0], false); return; }
                string target = Uri.UnescapeDataString(request[1].Split('?')[0]);
                if (!target.StartsWith("/") || target.Contains("\\") || target.Contains(":")) { Reply(stream, 403, "text/plain", new byte[0], head); return; }
                if (target.EndsWith("/")) target += "index.html";
                string basePath = Path.GetFullPath(root).TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar;
                string path = Path.GetFullPath(Path.Combine(basePath, target.TrimStart('/').Replace('/', Path.DirectorySeparatorChar)));
                if (!path.StartsWith(basePath, StringComparison.OrdinalIgnoreCase)) { Reply(stream, 403, "text/plain", new byte[0], head); return; }
                // Never follow junctions/symlinks out of the public tree.
                for (string p = path; p != null && p.Length >= basePath.Length - 1; p = Path.GetDirectoryName(p)) {
                    if ((File.Exists(p) || Directory.Exists(p)) && (File.GetAttributes(p) & FileAttributes.ReparsePoint) != 0) {
                        Reply(stream, 403, "text/plain", new byte[0], head); return;
                    }
                }
                if (!File.Exists(path)) { Reply(stream, 404, "text/plain", Encoding.UTF8.GetBytes("File not found"), head); return; }
                Reply(stream, 200, Mime(Path.GetExtension(path)), File.ReadAllBytes(path), head);
            } catch (IOException) { /* A browser may close a connection or time out. */ }
              catch (Exception) {
                try { Reply(client.GetStream(), 500, "text/plain", Encoding.UTF8.GetBytes("Unable to read requested file"), false); } catch { }
            }
        }
    }
    public static void Queue(TcpClient client, string root) {
        ThreadPool.QueueUserWorkItem(delegate { Serve(client, root); });
    }
    static void Reply(Stream stream, int status, string mime, byte[] body, bool head) {
        string reason = status == 200 ? "OK" : status == 404 ? "Not Found" : status == 403 ? "Forbidden" : status == 405 ? "Method Not Allowed" : status == 431 ? "Request Header Fields Too Large" : status == 400 ? "Bad Request" : "Internal Server Error";
        byte[] headers = Encoding.ASCII.GetBytes("HTTP/1.1 " + status + " " + reason + "\r\nContent-Type: " + mime + "\r\nContent-Length: " + body.Length + "\r\nCache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n\r\n");
        stream.Write(headers, 0, headers.Length);
        if (!head) stream.Write(body, 0, body.Length);
    }
    static string Mime(string ext) {
        switch(ext.ToLowerInvariant()) {
            case ".html": return "text/html; charset=utf-8";
            case ".css": return "text/css; charset=utf-8";
            case ".js": case ".mjs": return "application/javascript; charset=utf-8";
            case ".json": return "application/json; charset=utf-8";
            case ".webmanifest": return "application/manifest+json; charset=utf-8";
            case ".csv": return "text/csv; charset=utf-8";
            case ".svg": return "image/svg+xml";
            case ".png": return "image/png";
            case ".jpg": case ".jpeg": return "image/jpeg";
            case ".ico": return "image/x-icon";
            case ".webp": return "image/webp";
            case ".woff2": return "font/woff2";
            default: return "application/octet-stream";
        }
    }
}
'@
    $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $Port)
    $listener.Server.ExclusiveAddressUse = $true
    try { $listener.Start() } catch {
        throw "Cannot open local port $Port. Close any previous ChungYack PC server window, or use -Port with a free port. Details: $($_.Exception.Message)"
    }
    $url = "http://127.0.0.1:$Port/"
    Write-Host "ChungYack PC: $url" -ForegroundColor Green
    Write-Host "Serving: $root"
    Write-Host 'Keep this window open while using the app. Close it to stop the server.'
    if (-not $NoBrowser) {
        try { Start-Process $url } catch { Write-Warning "Browser could not open. Open $url manually. $($_.Exception.Message)" }
    }
    while ($true) {
        if ($listener.Pending()) { [ChungYackPcServer]::Queue($listener.AcceptTcpClient(), $root) }
        else { Start-Sleep -Milliseconds 50 }
    }
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    if ($null -ne $listener) { $listener.Stop() }
}
