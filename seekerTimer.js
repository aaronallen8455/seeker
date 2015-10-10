var interval;
onmessage = function(e) {
    if (e.data.cmd == 'start') {
        interval = setInterval( function() {
            postMessage(null);
        }, e.data.ms);
    }else {
        clearInterval(interval);
    }
};
        