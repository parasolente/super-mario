const AudioManager = {
    bgm: document.getElementById('bgm'),
    loadingBgm: document.getElementById('loadingBgm'),
    musicMap: {
        1: 'assets/audio/music/mundo1.mp3',
        2: 'assets/audio/music/mundo2.mp3',
        3: 'assets/audio/music/mundo3.mp3',
        4: 'assets/audio/music/mundo4.mp3'
    },

    init(){
        this.bgm.volume = 0.3;
        this.loadingBgm.volume = 0.3;
        this.loadingBgm.muted = true;
        this.tryPlayLoading();
        this.loadWorldMusic();
    },

    tryPlayLoading(){
        this.loadingBgm.play()
            .then(() => setTimeout(() => { this.loadingBgm.muted = false; }, 200))
            .catch(() => setTimeout(() => this.tryPlayLoading(), 300));
    },

    getActiveWorld(){
        return document.querySelector('.world.active')?.dataset.world || 1;
    },

    loadWorldMusic(){
        const w = this.getActiveWorld();
        const src = this.musicMap[w];
        if(src && !this.bgm.src.includes(src)){
            this.bgm.src = src;
            this.bgm.load();
        }
    },

    startWorldMusic(){
        this.bgm.src = this.musicMap[this.getActiveWorld()];
        this.bgm.load();
        this.bgm.muted = true;
        const tryPlay = () => {
            this.bgm.play()
                .then(() => setTimeout(() => { this.bgm.muted = false; }, 300))
                .catch(() => setTimeout(tryPlay, 300));
        };
        tryPlay();
    },

    stopLoading(){
        this.loadingBgm.pause();
        this.loadingBgm.currentTime = 0;
    }
};

AudioManager.init();