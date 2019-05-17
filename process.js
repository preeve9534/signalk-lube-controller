var timer = null;

process.on('message', (message) => {
    if (message.action == "START") {
        timer = setTimeout(startstart, (((message.sdl == 0)?1:message.sdl) * 1000), message.sdr, message.idl, message.idr);
    } else if (message.action = "STOP") {
        process.send({ "action": 0 });
    }
});

function startstart(sdr, idl, idr) {
    if (sdr != 0) process.send({ "action": 1 });
    setTimeout(startstop, (((sdr == 0)?1:sdr) * 1000), idl, idr);
}

function startstop(idl, idr) {
    process.send({ "action": 0 });
    setInterval(intervalstart, (((idl == 0)?1:idl) * 1000), idr);
}

function intervalstart(idr) {
    if (idr != 0) process.send({ "action": 1 });
    setTimeout(intervalstop, (((idr == 0)?1:idr) * 1000));
}

function intervalstop() {
    process.send({ "action": 0 });
}

