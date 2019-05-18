# signalk-process-scheduler

This [Signal K Node Server](https://github.com/SignalK/signalk-server-node)
plugin implements a simple process scheduler using the Signal K notification
system as its control medium.

An arbitrary number of _schedule tasks_s can be configured.
Each schedule task is modelled as a three-phase life-cycle consisting of a
start phase followed by an iterative phase and terminating with an end phase.
Any (or all) phases can be excluded from the schedule task life-cycle.

Each life-cycle phase is characterised by a user-defined _delay_ and
_duration_: delay is a period of quiescence before the controlled process is
started, whilst duration is the process execution time within the containing
phase.

![alt text](readme/processcontrol.png)

A schedule task is started by the presence of one or more user-defined ALERT
notifications on the Signal K server bus and the task will continue to execute
until all defined ALERT notifications are removed or replaced by non-ALERT
variants.
When this happens signals the schedule task will enter its end phase and
subsequently stop.
