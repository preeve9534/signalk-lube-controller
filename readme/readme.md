# signalk-process-scheduler

This [Signal K Node Server](https://github.com/SignalK/signalk-server-node)
plugin implements a simple process scheduler using the Signal K notification
system as a control medium.

An arbitrary number of _schedule tasks_s can be configured.
Each schedule task is modelled as a three-phase life-cycle consisting of a
start phase followed by an iterative phase and terminating with an end phase.
Any (or all) phases can be excluded from the schedule task life-cycle.

Each life-cycle phase is characterised by a user-defined _delay_ and
_duration_: delay is a period of quiescence before the controlled process is
started, whilst duration is the process execution time within the containing
phase.

![alt text](readme/processcontrol.png)

A schedule task is enabled by the appearance of one or more user-defined ALERT
notifications on the Signal K server bus.
Removal of such notifications (or their replacement by a non-ALERT variant)
signals the schedule task to relinquish process sheduling by entering the end
phase of process control.
