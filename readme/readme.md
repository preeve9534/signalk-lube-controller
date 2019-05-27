# signalk-process-scheduler

This [Signal K Node Server](https://github.com/SignalK/signalk-server-node)
plugin implements a simple process scheduler which uses the Signal K
notification system as both its own control interface and as the instrument
for operating external processes.

To achieve agency in the real world the scheduler is dependent upon other
plugins which can map real world events into Signal K notifications and
Signal K notifications into real world actions. 

__signalk-process-scheduler__ manages an arbitrary number of user defined
_tasks_.
A task is started by the appearance of a nominated ALERT notification in
the Signal K self notification tree and is stopped by the removal of this
notification. 

Functionally, a task is composed of one or more sequentially executed
_activities_.
Each activity can be configured to repeat an arbitrary number of times and is
characterised by a _start event_ which occurs after some time _delay_ and and
a subsequent _stop event_ which occurs when some _duration_ of time has
elapsed since the start event.
The start event is associated with the issuing of an ALERT notification onto
the Signal K self notification tree and the stop event is associated with the
removal of this notification.
The resulting sequence of notification activity can be leveraged to control
(typically start and stop) external, real world, processes.

## Example application

Imagine a ship with an electrical lubrication pump that delivers grease
directly to the propeller shaft bearing. 
We want to ensure that the bearing is well greased at the beginning of every
voyage and lightly greased periodically during the voyage.

This requirement can be met by a "lubrication" task consisting of two
activities: a "start" activity which runs once when the main engine is fired
up and a subsequent "iterate" activity which runs repeatedly for as long
as the engine is running.
The start event in both activities is used to issue a notification which
signals that the lubrication pump should run.

Controlling execution of the lubrication task is fairly straightforward: a
plugin like
[signalk-threshold-notifier](https://github.com/preeve9534/signalk-threshold-notifier/)
can be used to emit an enabling notification when the engine ignition switch
is in the RUN position.
Modern engines with CAN interfaces into Signal K may support other ways of
detecting engine state.

Controlling the lubrication pump itself involves mapping a  notification state
into, say, an NMEA 2000 switchbank relay operation.
This can be accomplished with a plugin like
[signalk-switchbank](https://github.com/preeve9534/signalk-switchbank/). 

The raw JSON configuration for a __signalk-process-scheduler__ instance that
handles just a shaft librication task might look like this.

```
"configuration": {
  "tasks": [
    {
      "name": "shaft lubrication",
      "enablingpaths": [
        {
          "path": "notifications.control.electrical.switches.0.11.state",
          "options": [ "enabled" ]
        }
      ],
      "activities": [
        {
          "name": "start",
          "path": "notifications.control.engine.0.shaft.lube",
          "delay": 0,
          "duration": 300,
          "iterate": 1
        },
        {
          "name": "iterate",
          "path": "notifications.control.shaftlube",
          "delay": 1800,
          "duration": 60,
          "iterate": 10000
        }
      ]
    }
  ]
}
```

Of course, __signalk-process-scheduler__ provides a convenient web interface
for generation of its configuration files.
