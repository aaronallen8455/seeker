var loading = $('<div>', { //create the loading window while images are loading.
    text: 'Loading...',
    css: {
        position: 'fixed',
        left: '50%',
        top: '50%',
        border: 'solid black',
        backgroundColor: 'white',
        padding: '40px',
        fontSize: '200%'
    }
});
      
document.addEventListener('readystatechange', function () { //display and size the loading window when DOM is interactive.
    if (document.readyState == 'loading'||'interactive'){
        loading.appendTo(document.body);
        loading.css({marginLeft: loading.width()/-2 + 'px', marginTop: loading.height()/-2 + 'px'});
    }
}, false);

window.onload = function () {
    loading.remove(); //remove the loading window when page is done loading.
    
    var seeker = document.getElementsByClassName('seeker');
    var boundary = document.getElementById('boundary');
    var mouse = {x: 0, y: 0};
    var speed = parseFloat(location.search.match(/[.]?\d+[\.]?[\d]{0,2}/)) || 1.41; //this value squared is the number of pixels traveled per tick of the move towards function.
    var timer; // used to calculate finish time.
    (new Image()).src = 'explosion.gif'; //preload explosion gif
    
    var image = document.createElement('img'); //this image is only used to get a width and height from.
    image.src = 'seekerlvl' + document.URL.match(/seekerlvl\d+/)[0].match(/\d+/) + '.jpg';
    $(image).css({
        visibility: 'hidden',
        position: 'absolute',
        left: '0px',
        top: '0px'
    });
    document.body.appendChild(image); 
    boundary.style.width = image.offsetWidth + 'px'; //set the dimensions of boundary to the lvl image.
    boundary.style.height = image.offsetHeight + 'px';
    
    var messageBox = document.createElement('div'); //The div in which game messages are displayed.
    document.body.appendChild(messageBox);
    $(messageBox).css({
        display: 'none',
        position: 'fixed',
        left: '50%',
        top: '50%',
        border: 'solid black',
        zIndex: 100,
        backgroundColor: 'white',
        padding: '40px',
        cursor: 'default'
    });
    var messageBoxText = document.createElement('div');
    messageBoxText.style.position = 'inline';
    messageBoxText.style.fontSize = '200%';
    var messageBoxButton = document.createElement('button');
    messageBoxButton.innerHTML = 'Ok';
    messageBoxButton.onclick = function() {messageBox.style.display = 'none'};
    messageBoxButton.style.position = 'absolute';
    messageBoxButton.style.bottom = '5px';
    messageBoxButton.style.right = '5px';
    var messageBoxRetryButton = document.createElement('button');
    messageBoxRetryButton.innerHTML = 'Re-Play';
    messageBoxRetryButton.onclick = function() {
        bgMusic.play();
        location.reload();
    };
    messageBoxRetryButton.style.position = 'absolute';
    messageBoxRetryButton.style.left = '5px';
    messageBoxRetryButton.style.bottom = '5px';
    var messageBoxNextButton = document.createElement('button');
    messageBoxNextButton.innerHTML = 'Next Level';
    messageBoxNextButton.onclick = getNextLevel;
    messageBoxNextButton.style.position = 'absolute';
    messageBoxNextButton.style.right = '5px';
    messageBoxNextButton.style.bottom = '5px';
    messageBox.appendChild(messageBoxText);
    
    var explode = $('<img>').css({position: 'absolute', opacity: .9}); //the explosion graphic
    
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioCtx = new AudioContext();
    var gain = audioCtx.createGain(); // main volume
    gain.gain.value = 1;
    gain.connect(audioCtx.destination);
    var victoryBuff = {}; //holds the victory fanfare
    var failBuff = {};
    var bombBuff = {};
    var deathBuff = {};

    function loadSound(x, url) { //loads an audio file into the buffer.
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            audioCtx.decodeAudioData(request.response, function(buffer) {
                x.buff = buffer;
            });
        }
        request.send();
    }
    
    loadSound(victoryBuff, 'seekerVictory.ogg');
    loadSound(failBuff, 'seekerFailure.ogg');
    loadSound(bombBuff, 'seekerExplode.mp3');
    loadSound(deathBuff, 'seekerDeath.mp3');
    
    function playSound(x, time, vol, rate) { //play a sound 'x' with these parameters
        time = time || 0;
        vol = vol || 1;
        rate = rate || 1;
        var source = audioCtx.createBufferSource();
        source.buffer = x.buff;
        var volume = audioCtx.createGain();
        volume.gain.value = vol;
        volume.connect(gain);
        source.connect(volume);
        source.playbackRate.value = rate;
        source.start(audioCtx.currentTime + time);
    }
    
    document.addEventListener('keydown', function(e) { //show main menu
        if(parent.showMenu(e) && !seeker[0].started) {
            location.assign('menu.html');
            bgMusic.play();
        }
    });
    
    var bgMusic = parent.bgMusic;
    /*bgMusic.loop = true;
    bgMusic.volume = .7;
    bgMusic.play();*/
    
    var actionMusic = new Audio('seekerActionMusic.ogg');
    function playActionMusic() {
        bgMusic.pause();
        actionMusic.currentTime = 0;
        actionMusic.play();
    }
    function stopActionMusic() { //stops the action music and eases the bg music back in.
        actionMusic.pause();
        setTimeout(function(){
            if(!seeker[0].started) {
                bgMusic.play();
                bgMusic.volume = 0;
                function ramp() {
                    bgMusic.volume += .025;
                    if(bgMusic.volume<.7)
                        setTimeout(ramp, 50);
                }
                ramp();
            }
        },3500);
    }
    
    var autoScrollWorker = new Worker('seekerTimer.js');
    autoScrollWorker.postMessage({cmd: 'start', ms: 35});
    autoScrollWorker.onmessage = autoScroll;
    
    function autoScroll() { //autoscrolls for screens that are smaller than the map.
        window.requestAnimationFrame(function() {
        var w = window;
            if (mouse.y <= $(w).height() * .15) {
                w.scrollTo(w.pageXOffset , w.pageYOffset - 4*(($(w).height() * .15 - mouse.y)/($(w).height() * .15)));
            }else if (mouse.y >= $(w).height() *.85) {
                w.scrollTo(w.pageXOffset , w.pageYOffset + Math.ceil(4*((mouse.y - $(w).height() * .85)/($(w).height() * .15))));
            }
            if (mouse.x <= $(w).width() * .08) {
                w.scrollTo(w.pageXOffset - 4*(($(w).width() * .08 - mouse.x)/($(w).width() * .08)), w.pageYOffset);
            }else if (mouse.x >= $(w).width() * .92) {
                w.scrollTo(w.pageXOffset + Math.ceil(4*((mouse.x - $(w).width() * .92)/($(w).width() * .08))), w.pageYOffset);
            }
        });
    }
    
    function getNextLevel() { //navigates to the next level
        bgMusic.play() //if they click next before the bg music can come back in.
        var num = parseFloat(document.URL.match(/seekerlvl\d+/)[0].match(/\d+/)); //get lvl number
        num++;
        var request = new XMLHttpRequest();
        request.open('HEAD', 'seekerlvl' + num + '.html'); //See if the next level exists.
        request.onreadystatechange = function() {
            if (request.readyState !== 4) return;
            if (request.status === 200) { //if it does, go to the next level.
                location.assign(document.URL.replace(/seekerlvl\d+/, 'seekerlvl' + num));
            }else{ //if it doesn't, display this message:
                message('No more levels :(<br><font size="3">Check back soon, new levels are added periodically!');
                messageBox.removeChild(messageBoxNextButton);
                return; 
            }
        };
        request.send(null);
    }
                                               
    function message(str) { //displays a message dialogue to the player.
        messageBox.style.display = 'block';
        messageBoxText.innerHTML = str;
        messageBox.appendChild(messageBoxButton);
        messageBoxButton.focus();
        messageBox.style.marginLeft = messageBox.offsetWidth/-2 + 'px';
        messageBox.style.marginTop = messageBox.offsetHeight/-2 + 'px';
    }
    
    function getScrollOffsets() {
        var w = window;
        return {x: w.pageXOffset, y: w.pageYOffset}; //gives the amount of space in px that the window is scrolled by.
    }
    
    var bricks = document.getElementsByClassName('brick'); //the wall elements
    
    for(var i=0; i<bricks.length; i++){ //add crash event to walls
        /*if (i%2 === 0) { //this is for paring down the number of bricks to improve performance. Used while lvl editing.
            bricks[i].parentElement.removeChild(bricks[i]);
            continue;
        }*/
        bricks[i].onmouseover = hitWall;
    }
    
    function hitWall(e) {
        if(seeker[0].started == true){
            if (e) e.stopPropagation();
            stopSeeker();
            message('You hit the wall!');
            stopActionMusic();
            playSound(failBuff, .94);
            playSound(bombBuff,0,.75,1.9);
            removeoob();
            explode.appendTo(document.body).css({left: mouse.x + window.pageXOffset - 50 + 'px',top: mouse.y + window.pageYOffset -87 + 'px', zIndex: 20}).attr('src', 'explosion.gif');
            setTimeout(function() { explode.replaceWith('').attr('src', '');}, 1500);
        }
    }
    
    var spinners = document.getElementsByClassName('spinner');
    
    for (var i=0; i<spinners.length; i++){ //orient blades
        for (var j=0; j<spinners[i].children.length; j++) {
            if (spinners[i].children[j].className.indexOf('blade') != -1) { 
                spinners[i].children[j].style.transform = 'rotate(' + j*(180/spinners[i].children.length) + 'deg)';
            }
        }
    }
    
    function spinner() { //initiates the spinner elements.
        for (var i = 0; i < spinners.length; i++) {
            if (!spinners[i].rotation) spinners[i].rotation = 0;
            spinners[i].speed = parseFloat(spinners[i].getAttribute('speed')); //the speed attr is the degrees of rotation per 'spin.'
            spinners[i].worker = new Worker('seekerTimer.js');
            spinners[i].worker.p = spinners[i];
            spinners[i].worker.postMessage({'cmd': 'start', 'ms': 17});
            spinners[i].worker.onmessage = function() {spin(this.p)};
        }
    }
    
    function spin(spinner) {
        window.requestAnimationFrame(function(){
            spinner.style.transform = 'rotate(' + spinner.rotation + 'deg)';
            spinner.rotation = spinner.rotation + spinner.speed; 
            //if (RegExp('blade').test(document.elementFromPoint(mouse.x, mouse.y).className)) hitWall();
            if (document.elementFromPoint(mouse.x, mouse.y).className.indexOf('blade') >= 0) hitWall();
        });
    }
    
    var canvas = document.getElementsByClassName('lightRadius'); //If it's a dark zone with light radius
    
    if (canvas.length) {
        for (var i=0; i<canvas.length; i++) { //initialize the light radius canvas.
            canvas[i].style.position = 'absolute';
            canvas[i].style.left = 0;
            canvas[i].style.top = 0;
            canvas[i].width = 600;
            canvas[i].height = 600;
            canvas[i].style.border = '1200px solid black'; //the border fills out the rest of the scene with black.
            var c = canvas[i].getContext('2d');
            var fill = c.createRadialGradient(300,300,75,300,300,300); //only the transparent gradient is visible.
            fill.addColorStop(0.0, 'transparent');
            fill.addColorStop(1.0, 'black');
            c.fillStyle = fill;
            c.fillRect(0, 0, 600, 600);
        }

        function lightRadius() { //makes the light radius canvas center on the mouse.
            if (seeker[0].started) {
                for (var i=0; i<canvas.length; i++) {
                    canvas[i].style.left = mouse.x + window.pageXOffset - 1500 + 'px';
                    canvas[i].style.top = mouse.y + window.pageYOffset - 1500 + 'px';
                }
            }
        }
        document.addEventListener('mousemove', lightRadius, true);
    }
    
    updateMouse = (function() {
        var a = {x: 0, y: 0};
        var b = {x: 0, y: 0};
        var check = true;
        function updateMouse(e) { //update mouse coordinates on move.
            
            mouse.x = b.x = e.clientX;
            mouse.y = b.y = e.clientY;
           
            if ((mouse.x > $(window).width() || mouse.x < 0 || mouse.y > $(window).height() || mouse.y < 0) && seeker[0].started) oob(); //if player is holding mousedown.
            
            if(check){
                check = false;
                setTimeout(function() { //check current mouse coords with coords from 100 ms ago and evoke cheater function if the distance is large enough.
                    //console.log(a.x-b.x);
                    if(((Math.abs(a.x-b.x) > 50 ) || (Math.abs(a.y-b.y) > 50)) && seeker[0].started) {
                        cheater(a,b);
                        //console.log(a.x +','+a.y +' ' + b.x +',' + b.y);
                    }
                    a.x = mouse.x;
                    a.y = mouse.y;
                    check = true;
                }, 100);
            }
        }
        return updateMouse;
    }());
    
    function redsquare(x,y) { // if enabled, draws red squares to show the cheaterpath lines for debugging.
        var square = document.createElement('div');
        square.style.backgroundColor = 'red';
        square.style.width = square.style.height = '5px';
        square.style.position = 'absolute';
        square.style.left = x + 'px';
        square.style.top = y + 'px';
        boundary.appendChild(square);
        setTimeout(function() {
            boundary.removeChild(square);
        }, 700);
    }
    
    function cheater(a,b) { //draw line between a and b and see if theres a brick along that line. 
        var diffX = a.x - b.x; //will catch most wall jumping behavior.
        var diffY = a.y - b.y;
        var x = 10 * (Math.pow(Math.sqrt(Math.pow(diffX,2) + Math.pow(diffY,2)),-1)); //the rise,run factor.
        var points = []; //check points on line
        var n = 0; //used in recursive timeouts.
        
        function checker() { //checks each point and recurses for next one
            if (document.elementFromPoint(points[n][0] - diffX * x, points[n][1] - diffY * x).className == 'brick') {
                mouse.x = points[n][0];
                mouse.y = points[n][1];
                hitWall();
                n = points.length;
            }
            //redsquare(points[n][0], points[n][1]);
            n++;
            if (n < points.length) setTimeout(checker, 0); //timeouts are used for improved performance in chrome.
        }
        
        if (a.x - b.x > 0) { //generate the line points.
            while (a.x - b.x > 0) {
                points.push([a.x,a.y])
                a.x -= diffX * x;
                a.y -= diffY * x;
            }
            setTimeout(checker, 0);
        }else if (a.x - b.x < 0) {
            while (a.x - b.x < 0) {
                points.push([a.x,a.y]);
                a.x -= diffX * x;
                a.y -= diffY * x;
            }
            setTimeout(checker, 0); //begin checking the line.
        }
    }                     
    
    document.addEventListener('mousemove',updateMouse,true); //update mouse coordinates on move.
    
    document.addEventListener('wheel', function(e) { //prevent mousewheel scroll cheating
        e.preventDefault();
        return false;
    }, false);
    
    document.onkeydown = function(e) { //prevent keyboard scroll cheating
        var keys = {37: 1, 38: 1, 39: 1, 40: 1};
        if (keys[e.keyCode]) {
            e.preventDefault();
            return false;
        }
    }
    
    for (var i = 0; i < seeker.length; i++) {
        seeker[i].startingPos = {'x':seeker[i].offsetLeft, 'y':seeker[i].offsetTop};
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.keyCode == 32 && !seeker[0].started) {
            for (var i=0; i<seeker.length; i++) {
                $(seeker[i]).animate({
                    left: seeker[i].startingPos.x,
                    top: seeker[i].startingPos.y
                }, 400);
            }
            e.preventDefault();
        }
    }, false);
    
    var removeoob = function() { //a function to remove the oob event listener and mouse up event.
        $(document).off('mouseup');
        $(boundary).off('mouseleave');
    } 
    
    var starter = document.getElementById('starter'); //the start button.
    starter.onmouseover = function() {if (messageBox.style.display == 'none') starter.addEventListener('mousedown',startSeeker,false);}
    starter.onmouseout = function(e) {
        starter.removeEventListener('mousedown',startSeeker,false);
        e.stopPropagation();
    }
    
    function startSeeker(){ //initiate all seekers
        for (var i=0; i<seeker.length; i++) {
            if (!seeker[i].started || seeker[i].started == false) {
                seeker[i].worker = new Worker('seekerTimer.js');
                seeker[i].worker.p = seeker[i];
                seeker[i].worker.postMessage({'cmd': 'start', 'ms': 10});
                seeker[i].worker.onmessage = function() {moveTowards(this.p, mouse);};
            }
            
            //if (!seeker[i].started || seeker[i].started == false) seeker[i].interval = setInterval(moveTowards, 10, seeker[i], mouse);
            seeker[i].started = true;
        }
        playActionMusic();
        if (timer === undefined) timer = new Date();
        $(document).mouseup(mouseUp);
        $(boundary).mouseleave(oob);
        spinner(); //start spinners if any.
        boundary.style.cursor = "url('seeker.cur'), crosshair"; //change cursor
        return false
    }
    
    function mouseUp() {
        message('The mouse button must be held down<br>until you reach the finish!');
        stopActionMusic();
        playSound(failBuff);
        stopSeeker();
        removeoob();
    }
    
    function oob(e) { //out of bounds when mouse leaves window
        if (e.relatedTarget.className.indexOf('seeker') == -1) { //seeker will be outside boundary for rotating levels.
            message('Out of Bounds!');
            stopActionMusic();
            playSound(failBuff);
            stopSeeker();
            removeoob();
            e.stopPropagation();
        }
    }
    
    function stopSeeker() { //stop the seekers.
        for (var i=0; i<seeker.length; i++){
            
            seeker[i].worker.terminate();
            
            //clearInterval(seeker[i].interval);
            seeker[i].started = false;
            seeker[i].x = undefined;
            seeker[i].y = undefined;
        }
        for (var i=0; i<spinners.length; i++) {
            spinners[i].rotation = spinners[i].rotation % 360;
            
            spinners[i].worker.terminate();
            
            //clearInterval(spinners[i].interval);
        }
        boundary.style.cursor = 'default';
    }
    
    function moveTowards(seeker, mouse) { //function that controls the seeker element
        if (!seeker.x) seeker.x = seeker.offsetLeft;//get coordinates of the center of seeker element.
        if (!seeker.y) seeker.y = seeker.offsetTop;
        var scroll = getScrollOffsets();
        var targetX = mouse.x + scroll.x; //get mouse location in document coordinates
        var targetY = mouse.y + scroll.y;
        var diffX = seeker.x - targetX +100; //get the distance between seeker and target
        var diffY = seeker.y - targetY +100;
        var x = Math.pow(Math.sqrt(Math.pow(diffX,2) + Math.pow(diffY,2)),-1); //use pythagorean theorum to calculate x and y distance to travel 1px in any direction.
        x *= speed; //speed multiplier
        var run = (diffX*x)*.0625;
        var rise = (diffY*x)*.0625;
        //Give the seeker delayed reactions:
        setTimeout(function(){seeker.x -= 7*run;}, 600);
        setTimeout(function(){seeker.x -= 4*run;}, 400);
        setTimeout(function(){seeker.x -= 3*run;}, 200);
        setTimeout(function(){seeker.x -= 2*run;}, 0);
        
        setTimeout(function(){seeker.y -= 7*rise;}, 600);
        setTimeout(function(){seeker.y -= 4*rise;}, 400);
        setTimeout(function(){seeker.y -= 3*rise;}, 200);
        setTimeout(function(){seeker.y -= 2*rise;}, 0);
        window.requestAnimationFrame(function(){
            seeker.style.left = seeker.x + 'px'; //move seeker element towards target
            seeker.style.top = seeker.y + 'px';
        });
        if ((mouse.x + scroll.x >= seeker.offsetLeft) && (mouse.x + scroll.x <= seeker.offsetWidth + seeker.offsetLeft) && (mouse.y + scroll.y >= seeker.offsetTop) && (mouse.y + scroll.y <= seeker.offsetHeight + seeker.offsetTop)) {
            gotcha(seeker); //the 'gotcha' conditional. Works much better than a mouseover event.
        }
    }
    
    function gotcha(seeker) { //triggered when the seeker touches the mouse.
        stopSeeker();
        removeoob();
        message('Gotcha!');
        stopActionMusic();
        playSound(deathBuff,0,.63);
        playSound(failBuff, .8);
        $(seeker).clone().insertBefore(seeker).css({ //creates a red splash effect.
            zIndex: 19,
            backgroundImage: '',
            backgroundColor: '#CC0000',
            width: '+=2px',
            height: '+=2px',
            left: '-=1px',
            top: '-=1px',
            opacity: .5
        }).animate({
            opacity: 0,
            width: '+=50px',
            height: '+=50px',
            left: '-=25px',
            top: '-=25px'
        }, 500).queue(function () {this.remove()});
    } 
    
    var finishButton = document.getElementById('finish'); //the finish button
    finishButton.onmouseover = complete;
    
    function complete(e) { //lvl completed
        if (seeker[0].started) {
            e.stopPropagation();
            stopSeeker();
            removeoob();
            stopActionMusic();
            playSound(victoryBuff);
            var time = (new Date() - timer)/1000;
            time = Math.floor(time/60) + ' min, ' + (time%60).toFixed(2) + ' sec'; //time taken to beat level.
            message('Level ' + document.URL.match(/seekerlvl\d+/)[0].match(/\d+/) + ' Completed!<br><font size="3">Time: ' + time + '</font>');
            messageBox.appendChild(messageBoxNextButton);
            messageBox.appendChild(messageBoxRetryButton);
            messageBox.removeChild(messageBoxButton);
            messageBoxNextButton.focus();
        }
    }
}