window.onload = function() {
    
    var main = document.getElementById('main');
    var skill = document.getElementById('skill');
    var selector = document.getElementById('selector');
    var starter = document.getElementById('starter');
    
    main.style.marginTop = ($(window).innerHeight()/2 - main.offsetHeight/2) + 'px';
    window.onresize = function() {
        main.style.marginTop = ($(window).innerHeight()/2 - main.offsetHeight/2) + 'px';
    };
    
    var c = skill.getContext('2d');
    c.moveTo(13,23);
    c.lineTo(313,23);
    c.lineCap = 'round'
    c.lineWidth = 26;
    c.stroke();
    c.moveTo(13,23);
    c.lineTo(313,23);
    var fill = c.createLinearGradient(13,0,313,0);
    fill.addColorStop(0.0, 'green');
    fill.addColorStop(0.5, 'yellow');
    fill.addColorStop(1.0, 'red');
    c.strokeStyle = fill;
    c.lineWidth = 24;
    c.lineCap = 'round';
    c.stroke();
    c.fillText('Easy',13,8);
    c.fillText('Normal',147,8);
    c.fillText('Hard',290,8);
    
    selector.style.left = parent.skillPos || (skill.offsetLeft - selector.offsetLeft) + 151 + 'px';
    selector.style.top = -35 + 'px';
    selector.onmousedown = function(e){drag(this, e);};
    
    function drag(elementToDrag, event) {
        var startX = event.clientX + window.pageXOffset; //the location of the mouse for the mousedown event (converted to document coordinates)
        var origX = elementToDrag.offsetLeft;  //the initial location of the element in doc coord.
        var deltaX = startX - selector.offsetLeft; //the amount of space between the mouse and the top left corner of the element.

        document.addEventListener("mousemove", moveHandler, true); //a capture event on document so that if the mouse is moved quickly out of element, it will still trigger the event.
        document.addEventListener("mouseup", upHandler, true);
        event.stopPropagation(); // prevent the mousedown event from bubbling
        event.preventDefault(); // prevent default action if applicable

        function moveHandler(e) {
            if (e.clientX - skill.offsetLeft - deltaX < -1) {
                elementToDrag.style.left = -1 + 'px';
                return;
            }
            if (e.clientX - skill.offsetLeft -deltaX > 299) {
                elementToDrag.style.left = 299 + 'px';
                return;
            }
            elementToDrag.style.left = (e.clientX - deltaX + window.pageXOffset - skill.offsetLeft) + "px";
            e.stopPropagation();
        }
        function upHandler(e) {
            document.removeEventListener("mousemove", moveHandler, true);
            document.removeEventListener("mouseup", upHandler, true);
            e.stopPropagation();
        }
    }
    
    starter.onclick = function() {
        parent.skillPos = selector.style.left;
        var x = (selector.offsetLeft - (skill.offsetLeft - 1))/50
        x = .008 * Math.pow(x, 3) + .2 * x + 1;
        x = x.toFixed(2);
        location.assign((parent.hist?parent.hist:'seekerlvl1.html') + '?' + x);
    }
    
}