# signalk-lube-controller

Signal K Node server plugin designed to control a prop-shaft lubrication pump, but suitable for a range of process control options.  The general scheme of operation is:

1. Wait until a "START EVENT" is detected on the Signal K bus.  For shaft lubrication purposes this might be an ignition on message.

2. Emit a "START PROCESS" message and wait for a specified period of time before emitting the "STOP PROCESS" message.

3. Enter a loop which cycles "OFF PERIOD" and "ON PERIOD" states, issuing "START PROCESS" and "STOP PROCESS" messages as necessary.

The 
