var timeout = null;
var name = null;
var path = null;

process.on('message', (message) => {
    if (message.action == "START") {
        message.phases.forEach(phase => executephase(phase));
    } else if (message.action = "STOP") {
        if (timeout != null) { clearTimeout(timeout); timeout = null; }
        process.send({ "action": 0, "name": name, "path": path });
    }
});

async function executephase(phase) {
    for (var i = 0; i < phase.iterate; i++) {
        name = phase.name;
        path = phase.path;
        await sleep(phase.delay * 1000);
        process.send({ "action": 1, "name": phase.name, "path": phase.path });
        await sleep(phase.duration * 1000);
        process.send({ "action": 0, "name": phase.name, "path": phase.path });
    }
}

async function sleep(millis) {
    return new Promise(resolve => (timeout = setTimeout(resolve, millis)));
}
