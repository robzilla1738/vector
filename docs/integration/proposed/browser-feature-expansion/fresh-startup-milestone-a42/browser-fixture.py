"""Loopback-only page for the bounded real-browser profile/persistence checks."""
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
from urllib.parse import parse_qs, urlparse

PAGE = b'''<!doctype html><meta charset="utf-8"><title>Aux local browser check</title>
<style>body{font:18px system-ui;margin:48px;max-width:800px}input{font:inherit}</style>
<h1>Aux local browser check</h1>
<p id="profile"></p><p id="saved"></p>
<label>Profile note <input id="note" aria-label="Profile note"></label>
<button id="save">Save note</button>
<p><a href="/second">Second page</a> | <a href="/">First page</a> |
<a href="/download">Download disposable attachment</a></p>
<script>
document.getElementById('profile').textContent='Cookie: '+(document.cookie||'(empty)');
const note=document.getElementById('note');note.value=localStorage.getItem('note')||'';
document.getElementById('saved').textContent='Saved note: '+note.value;
document.getElementById('save').onclick=()=>{localStorage.setItem('note',note.value);
document.getElementById('saved').textContent='Saved note: '+note.value;};
</script>'''


class Fixture(BaseHTTPRequestHandler):
    def do_GET(self):
        url = urlparse(self.path)
        profile = parse_qs(url.query).get('profile', [''])[0]
        if url.path == '/download':
            body = b'Aux disposable attachment fixture. No private data.\n'
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain')
            self.send_header('Content-Disposition', 'attachment; filename="aux-disposable-note.txt"')
        else:
            body = PAGE
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            if profile in ['personal', 'work']:
                self.send_header('Set-Cookie', f'aux_profile={profile}; Path=/; Max-Age=86400; SameSite=Lax')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)


if __name__ == '__main__':
    server = HTTPServer(('127.0.0.1', 0), Fixture)
    print(json.dumps(dict(url=f'http://127.0.0.1:{server.server_port}', localOnly=True)), flush=True)
    server.serve_forever()
