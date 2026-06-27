(function(){
    const screen = document.getElementById('loadingScreen');
    const bar = document.getElementById('progressBar');
    let progress = 0, resourcesLoaded = false, progressReached = false;

    function finish(){
        if(!resourcesLoaded || !progressReached) return;
        AudioManager.stopLoading();
        screen.classList.add('hidden');
        AudioManager.startWorldMusic();
        Navigation.showWelcome();
    }

    function simulate(){
        if(progress < 85){
            progress += Math.random() * 10 + 3;
            if(progress > 85) progress = 85;
            bar.style.width = progress + '%';
            setTimeout(simulate, 200 + Math.random() * 300);
        } else {
            progressReached = true;
            if(resourcesLoaded) bar.style.width = '100%';
            finish();
        }
    }
    simulate();

    window.addEventListener('load', () => {
        resourcesLoaded = true;
        if(progressReached){
            bar.style.width = '100%';
            setTimeout(finish, 300);
        }
    });
})();