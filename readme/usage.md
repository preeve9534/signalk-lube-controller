## Usage

 __signalk-process-scheduler__ is configured through the Signal K Node server
plugin configuration interface.
Navigate to _Server_->_Plugin config_ and select the _Process scheduler_ tab.

The plugin configuration will open and present:

__Schedule tasks__  
A list of all defined schedule tasks.
There is no default value, so if no tasks are defined this list will be
empty in which case clicking the __[+]__ button will allow the creation
of a new task.

Each defined task is represented by a closed tab labelled "Task" (this isn't
helpful, but is the best that can be managed with the current Signal K
user-interface manager).
Clicking on a "Task" tab will open the configuration settings for the
the selected schedule task.
Any existing, unwanted, schedule task can be deleted by clicking its adjacent
__[x]__ button.


![Configuration panel](readme/config.png)

The configuration panel for a schedule task consists of the following fields.

__Schedule task name__  
A required text value which names the schedule task.
There is no default value.

Enter here some text which identifies the task and which will make sense when
it appears in system log file messages.

__Notification paths which enable the schedule task__  
A required list of notification paths and associated options each of which will
act as a trigger for running the schedule task.
There is no default.

__path__  
A notification path.

__options->enabled__  
A checkbox indicating whether or not the associated path is currently enabled
as a trigger.
Defaults to checked (true).

At least one enabled notification path is required for a task to be viable.

__Activities making up the schedule task__  
A sequenced list of activities which make up the task.
Activities can be created __[+]__, deleted __[x]__ and ordered __[^]__ and __[^]__.
Each activity is defined by:

__Activity name__  
A required text value which names the activity.

__Process control notififcation path__  
A required notification path which will be used to issue an ALERT notification
when the schedule task requires the associated process to start.
Any previously issued notification will be removed when the scheduler requires
the associated process to stop.
There is no default value.

__delay (s)__  
The number of seconds which should elapse before the activity issues a
start process notification.

__duration (s)__ 
The number of seconds for which the controlled process should run before
the activity issues a stop process notification.

__iterate (n)__  
The number of times the activity should be repeated.
Defaults to 1.
