var edl;
var edr;
var timeout = null;
var interval = null;

process.on('message', (message) => {
    if (message.action == "START") {
        edl = message.edl;
        edr = message.edr;
        timer = setTimeout(startstart, (((message.sdl == 0)?1:message.sdl) * 1000), message.sdr, message.idl, message.idr);
    } else if (message.action = "STOP") {
        if (timeout != null) { clearTimeout(timeout); timeout = null; }
        if (interval != null) { clearInterval(interval); interval = null; }
        process.send({ "action": 0 });
        if (edr > 0) timer = setTimeout(endstart, (((edl == 0)?1:edl) * 1000), edr);
    }
});

function startstart(sdr, idl, idr) {
    if (sdr != 0) process.send({ "action": 1 });
    timer = setTimeout(startstop, (((sdr == 0)?1:sdr) * 1000), idl, idr);
}

function startstop(idl, idr) {
    timer = null;
    process.send({ "action": 0 });
    interval = setInterval(intervalstart, (((idl == 0)?1:idl) * 1000), idr);
}

function intervalstart(idr) {
    if (idr != 0) process.send({ "action": 1 });
    setTimeout(intervalstop, (((idr == 0)?1:idr) * 1000));
}

function intervalstop() {
    interval = null;
    process.send({ "action": 0 });
}

function endstart(edr) {
    process.send({ "action": 1 });
    timeout = setTimeout(endstop, (edr * 1000));
}

function endstop() {
    timeout = null;
    process.send({ "action": 0 });
}
