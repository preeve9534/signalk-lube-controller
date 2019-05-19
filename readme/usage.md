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

__options->enabled__ 
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

__Options for start phase__ 
__Options for iterate phase__ 
__Options for end phase__ 
These entries allow the timings of each phase of the schedule task to be
defined.

__delay__
The number of seconds which should elapse before the controlled process
is started.

__duration__ 
The number of seconds for which the controlled process should run.
