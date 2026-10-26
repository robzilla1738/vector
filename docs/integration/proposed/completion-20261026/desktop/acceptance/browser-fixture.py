"""Finite loopback pages for one real Aux desktop acceptance session.

Reuses the accepted profile-note fixture and pinned synthetic attachments. Does
not start Aux, inspect profiles, install hosts, or perform provider requests.
"""
from http.server import HTTPServer
import importlib.util
import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[6]
PREDECESSOR = ROOT / 'docs/integration/proposed/browser-feature-expansion/fresh-startup-milestone-a42/browser-fixture.py'
spec = importlib.util.spec_from_file_location('aux_profile_fixture', PREDECESSOR)
original = importlib.util.module_from_spec(spec)
spec.loader.exec_module(original)
BASE_PAGE = original.PAGE
FILES = ROOT / 'docs/integration/proposed/completion-20261026/integration/fixtures'
ATTACHMENTS = {
    '/files/first/notes.txt': ('text/plain', FILES / 'first/notes.txt'),
    '/files/second/notes.txt': ('text/plain', FILES / 'second/notes.txt'),
    '/files/image.png': ('image/png', FILES / 'image.png'),
}
NAV = b'''<nav><a href="/alpha">Alpha</a> | <a href="/beta">Beta</a> |
<a href="/gamma">Gamma</a> | <a href="/delta">Delta</a> |
<a href="/protected">Unsaved work</a> | <a href="/capture">Long capture page</a> |
<a href="/media">Synthetic video</a></nav>
<p><a href="/files/first/notes.txt" download>First notes.txt</a> |
<a href="/files/second/notes.txt" download>Different notes.txt</a> |
<a href="/files/image.png" download>Image fixture</a></p>'''
PROTECTED = b'''<h2>Protected work</h2><label>Unsaved text <input id="unsaved"></label>
<button id="commit">Mark saved</button><p id="dirty" role="status">Saved</p>
<script>
let changed=false;const edit=document.getElementById('unsaved'),status=document.getElementById('dirty');
edit.oninput=()=>{changed=true;status.textContent='Unsaved; closing should ask';};
document.getElementById('commit').onclick=()=>{changed=false;status.textContent='Saved';};
addEventListener('beforeunload',event=>{if(changed){event.preventDefault();event.returnValue='';}});
</script>'''
CAPTURE = b'''<h2 style="position:sticky;top:0;background:#fff;border:2px solid #222">Sticky capture header</h2>
<section style="height:900px;background:#dff">Upper marker: amber-cedar-742</section>
<section style="height:900px;background:#fdf">Lower marker: violet-river-319</section>
<p>End of long page. No remote images or private content.</p>'''
MEDIA = b'''<h2>Synthetic local video</h2><button id="prepare-video">Prepare video</button>
<p id="video-status" role="status">No device or screen capture is used.</p>
<canvas id="source" width="320" height="180" hidden></canvas>
<video id="video" width="320" height="180" controls loop muted playsinline></video>
<script>
document.getElementById('prepare-video').onclick=async()=>{
 const button=document.getElementById('prepare-video'),status=document.getElementById('video-status');
 button.disabled=true;let stream,animation,recording;
 try {
  if(!MediaRecorder.isTypeSupported('video/webm;codecs=vp8'))throw Error('VP8 recorder unavailable');
  const canvas=document.getElementById('source'),ctx=canvas.getContext('2d');let frame=0;
  const draw=()=>{ctx.fillStyle='#236';ctx.fillRect(0,0,320,180);ctx.fillStyle='#fff';ctx.font='24px sans-serif';
   ctx.fillText('Aux synthetic video',24,65);ctx.fillText(String(frame++),145,110);};
  draw();stream=canvas.captureStream(10);animation=setInterval(draw,100);
  const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8'}),chunks=[];
  recording=new Promise((resolve,reject)=>{recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
   recorder.onstop=resolve;recorder.onerror=e=>reject(e.error||Error('Recorder failed'));});
  recorder.start();await new Promise(resolve=>setTimeout(resolve,1500));recorder.stop();await recording;
  const video=document.getElementById('video');if(video.src.startsWith('blob:'))URL.revokeObjectURL(video.src);
  video.src=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));await video.play();
  status.textContent='Local video ready. Use Aux picture-in-picture controls, then return to this tab.';
 } catch(error){status.textContent=error.message;button.disabled=false;}
 finally {clearInterval(animation);stream?.getTracks().forEach(track=>track.stop());}
};
</script>'''


class Fixture(original.Fixture):
    def log_message(self, *args):
        pass

    def do_GET(self):
        path = urlparse(self.path).path
        if path in ATTACHMENTS:
            mime, source = ATTACHMENTS[path]
            body = source.read_bytes()
            self.send_response(200)
            self.send_header('Content-Type', mime)
            self.send_header('Content-Disposition', f'attachment; filename="{source.name}"')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        labels = {'/alpha': 'Alpha', '/beta': 'Beta', '/gamma': 'Gamma', '/delta': 'Delta'}
        title = labels.get(path, 'Desktop acceptance')
        extra = PROTECTED if path == '/protected' else CAPTURE if path == '/capture' else MEDIA if path == '/media' else b''
        original.PAGE = BASE_PAGE.replace(b'<title>Aux local browser check</title>',
                                         f'<title>Aux {title}</title>'.encode()) + NAV + extra
        super().do_GET()


if __name__ == '__main__':
    server = HTTPServer(('127.0.0.1', 0), Fixture)
    print(json.dumps({'url': f'http://127.0.0.1:{server.server_port}', 'localOnly': True,
                      'providerCalls': False, 'profileAccess': False}), flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
