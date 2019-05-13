# signalk-lube-controller

Signal K Node server plugin is a very simple process schedular designed to control a prop-shaft lubrication pump.

Operation of the controller is initiated by the presence of one or more user defined ALERT messages on the Signal K message bus.  My notification system is configured to raise an ALERT message when the main engine is started and also when the stern gland temperature exceeds a user defined critical value and these two notifications are used as triggers for signalk-lube-controller.

Once initiated the controller immediately issues an "execute process" notification and after some user-defined interval issues a "stop process" command.  Start and stop process commands are   and I The general scheme of operation is:

1. Wait until a "START EVENT" is detected on the Signal K bus.  For shaft lubrication purposes this might be an ignition on message.

2. Emit a "START PROCESS" message and wait for a specified period of time before emitting the "STOP PROCESS" message.

3. Enter a loop which cycles "OFF PERIOD" and "ON PERIOD" states, issuing "START PROCESS" and "STOP PROCESS" messages as necessary.

The 
