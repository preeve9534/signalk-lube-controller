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
## System requirements

__signalk-threshold-notifier__ has no special system requirements.
## Installation

Download and install __signalk-threshold-notifier__ using the _Appstore_ link
in your Signal K Node server console.

The plugin can also be downloaded from the
[project homepage](https://github.com/preeve9534/signalk-threshold-notifier)
and installed using
[these instructions](https://github.com/SignalK/signalk-server-node/blob/master/SERVERPLUGINS.md).
## Usage

 __signalk-process-scheduler__ is configured through the Signal K Node server
plugin configuration interface.
Navigate to _Server_->_Plugin config_ and select the _Process scheduler_ tab.

![Configuration panel](readme/config.png)

Plugin configuration simply involves maintaining a list of definitions,
each of which represents a scheduled process.  Each process definition
is represented by a tab in the configuration screen: clicking on a tab
opens the definition for the selected process.

New processes definitions can be added by clicking the __[+]__ button
and any existing, unwanted, process definitions can be deleted by clicking
their adjacent __[x]__ button.

Each process definition consists of the following fields.

__Process name__  
A required text value which names the process.
There is no default value.

Enter here some text which identifies the process and which will make sense when
it appears in system log file messages.

__Notification paths which enable process scheduling__
A required list of notification paths and associated options each of which will
act as a trigger for running the associated process.
There is no default.

__path__
A notification path.
At least one is required.

__option->enabled__
A checkbox indicating whether or not the associated path is enabled as a trigger.
Defaults to checked (true).

__Notification path for enabling the associated process__
A required notification path which will be used to issue an ALERT notification
when the scheduler requires the associated process to start.  Any previously
issued notification will be removed when the scheduler requires the associated
process to stop.
There is no default value.

__Active process phases__  
A checkbox menu determining which phases of the schedule process control should
be implemented.
Defaults to __start__ and __iterate__.

__Options for process invocation in start phase__

__Options for process invocation in iterate phase__

__Options for process invocation in end phase__
## Use cases

__Stern gland lubrication__

_Beatrice_'s lubrication pump was originally connected directly to the engine ignition circuit and had a 100% duty cycle which was slowly and unnecessarily filling the engine-room bilge with grease.  I guessed that a duty cycle closer to 5% would be more than adequate and finally settled on a strategy of lubricating the prop shaft heavily at engine start and then with little bursts of lubrication whilst the engine was running.

To achieve this in hardware I required a process control timer module for my lubrication pump and since this was priced at 200 euros I thought maybe not.  I then considered using a cheap central-heating programmer but didn't like the inevitable awkwardness of this solution.

Since I happened to have an unused channel on my engine-room NMEA 2000 relay output module which could be used to modulate power to the lubrication pump all that was really needed was some Signal K logic to make things happen sensibly.  Using Signal K had the additional benefit of giving me access to data from my stern-gland temperature sensor as a subsidiary control mechanism.

This set the scene for the development of signalk-process-scheduler.  I use the plugin to solve the lubrication problem in the following way.

Scheduler control.  Some CAN/NMEA engine interfaces provide engine status directly to Signal K, but in my case an NMEA switchbank signal is associated with the main engine ignition switch position.  I use signalk-threshold-notifier to convert this switch signal into a Signal K ALERT notification which tells the scheduler to control the lubrication process: the scheduler runs the process when the ignition switch is in position I (RUN) and otherwise not.  I also use signalk-threshold-notifier to generate an ALERT notification when my stern gland temperature exceeds 60C.

In the scheduler, the lubrication process is configured with a start phase (delay = 0s, duration = 300s) and an iterative phase (delay = 1800s, duration = 120s). The intention here is that when the ignition switch is turned on the lubrication pump will immediately run for five minutes and will then run for two minutes every thirty minutes.

I chose to make the scheduler emit a 'notifications.control.shaftlubepump' ALERT notification to signal operation of the pump. This notification is translated into operation of the engine-room relay by signalk-switchbank which emits NMEA 2000 PGN127502 messages in response to changes in notification state.
## Messages

__signalk-threshold-notifier__ issues the following message to the Signal K
Node server console and system logging facility.

__Monitoring *n* path__[__s__]  
The plugin has initialised and is monitoring *n* Signal K paths.

Additionally, the following messages are issued just to the system logging
facility.

__cancelling notification on '*path*'__  
The monitored value has returned between the low and high thresholds and the
notification on _path_ is being removed. 

__issuing '*state*' notification on '*path*'__  
The monitored value has passed a threshold and a notification of type *state*
has been issued on *path*.
