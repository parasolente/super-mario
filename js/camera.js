const CameraManager = {
    overlay: document.getElementById('cameraOverlay'),
    video: document.getElementById('cameraFeed'),
    stream: null,
    currentWorld: 1,
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

    async open(worldNum){
        this.currentWorld = worldNum;
        this.initWorld(worldNum);
        document.getElementById('cameraWorldNum').textContent = worldNum;
        document.getElementById('btnCoin').style.display = 'flex';
        document.getElementById('btnStar').style.display = 'flex';
        document.getElementById('cameraFrameOverlay').src = `assets/images/frames/marco_mundo${worldNum}.png`;
        this.updateProgress();
        this.overlay.classList.add('show');
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}, audio:false});
            this.video.srcObject = this.stream;
            await this.video.play();
        } catch(e) {
            // Sin camara: el overlay se muestra igual, capture usara placeholder
        }
    },

    close(){
        if(this.stream){
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }
        this.video.srcObject = null;
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

        const {w, h} = this.getCaptureSize();
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        if(this.stream && this.video.videoWidth){
            ctx.drawImage(this.video, 0, 0, w, h);
        } else {
            ctx.fillStyle = '#FFF9E6';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#5C3A21';
            ctx.font = '24px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Foto ' + (type === 'coin' ? 'Moneda' : 'Estrella'), w/2, h/2);
            ctx.fillText('MUNDO ' + this.currentWorld, w/2, h/2 + 40);
        }

        const marcoImg = await this.loadMarco(this.currentWorld);
        ctx.drawImage(marcoImg, 0, 0, w, h);

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
                fallback.width = 1; fallback.height = 1;
                resolve(fallback);
            };
            img.src = `assets/images/frames/marco_mundo${worldNum}.png`;
        });
    },

    async takeSelfie(){
        this.sfx.currentTime = 0;
        this.sfx.play();

        const {w, h} = this.getCaptureSize();
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        if(this.stream && this.video.videoWidth){
            ctx.drawImage(this.video, 0, 0, w, h);
        } else {
            ctx.fillStyle = '#FFF9E6';
            ctx.fillRect(0, 0, w, h);
            ctx.fillStyle = '#5C3A21';
            ctx.font = '24px Fredoka, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Selfie Final MUNDO ' + this.currentWorld, w/2, h/2);
        }

        const marcoImg = await this.loadMarco(this.currentWorld);
        ctx.drawImage(marcoImg, 0, 0, w, h);

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