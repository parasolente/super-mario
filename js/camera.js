const CameraManager = {
  overlay: document.getElementById('cameraOverlay'),
  video: document.getElementById('cameraFeed'),
  errorEl: document.getElementById('cameraError'),
  stream: null,
  currentWorld: 1,
  hasCamera: true,
  inSelfieMode: false,
  worldNames: {1:'MUNDO 1',2:'MUNDO 2',3:'MUNDO 3',4:'MUNDO 4'},
  worldThemes: {1:'#43B047',2:'#ED6E03',3:'#016BC3',4:'#703087'},
  progress: {},
  sfx: new Audio('assets/audio/sfx/moneda_estrella.mp3'),

  worldConfig: {
    1: {coins:5, stars:3},
    2: {coins:5, stars:3},
    3: {coins:5, stars:3},
    4: {coins:10, stars:5}
  },

  initWorld(w){
    if(!this.progress[w]){
      this.progress[w] = {coins:0, stars:0, photos:[], selfie:null, done:false};
    }
  },

  async getStream(facingMode){
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {facingMode: {ideal: facingMode}, width:{ideal:1280}, height:{ideal:720}},
        audio:false
      });
    } catch {
      try {
        return await navigator.mediaDevices.getUserMedia({video:true, audio:false});
      } catch {
        return null;
      }
    }
  },

  async open(worldNum){
    this.currentWorld = worldNum;
    this.inSelfieMode = false;
    this.initWorld(worldNum);
    document.getElementById('cameraWorldNum').textContent = worldNum;
    document.getElementById('btnCoin').style.display = 'flex';
    document.getElementById('btnStar').style.display = 'flex';
    document.getElementById('btnSelfie').style.display = 'none';
    document.getElementById('btnCaptureSelfie').style.display = 'none';
    document.getElementById('selfieHint').style.display = 'none';
    document.getElementById('cameraFrameOverlay').src = `assets/images/frames/marco_mundo${worldNum}.png`;
    this.updateProgress();
    this.overlay.classList.add('show');

    this.stream = await this.getStream('environment');
    if(this.stream){
      this.hasCamera = true;
      this.errorEl.classList.remove('show');
      this.video.srcObject = this.stream;
      await this.video.play();
    } else {
      this.hasCamera = false;
      this.errorEl.classList.add('show');
      this.video.srcObject = null;
    }
  },

  close(){
    this.inSelfieMode = false;
    if(this.stream){
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    this.video.srcObject = null;
    this.errorEl.classList.remove('show');
    document.getElementById('btnCaptureSelfie').style.display = 'none';
    document.getElementById('selfieHint').style.display = 'none';
    this.overlay.classList.remove('show');
  },

  updateProgress(){
    const p = this.progress[this.currentWorld];
    const cfg = this.worldConfig[this.currentWorld];
    document.getElementById('coinCount').textContent = `${p.coins}/${cfg.coins}`;
    document.getElementById('starCount').textContent = `${p.stars}/${cfg.stars}`;
    const done = p.coins >= cfg.coins && p.stars >= cfg.stars;
    document.getElementById('btnSelfie').style.display = done ? 'flex' : 'none';
  },

  getCaptureSize(){
    if(this.stream && this.video.videoWidth){
      return {w: this.video.videoWidth, h: this.video.videoHeight};
    }
    return {w: 640, h: 480};
  },

  async capture(type){
    const p = this.progress[this.currentWorld];
    const cfg = this.worldConfig[this.currentWorld];

    if(type === 'coin' && p.coins >= cfg.coins) return;
    if(type === 'star' && p.stars >= cfg.stars) return;

    this.sfx.currentTime = 0;
    this.sfx.play();

    const marcoImg = await this.loadMarco(this.currentWorld);
    const mw = marcoImg.naturalWidth || 640;
    const mh = marcoImg.naturalHeight || 480;

    const canvas = document.createElement('canvas');
    canvas.width = mw;
    canvas.height = mh;
    const ctx = canvas.getContext('2d');

    if(this.stream && this.video.videoWidth){
      const vw = this.video.videoWidth;
      const vh = this.video.videoHeight;
      const frameRatio = mw / mh;
      const videoRatio = vw / vh;
      let sx, sy, sw, sh;
      if(videoRatio > frameRatio){
        sh = vh;
        sw = vh * frameRatio;
        sx = (vw - sw) / 2;
        sy = 0;
      } else {
        sw = vw;
        sh = vw / frameRatio;
        sx = 0;
        sy = (vh - sh) / 2;
      }
      ctx.drawImage(this.video, sx, sy, sw, sh, 0, 0, mw, mh);
    } else {
      ctx.fillStyle = '#FFF9E6';
      ctx.fillRect(0, 0, mw, mh);
      ctx.fillStyle = '#5C3A21';
      ctx.font = `${Math.round(mw/26)}px Fredoka, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Foto ' + (type === 'coin' ? 'Moneda' : 'Estrella'), mw/2, mh/2 - 20);
      ctx.fillText('MUNDO ' + this.currentWorld, mw/2, mh/2 + 20);
    }

    ctx.drawImage(marcoImg, 0, 0, mw, mh);

    const dataURL = canvas.toDataURL('image/png');
    p.photos.push({type, data: dataURL});

    if(type === 'coin') p.coins++;
    else if(type === 'star') p.stars++;

    this.updateProgress();

    if(p.coins >= cfg.coins && p.stars >= cfg.stars){
      document.getElementById('btnCoin').style.display = 'none';
      document.getElementById('btnStar').style.display = 'none';
    }
  },

  loadMarco(worldNum){
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        const fallback = document.createElement('canvas');
        fallback.width = 640; fallback.height = 480;
        resolve(fallback);
      };
      img.src = `assets/images/frames/marco_mundo${worldNum}.png`;
    });
  },

  async switchCamera(facingMode){
    if(this.stream){
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    this.stream = await this.getStream(facingMode);
    if(this.stream){
      this.video.srcObject = this.stream;
      await this.video.play();
    }
  },

  async enterSelfieMode(){
    this.inSelfieMode = true;
    document.getElementById('btnSelfie').style.display = 'none';
    document.getElementById('btnCoin').style.display = 'none';
    document.getElementById('btnStar').style.display = 'none';
    document.getElementById('selfieHint').style.display = 'block';

    await this.switchCamera('user');

    document.getElementById('btnCaptureSelfie').style.display = 'flex';
  },

  async captureSelfiePhoto(){
    if(!this.inSelfieMode) return;

    document.getElementById('btnCaptureSelfie').style.display = 'none';
    document.getElementById('selfieHint').style.display = 'none';

    this.sfx.currentTime = 0;
    this.sfx.play();

    const marcoImg = await this.loadMarco(this.currentWorld);
    const mw = marcoImg.naturalWidth || 640;
    const mh = marcoImg.naturalHeight || 480;

    const canvas = document.createElement('canvas');
    canvas.width = mw;
    canvas.height = mh;
    const ctx = canvas.getContext('2d');

    if(this.stream && this.video.videoWidth){
      const vw = this.video.videoWidth;
      const vh = this.video.videoHeight;
      const frameRatio = mw / mh;
      const videoRatio = vw / vh;
      let sx, sy, sw, sh;
      if(videoRatio > frameRatio){
        sh = vh;
        sw = vh * frameRatio;
        sx = (vw - sw) / 2;
        sy = 0;
      } else {
        sw = vw;
        sh = vw / frameRatio;
        sx = 0;
        sy = (vh - sh) / 2;
      }
      ctx.translate(mw, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(this.video, sx, sy, sw, sh, 0, 0, mw, mh);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else {
      ctx.fillStyle = '#FFF9E6';
      ctx.fillRect(0, 0, mw, mh);
      ctx.fillStyle = '#5C3A21';
      ctx.font = `${Math.round(mw/26)}px Fredoka, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('Selfie Final MUNDO ' + this.currentWorld, mw/2, mh/2);
    }

    ctx.drawImage(marcoImg, 0, 0, mw, mh);

    const p = this.progress[this.currentWorld];
    p.selfie = canvas.toDataURL('image/png');
    p.done = true;

    this.close();
    Navigation.advance();
  },

  download(worldNum){
    const p = this.progress[worldNum];
    if(!p || p.photos.length === 0) return;
    const link = document.createElement('a');
    link.download = `mundo${worldNum}.png`;
    link.href = p.selfie || p.photos[0].data;
    link.click();
  },

  getProgress(worldNum){
    return this.progress[worldNum] || {coins:0, stars:0, photos:[], selfie:null, done:false};
  }
};
