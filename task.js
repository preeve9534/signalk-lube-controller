var timeout = null;
var name = null;
var path = null;

process.on('message', (message) => {
    if (message.action == "START") {
        message.activities.forEach(activity => executeActivity(activity));
    } else if (message.action = "STOP") {
        // Immediately stop any currently executing activity.
        if (timeout != null) { clearTimeout(timeout); timeout = null; }
        process.send({ "action": 0, "name": name, "path": path });
        // If the just terminated activity wasn't the "END" activity then
        // execute any activity called "END".
        //if (name != "END") {
            // If there is an activity called "END", then execute it.
            //var endactivities = message.activities.filter(a => (a.name == "END"));
            //if (endactivities.length == 1) executeActivity(endactivities[0]);
        //}
    }
});

/**
 * Executes <activity> by sleeping for the defined delay period before calling
 * the parent process with a start action request.  Then sleep for the defined
 * duration before calling the parent process with a stop action request.
 * Iterate this as many times a is requested.
 *
 * activity: the activity { name, path, delay, duration, iterate }
 */ 
async function executeActivity(activity) {
    for (var i = 0; i < ((activity.iterate > 0)?activity.iterate:1) ; i++) {
        name = activity.name;
        path = activity.path;
        if (activity.delay > 0) await sleep(activity.delay * 1000);
        process.send({ "action": 1, "name": name, "path": path });
        if (activity.duration > 0) await sleep(activity.duration * 1000);
        process.send({ "action": 0, "name": name, "path": path });
    }
}

async function sleep(millis) {
    return new Promise(resolve => (timeout = setTimeout(resolve, millis)));
}
