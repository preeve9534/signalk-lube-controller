## Usage

 __signalk-process-scheduler__ is configured through the Signal K Node server
plugin configuration interface.
Navigate to _Server_->_Plugin config_ and select the _Process scheduler_ tab.

![Configuration panel](readme/config.png)

Plugin configuration involves maintaining a list of schedule task
configurations each of which is represented by a tab in the plugin
configuration panel: clicking on a tab opens the configuration panel for the
selected schedule task.

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
