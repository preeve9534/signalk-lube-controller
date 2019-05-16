# signalk-process-scheduler

[Signal K Node Server](https://github.com/SignalK/signalk-server-node) plugin
which implements a simple process scheduler using the host notification system
as a control medium.

An arbitrary number of processes can be scheduled with each process modelled
as a three-phase life cycle consisting of a start phase followed by an iterative
phase and terminating with an end phase.  Any (or all) phases can be omitted
from scheduler control.

![alt text](readme/processcontrol.png)

Each phase is characterised by a user-defined delay and duration.  The delay is
a period of quiescence before the controlled process is started, whilst duration
is the process execution time within the containing phase.

Scheduled control of a particular process is initiated and terminated by the
appearance of one or more user-defined notifications on the Signal K server bus and
the scheduler emits user-defined notifications to signal operation of each
process.

Signalk-process-scheduler was developed to control a stern gland lubrication
pump and this activity is configured in the following way:

1. Signal K's "engine start" data value is processed by signalk-threshold-notifier
into an "alert" notification signalling the process scheduler to start scheduling
the lubrication process.

2. The lubrication process is configured to consist of a start phase (delay = 0s,
duration = 300s) and an iterative phase (delay = 1800s, duration = 120s).  This
means that on engine start the lubrication pump will immediately run for five
minutes and will then run for two minutes every thirty minutes.

3. signalk-switchbank is used to translate the "run process" notifications issued
by the scheduler into NMEA 2000 PGN127502 messages which operate a relay controlling
the lube pump power supply.
