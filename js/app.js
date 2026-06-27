const Navigation = {
    currentWorld: 1,
    totalWorlds: 4,
    currentWelcomeStep: 1,
    totalWelcomeSteps: 4,

    init(){
        this.setupButtons();
        this.setupCameraButtons();
        this.setupDownloads();
        this.setupWelcomeButtons();
    },

    showWelcome(){
        document.getElementById('welcomeScreen').classList.add('show');
        this.currentWelcomeStep = 1;
        this.updateWelcomeStep(1);
    },

    updateWelcomeStep(step){
        document.querySelectorAll('.welcome-step').forEach(s => s.classList.remove('active'));
        const el = document.querySelector(`.welcome-step[data-step="${step}"]`);
        if(el) el.classList.add('active');

        document.querySelectorAll('.welcome-dot').forEach(d => d.classList.remove('active'));
        const dot = document.querySelector(`.welcome-dot[data-dot="${step}"]`);
        if(dot) dot.classList.add('active');

        const btn = document.getElementById('welcomeAction');
        btn.textContent = step >= this.totalWelcomeSteps ? 'Comenzar aventura' : 'Siguiente';
    },

    nextWelcomeStep(){
        if(this.currentWelcomeStep >= this.totalWelcomeSteps){
            this.startAdventure();
        } else {
            this.currentWelcomeStep++;
            this.updateWelcomeStep(this.currentWelcomeStep);
        }
    },

    startAdventure(){
        document.getElementById('welcomeScreen').classList.remove('show');
        this.showWorld(1);
    },

    showWorld(num){
        document.querySelectorAll('.world').forEach(w => w.classList.remove('active'));
        const world = document.querySelector(`.world[data-world="${num}"]`);
        if(world) world.classList.add('active');
        this.currentWorld = num;
        AudioManager.loadWorldMusic();
    },

    advance(){
        const next = this.currentWorld + 1;
        if(next > this.totalWorlds){
            this.showGallery();
        } else {
            this.showWorld(next);
        }
    },

    showGallery(){
        document.getElementById('galleryScreen').classList.add('show');
        for(let i = 1; i <= 4; i++){
            const thumb = document.getElementById(`thumb${i}`);
            const p = CameraManager.getProgress(i);
            if(p.selfie){
                thumb.style.backgroundImage = `url(${p.selfie})`;
                thumb.style.backgroundSize = 'cover';
                thumb.style.backgroundPosition = 'center';
            } else if(p.photos.length > 0){
                thumb.style.backgroundImage = `url(${p.photos[0].data})`;
                thumb.style.backgroundSize = 'cover';
                thumb.style.backgroundPosition = 'center';
            }
        }
    },

    setupWelcomeButtons(){
        document.getElementById('welcomeAction').addEventListener('click', () => this.nextWelcomeStep());
        document.querySelectorAll('.welcome-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const step = parseInt(dot.dataset.dot);
                if(step >= 1 && step <= this.totalWelcomeSteps){
                    this.currentWelcomeStep = step;
                    this.updateWelcomeStep(step);
                }
            });
        });
    },

    setupButtons(){
        document.querySelectorAll('.btn-green').forEach(btn => {
            btn.addEventListener('click', function(e){
                const s = new Audio('assets/audio/sfx/click.mp3');
                s.volume = 0.5; s.play();
                const world = this.closest('.world');
                if(!world) return;
                const num = parseInt(world.dataset.world);
                CameraManager.open(num).catch(() => {});
            });
        });
    },

    setupCameraButtons(){
        document.getElementById('cameraBack').addEventListener('click', () => {
            CameraManager.close();
            Navigation.showWorld(Navigation.currentWorld);
        });
        document.getElementById('cameraClose').addEventListener('click', () => {
            CameraManager.close();
            Navigation.showWorld(Navigation.currentWorld);
        });
        document.getElementById('btnCoin').addEventListener('click', () => CameraManager.capture('coin'));
        document.getElementById('btnStar').addEventListener('click', () => CameraManager.capture('star'));
        document.getElementById('btnSelfie').addEventListener('click', () => CameraManager.enterSelfieMode());
        document.getElementById('btnCaptureSelfie').addEventListener('click', () => CameraManager.captureSelfiePhoto());
    },

    setupDownloads(){
        document.querySelectorAll('.gallery-download').forEach(btn => {
            btn.addEventListener('click', function(){
                const m = parseInt(this.dataset.mundo);
                CameraManager.download(m);
            });
        });
    }
};

function fixVH(){
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
}
fixVH();
window.addEventListener('resize', fixVH);
document.addEventListener('DOMContentLoaded', () => Navigation.init());
