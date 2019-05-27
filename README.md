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
## System requirements

__signalk-process-scheduler__ has no special system requirements.
## Installation

Download and install __signalk-process-scheduler__ using the _Appstore_ link
in your Signal K Node server console.

The plugin can also be downloaded from the
[project homepage](https://github.com/preeve9534/signalk-process-scheduler)
and installed using
[these instructions](https://github.com/SignalK/signalk-server-node/blob/master/SERVERPLUGINS.md).
## Usage

 __signalk-process-scheduler__ is configured through the Signal K Node server
plugin configuration interface.
Navigate to _Server_->_Plugin config_ and select the _Process scheduler_ tab.

The plugin configuration will open and presents a list of all defined schedule
tasks.
Each task is represented by a closed tab; clicking on a tab will open the
configuration page for the selected schedule task (see figure).
New schedule tasks can be added by clicking the __[+]__ button and any existing,
unwanted, schedule tasks can be deleted by clicking their adjacent __[x]__ button.

![Configuration panel](readme/config.png)

Each schedule task definition consists of the following fields.

__Scheduled process name__  
A required text value which names the schedule task.
There is no default value.

Enter here some text which identifies the task and which will make sense when
it appears in system log file messages.

__Notification paths which enable process scheduling__  
A required list of notification paths and associated options each of which will
act as a trigger for running the schedule task.
There is no default.

__path__  
A notification path.

__enabled__  
A checkbox indicating whether or not the associated path is enabled as a trigger.
Defaults to checked (true).

At least one enabled notification path is required.

__Notification path which enables process__  
A required notification path which will be used to issue an ALERT notification
when the schedule task requires the associated process to start.
Any previously issued notification will be removed when the scheduler requires
the associated process to stop.
There is no default value.

__Active process components__  
A checkbox menu determining which phases of the schedule task should be
implemented.
Defaults to __start__ and __iterate__.

__Options for start phasei__, __Options for iterate phase__ and __Options for end phase__  
Entries below these headings specify the delay and duration times in seconds
for execution of the process controlled by the schedule task within each
phase.

__delay__
The number of seconds which should elapse before the controlled process
is started.

__duration__ 
The number of seconds for which the controlled process should run.
## Messages

__signalk-process-scheduler__ issues the following message to the Signal K
Node server console and system logging facility.

__no processes are defined__  
The plugin has initialised but no scheduling processes have been configured.

__no processes are enabled__  
The plugin has initialised and scheduled processes have been configured,
but none of the processes can run because all enabling notification paths
are disabled.

__configuring scheduling for: _name__[__,__ _name_...]
The plugin has initialised and has configured scheduling of the _name_d
processes.

__starting scheduling of: _name__
An ALERT has been detected on one of the enabling notification paths for
schedule task _name_.
The schedule task will enter its start phase.

__stopping scheduling of: _name__
A non-ALERT has been detected on one of the enabling notification paths for
schedule task _name_.
The schedule task will enter its end phase (if any) and then stop.

__starting: _name__
Schedule task _name_ is issueing an ALERT notification for its controlled process. 

__stopping: _name__
Schedule task _name_ is cancelling any ALERT notification for its controlled process. 
