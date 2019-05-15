process.on('message', (message) => {
    console.log('[child] received message from server:');
    var delay = message.firstdelay + 1;
    var duration = message.firstduration + 1;

    setTimeout(doit, (delay * 1000), duration, message.subsequentdelay + 1, message.subsequentduration + 1);
});

function doit(duration, sdelay, sduration) {
    process.send({ "action": true });
    setTimeout(stopit, (duration * 1000), sdelay, sduration);
}

function stopit(delay, duration) {
    process.send({ "action": false });
    setInterval(subsequent, (delay * 1000), duration);
}

function subsequent(duration) {
    process.send({ "action": true });
    setTimeout(stop, (duration * 1000));
}

function stop() {
    process.send({ "action": false });
}

