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
