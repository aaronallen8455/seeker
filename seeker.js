window.onload = function () {
    var seeker = document.getElementsByClassName('seeker');
    var boundary = document.getElementById('boundary');
    var mouse = {x: 0, y: 0};
    var speed = location.search.match(/[.]?\d+/) || 1.41; //this value squared is the number of pixels traveled per tick of the move towards function.
    
    var timer; // used to calculate finish time.
    
    var image = document.createElement('img'); //this image is only used to get a width and height from.
    image.src = 'seekerlvl' + document.URL.match(/seekerlvl\d+/)[0].match(/\d+/) + '.jpg';
    image.style.visibility = 'hidden';
    image.style.position = 'absolute';
    image.style.left = '0px';
    image.style.top = '0px';
    document.body.appendChild(image); 
    /*
    boundary.style.width = image.offsetWidth + 'px'; //set the dimensions of boundary to the lvl image.
    boundary.style.height = image.offsetHeight + 'px';
    */
    console.log('test');
    var messageBox = document.createElement('div'); //The div in which game messages are displayed.
    messageBox.style.display = 'none';
    messageBox.style.position = 'absolute';
    messageBox.style.left = '35%';
    messageBox.style.top = '30%';
    messageBox.style.border = 'solid black';
    messageBox.style.zIndex = 100;
    messageBox.style.backgroundColor = 'white';
    messageBox.style.padding = '40px';
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
    messageBoxRetryButton.onclick = function() {location.reload()};
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
    document.body.appendChild(messageBox);
    
    setInterval(autoScroll, 35); //autoscrolls for screens that are smaller than the map.
    
    function autoScroll() {
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
    }
    
    function getNextLevel() { //navigates to the next level
        var num = parseFloat(document.URL.match(/seekerlvl\d+/)[0].match(/\d+/));
        num++;
        location.assign(document.URL.replace(/seekerlvl\d+/, 'seekerlvl' + num));
    }
                                               
    function message(str) { //displays a message dialogue to the player.
        messageBox.style.display = 'block';
        messageBoxText.innerHTML = str;
        messageBox.appendChild(messageBoxButton);
        messageBoxButton.focus();
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
            removeoob();
        }
    }
    
    //this code block is used for drawing a maze in edit mode. Should be commented out for the player.
    /*
    function createBrick(e) {
        if (e.shiftKey) {
            if(document.elementFromPoint(mouse.x,mouse.y).className == 'brick') {
                document.elementFromPoint(mouse.x,mouse.y).parentElement.removeChild(document.elementFromPoint(mouse.x,mouse.y));
            }
        }else{
            var brick = document.createElement('div');
            brick.style.width = '10px';
            brick.style.height = '10px';
            brick.style.position = 'absolute';
            brick.style.backgroundColor = 'blue';
            brick.style.left = e.clientX + window.pageXOffset + 'px';
            brick.style.top = e.clientY + window.pageYOffset + 'px';
            brick.className = 'brick';
            boundary.appendChild(brick);
        }
    }
    
    document.onmousedown = function(e) {
        document.addEventListener('mousemove', createBrick, false);
    }
    document.onmouseup = function() {
        document.removeEventListener('mousemove', createBrick, false);
    }
    */
    
    
    updateMouse = (function() {
        var a = {x: 0, y: 0};
        var b = {x: 0, y: 0};
        var check = true;
        function updateMouse(e) { //update mouse coordinates on move.
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            if ((mouse.x > $(window).width() || mouse.x < 0 || mouse.y > $(window).height() || mouse.y < 0) && seeker[0].started) oob(); //if player is holding mousedown.
    
            if (check === true) { //check if player moved mouse too fast (to catch wall jumping)
                a.x = e.clientX;
                a.y = e.clientY;
                check = false;
            }else{
                b.x = e.clientX;
                b.y = e.clientY;
                check = true;
            }
            if(((Math.abs(a.x-b.x) > 20) || (Math.abs(a.y-b.y) > 20)) && seeker[0].started) {
                cheater(a,b);
            }
        }
        return updateMouse;
    }());
    
    function cheater(a,b) { //draw line between a and b and see if theres a brick along that line. 
        var diffX = a.x - b.x; //will catch most wall jumping behavior.
        var diffY = a.y - b.y;
        var x = 3 * (Math.pow(Math.sqrt(Math.pow(diffX,2) + Math.pow(diffY,2)),-1));
        if (Math.max((a.x+a.y), (b.x+b.y)) == (b.x+b.y)) {
            while (Math.max((a.x+a.y), (b.x+b.y)) == (b.x + b.y)) {
                if (document.elementFromPoint(Math.round(a.x - diffX * x),Math.round(a.y - diffY * x)).className === 'brick') {
                    //if (document.elementFromPoint(Math.round(a.x - diffX * x),Math.round(a.y - diffY * x)).className == 'brick') {
                        hitWall();
                        break;
                    //}
                }
                a.x -= diffX * x;
                a.y -= diffY * x;
            }
        }else if (Math.max((a.x+a.y), (b.x+b.y)) == (a.x+a.y)) {
            while (Math.max((a.x+a.y), (b.x+b.y)) == (a.x+a.y)) {
                if (document.elementFromPoint(Math.round(a.x - diffX * x),Math.round(a.y - diffY * x)).className === 'brick') {
                    //if (document.elementFromPoint(Math.round(a.x - diffX * x),Math.round(a.y - diffY * x)).className == 'brick') {
                        hitWall();
                        break;
                    //}
                }
                a.x -= diffX * x;
                a.y -= diffY * x;
            }
        }
    }
    
    document.addEventListener('mousemove',updateMouse,true);
    
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
            if (!seeker[i].started || seeker[i].started == false) seeker[i].interval = setInterval(moveTowards, 10, seeker[i], mouse);
            seeker[i].started = true;
        }
        if (timer === undefined) timer = new Date();
        $(document).mouseup(mouseUp);
        $(boundary).mouseleave(oob);
        return false
    }
    
    function mouseUp() {
        message('The mouse button must be held down<br>until you reach the finish!');
        stopSeeker();
        removeoob();
    }
    
    function oob(e) { //out of bounds when mouse leaves window
        message('Out of Bounds!');
        stopSeeker();
        removeoob();
        e.stopPropagation();
    }
    
    function stopSeeker() { //stop the seekers.
        for (var i=0; i<seeker.length; i++){
            clearInterval(seeker[i].interval);
            seeker[i].started = false;
            seeker[i].x = undefined;
            seeker[i].y = undefined;
        }
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
        seeker.style.left = seeker.x + 'px'; //move seeker element towards target
        seeker.style.top = seeker.y + 'px';
        if ((mouse.x + scroll.x >= seeker.offsetLeft) && (mouse.x + scroll.x <= seeker.offsetWidth + seeker.offsetLeft) && (mouse.y + scroll.y >= seeker.offsetTop) && (mouse.y + scroll.y <= seeker.offsetHeight + seeker.offsetTop)) {
            gotcha(); //the 'gotcha' conditional. Works much better than a mouseover event.
        }
    }
    
    function gotcha() { //triggered when the seeker touches the mouse.
        stopSeeker();
        removeoob();
        message('Gotcha!');
        
    } 
    
    var finishButton = document.getElementById('finish'); //the finish button
    finishButton.onmouseover = function() {finishButton.addEventListener('mouseup', complete, false);}
    finishButton.onmouseout = function(e) {
        finishButton.removeEventListener('mouseup', complete, false);
        e.stopPropagation();
    }
    
    function complete(e) { //lvl completed
        if (seeker[0].started) {
            e.stopPropagation();
            stopSeeker();
            removeoob();
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