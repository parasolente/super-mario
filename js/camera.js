const CameraManager = {
    overlay: document.getElementById('cameraOverlay'),
    video: document.getElementById('cameraFeed'),
    title: document.getElementById('cameraTitle'),
    border: document.getElementById('cameraBorder'),
    frame: document.getElementById('cameraFrame'),
    stream: null,
    currentWorld: 1,
    photos: {},
    worldNames: {1:'MUNDO 1',2:'MUNDO 2',3:'MUNDO 3',4:'MUNDO 4'},
    worldThemes: {1:'#43B047',2:'#ED6E03',3:'#016BC3',4:'#703087'},

    async open(worldNum){
        this.currentWorld = worldNum;
        this.title.textContent = this.worldNames[worldNum];
        this.border.style.borderColor = this.worldThemes[worldNum];
        this.border.style.boxShadow = `inset 0 0 0 6px ${this.worldThemes[worldNum]}`;
        this.overlay.classList.add('show');
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
            this.video.srcObject = this.stream;
        } catch(e){
            alert('No se pudo acceder a la cámara');
            this.close();
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

    capture(){
        const canvas = document.createElement('canvas');
        const w = this.video.videoWidth || 640;
        const h = this.video.videoHeight || 480;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0, w, h);
        const color = this.worldThemes[this.currentWorld];
        ctx.strokeStyle = color;
        ctx.lineWidth = 12;
        ctx.strokeRect(6, 6, w - 12, h - 12);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.strokeRect(14, 14, w - 28, h - 28);
        this.photos[this.currentWorld] = canvas.toDataURL('image/png');
        this.close();
        Navigation.advance();
    },

    download(worldNum){
        const data = this.photos[worldNum];
        if(!data) return;
        const link = document.createElement('a');
        link.download = `mundo${worldNum}.png`;
        link.href = data;
        link.click();
    }
};