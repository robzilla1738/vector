import { fixturePage } from '../lib/fixture.mjs';

export function surfaceMediaPage(title, count = 2) {
  return fixturePage(title, `${Array.from({ length: count }, (_, index) => `<video id="${index ? 'small' : 'large'}" aria-label="${index ? 'Small' : 'Large'} video" width="${index ? 160 : 640}" height="${index ? 90 : 360}" muted autoplay controls></video>`).join('')}
    <output id="pipState" aria-label="PiP state">Video PiP: none</output>
    <button id="audible">Play audible video</button><button id="pause">Pause all videos</button><button id="destroy">Destroy all videos</button>
    <button id="documentPip">Document picture in picture</button><button id="handler">Register media session handler</button>
    <button id="clearHandler">Clear media session handler</button><output id="handlerState">Media session handler: none</output><output id="playState">Preparing videos</output>
    <script>
      const videos = [...document.querySelectorAll('video')];
      const timers = [];
      for (const video of videos) {
        const canvas = document.createElement('canvas'); canvas.width = video.width; canvas.height = video.height;
        const context = canvas.getContext('2d');
        timers.push(setInterval(() => { context.fillStyle = '#164b72'; context.fillRect(0,0,canvas.width,canvas.height); context.fillStyle = 'white'; context.font = '24px system-ui'; context.fillText('Loopback native video',10,40); }, 50));
        video.srcObject = canvas.captureStream(20);
        video.addEventListener('enterpictureinpicture', () => pipState.textContent = 'Video PiP: ' + document.pictureInPictureElement.id);
        video.addEventListener('leavepictureinpicture', () => pipState.textContent = 'Video PiP: none');
      }
      Promise.all(videos.map(video => video.play())).then(() => playState.textContent = 'Videos playing: ' + videos.length);
      audible.onclick = async () => {
        const audio = new AudioContext(); await audio.resume();
        const oscillator = audio.createOscillator(), destination = audio.createMediaStreamDestination();
        oscillator.connect(destination); oscillator.start();
        videos[0].srcObject.addTrack(destination.stream.getAudioTracks()[0]);
        videos[0].muted = false; await videos[0].play(); playState.textContent = 'Audible video playing';
        window.fixtureAudio = { audio, oscillator, destination };
      };
      pause.onclick = () => { for (const video of videos) video.pause(); playState.textContent = 'Videos paused: ' + videos.length; };
      destroy.onclick = () => { for (const video of videos) { video.srcObject.getTracks().forEach(track => track.stop()); video.srcObject = null; video.removeAttribute('src'); video.load(); video.remove(); } timers.forEach(clearInterval); playState.textContent = 'Videos destroyed'; };
      documentPip.onclick = async () => { const pip = await documentPictureInPicture.requestWindow({ width: 480, height: 320 }); pip.document.title = 'Aux Document PiP'; pip.document.body.innerHTML = '<h1>Document PiP fixture</h1><button onclick="window.close()">Close Document PiP</button>'; };
      clearHandler.onclick = () => { navigator.mediaSession.setActionHandler('enterpictureinpicture', null); handlerState.textContent = 'Media session handler: none'; };
      handler.onclick = () => { navigator.mediaSession.setActionHandler('enterpictureinpicture', async () => { handlerState.textContent = 'Media session handler: invoked'; await videos[0].requestPictureInPicture(); }); handlerState.textContent = 'Media session handler: registered'; };
    </script>`);
}
