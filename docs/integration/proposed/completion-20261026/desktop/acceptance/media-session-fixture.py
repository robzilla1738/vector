"""Same synthetic desktop fixture, with a silent audio track for media-session PiP.

No microphone/device request and no Web Audio connection to speakers. The track
exists only in the in-memory recording. Integrator may reuse --port after cleanly
stopping its previous fixture server; this script never stops another process.
"""
import argparse
from http.server import HTTPServer
import importlib.util
import json
from pathlib import Path

path = Path(__file__).with_name('browser-fixture.py')
spec = importlib.util.spec_from_file_location('aux_desktop_fixture', path)
fixture = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fixture)
changes = [
    (b'button.disabled=true;let stream,animation,recording;',
     b'button.disabled=true;let stream,animation,recording,audio,oscillator;'),
    (b"if(!MediaRecorder.isTypeSupported('video/webm;codecs=vp8'))throw Error('VP8 recorder unavailable');",
     b"if(!MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus'))throw Error('VP8/Opus recorder unavailable');"
     b"audio=new AudioContext();await audio.resume();"
     b"const destination=audio.createMediaStreamDestination(),silence=audio.createGain();"
     b"silence.gain.value=0;oscillator=audio.createOscillator();"
     b"oscillator.connect(silence).connect(destination);oscillator.start();"),
    (b'stream=canvas.captureStream(10);animation=',
     b'stream=canvas.captureStream(10);stream.addTrack(destination.stream.getAudioTracks()[0]);animation='),
    (b"mimeType:'video/webm;codecs=vp8'", b"mimeType:'video/webm;codecs=vp8,opus'"),
    (b'finally {clearInterval(animation);stream?.getTracks().forEach(track=>track.stop());}',
     b'finally {clearInterval(animation);stream?.getTracks().forEach(track=>track.stop());'
     b'oscillator?.stop();await audio?.close();}'),
]
for before, after in changes:
    if fixture.MEDIA.count(before) != 1:
        raise RuntimeError('Synthetic media fixture anchor changed')
    fixture.MEDIA = fixture.MEDIA.replace(before, after)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=0)
    args = parser.parse_args()
    if not 0 <= args.port <= 65535:
        parser.error('port must be between 0 and 65535')
    server = HTTPServer(('127.0.0.1', args.port), fixture.Fixture)
    print(json.dumps({'url': f'http://127.0.0.1:{server.server_port}',
                      'localOnly': True, 'syntheticSilentAudio': True}), flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
