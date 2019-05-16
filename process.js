var edl = 0;
var edr = 0;

process.on('message', (message) => {
    console.log('[child] received message from server:');
    edl = message.edl;
    edr = message.edr;

    setTimeout(startstart, (((message.sdl == 0)?1:message.sdl) * 1000), message.sdr, message.idl, message.idr);
});

function startstart(sdr, idl, idr) {
    if (sdr != 0) process.send({ "action": true });
    setTimeout(startstop, (((sdr == 0)?1:sdr) * 1000), idl, idr);
}

function startstop(idl, idr) {
    process.send({ "action": false });
    setInterval(intervalstart, (((idl == 0)?1:idl) * 1000), idr);
}

function intervalstart(idr) {
    if (idr != 0) process.send({ "action": true });
    setTimeout(intervalstop, (((idr == 0)?1:idr) * 1000));
}

function intervalstop() {
    process.send({ "action": false });
}

