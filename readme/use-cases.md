## Use cases 
__Stern gland lubrication__

_Background_

_Beatrice_ was built with an electric lubrication pump which delivers grease
directly to the propeller shaft inboard bearing and stern gland.
The pump was installed so that it operated continuously whilst the engine
ignition switch was in the RUN position and so had a 100% duty cycle.

_Problem_

Although the lubrication pump was set to its minimum delivery rate, over the
course of a day's cruise an excessive ammount of grease (around 80cc) was
being forced through the stern gland and out into the engine-room bilge.

A typical (and perfectly effective) manual lubrication system would deliver a
maximum of just one or two cubic centimetres of grease over a similar timescale.

_Requirement_

Given that the lubrication pump was configured to its minimum delivery rate,
reducing the quantity of grease arriving at the stern gland could only be achieved
by modulating the operation of the lubrication pump, so the general requirement
of "pump less grease" became: modulate the running of the lubrication pump to
reduce the lubrication duty-cycle.

Process control timers suitable for duty cycle management are readily
available - similar to a central-heating programmer their normal application
is to control a relay which is often used simply to interrupt the power supply
to a connected device.
It turned out that the cheapest commercially available process control timer
had a cost of about 200 euros and this immediately triggered thoughts of a
home-brew solution, especially since there happened to be a spare channel
available on one of the ship's engine room NMEA 2000 relay output modules.
All that was really required was some programming effort and the obvious
platform was Signal K.

Using Signal K had the additional benefit of giving access to potentially
useful system data such as temperature measurements from the ship's stern-gland
temperature sensors.

I had already developed plugins which used the Signal K notificaion system
as a medium for interfacing physical I/O and it seemed natural to follow
through on this design principle.

_Implementation_

The lubrication process scheduler is triggered by _Beatrice_'s ignition
switch which is connected to a channel on oneof the helm NMEA 2000 switch
input modules.
[signalk-threshold-notifier](https://github.com/preeve9534/signalk-threshold-notifier/)
converts this switch signal into a Signal K ALERT notification which is in turn
used to activate the lubrication process scheduler.
In this way, the scheduler runs the process when the ignition switch is in
position I (RUN) and otherwise not.
I also use _signalk-threshold-notifier_ to generate an ALERT notification when
my stern gland temperature exceeds 60C and then use this to start the
lubrication schedule too.

In the lubrication process scheduler configuration start (delay = 0s,
duration = 300s) and iterative phases (delay = 1800s, duration = 120s) are
defined: the intention here is that when the ignition switch is turned on the
lubrication pump will immediately run for five minutes and will then run for
two minutes every thirty minutes.

The configuration also specifies the ALERT notification that will be used to
signal operation of the pump.
This notification is translated by
[signalk-switchbank](https://github.com/preeve9534/signalk-switchbank2/)
which emits NMEA 2000 PGN127502 messages to change the state of the engine
room relay.

[plugin configuration file](./readme/plugin-config-data/process-scheduler.json)
