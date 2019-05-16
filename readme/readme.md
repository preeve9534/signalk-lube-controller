# signalk-process-scheduler

[Signal K Node Server](https://github.com/SignalK/signalk-server-node) plugin
which implements a simple process scheduler using the host notification system
as a control medium.

An arbitrary number of processes can be scheduled with each process modelled
as a three-phase life cycle consisting of a start phase followed by an iterative
phase and terminating with an end phase.  Any (or all) phases can be omitted
from scheduler control.

Each phase is characterised by a user-defined delay and duration.  The delay is
a period of quiescence before the controlled process is started, whilst duration
is the process execution time within the containing phase.

![alt text](readme/processcontrol.png)

Scheduled control of a particular process is initiated by the appearance of one
or more user-defined ALERT notifications on the Signal K server bus.  Removal of
the notification (or its replacement by a non-ALERT variant) signals the scheduler
to relinquish process sheduling by entering the end phase of process control.
