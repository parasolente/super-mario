const Navigation = {
    currentWorld: 1,
    totalWorlds: 4,

    init(){
        this.showWorld(1);
        this.setupButtons();
        this.setupCameraButtons();
        this.setupDownloads();
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

    setupButtons(){
        document.querySelectorAll('.btn-green').forEach(btn => {
            btn.addEventListener('click', function(e){
                const s = new Audio('assets/audio/sfx/click.mp3');
                s.volume = 0.5; s.play();
                const world = this.closest('.world');
                if(!world) return;
                const num = parseInt(world.dataset.world);
                CameraManager.open(num);
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
        document.getElementById('btnSelfie').addEventListener('click', () => CameraManager.takeSelfie());
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