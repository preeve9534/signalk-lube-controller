var timeout = null;
var name = null;
var path = null;

process.on('message', (message) => {
    if (message.action == "START") {
        message.activities.forEach(activity => executeActivity(activity));
    } else if (message.action = "STOP") {
        if (timeout != null) { clearTimeout(timeout); timeout = null; }
        process.send({ "action": 0, "name": name, "path": path });
    }
});

async function executeActivity(activity) {
    for (var i = 0; i < activity.iterate; i++) {
        name = activity.name;
        path = activity.path;
        await sleep(activity.delay * 1000);
        process.send({ "action": 1, "name": activity.name, "path": activity.path });
        await sleep(activity.duration * 1000);
        process.send({ "action": 0, "name": activity.name, "path": activity.path });
    }
}

async function sleep(millis) {
    return new Promise(resolve => (timeout = setTimeout(resolve, millis)));
}
