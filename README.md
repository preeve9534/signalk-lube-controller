# signalk-process-scheduler

This [Signal K Node Server](https://github.com/SignalK/signalk-server-node)
plugin implements a simple process scheduler which uses the Signal K
notification system both as its own control interface and as the instrument
for operating external processes.

To achieve agency in the real world the scheduler is dependent upon other
plugins which can map real world events into notifications and notifications
into real world actions. 

The plugin manages an arbitrary number of user defined _tasks_.
A task is started by the appearance of a user defined ALERT notification ons
the Signal K notification bus and is stopped by the removal of this
notification. 

Functionally, a task is composed of one or more sequentially executed
_activities_.
Each activity can be configured to repeat an arbitrary number of times and is
characterised by a _start event_ which occurs after some time _delay_ and and
a subsequent _stop event_ which occurs when some _duration_ of time has
elapsed since the start event.
The start event is associated with the issuing of an ALERT notification onto
the Signal K notification bus and the stop event is associated with the
removal of this notification.
The resulting sequence of notification activity can be leveraged to control
(typically start and stop) external, real world, processes.

By way of illustration: let's imagine a ship with an electrical lubrication
pump that delivers grease directly to the propeller shaft bearing. 
We want to ensure that the propeller shaft on our ship is well greased at the
beginning of every voyage and lightly greased periodically during the voyage.

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
