## Use cases

__Stern gland lubrication__

signalk-process-scheduler was developed to schedule running of _Beatrice_'s stern gland lubrication pump.

_Beatrice_'s lubrication pump was originally connected directly to the engine ignition circuit and had a 100% duty cycle which was slowly and unnecessarily filling the engine-room bilge with grease.  I guessed that a duty cycle closer to 5% would be more than adequate and finally settled on a strategy of lubricating the prop shaft heavily at engine start and then with little bursts of lubrication whilst the engine was running.

To achieve this in hardware I required a process control timer module for my lubrication pump and since this was priced at 200 euros I thought maybe not.  I then considered using a cheap central-heating programmer but didn't like the inevitable awkwardness of this solution.

Since I happened to have an unused channel on my engine-room NMEA 2000 relay output module which could be used to modulate power to the lubrication pump all that was really needed was some Signal K logic to make things happen sensibly.  Using Signal K had the additional benefit of giving me access to data from my stern-gland temperature sensor as a subsidiary control mechanism.

This set the scene for the development of signalk-process-scheduler.  I use the plugin to solve the lubrication problem in the following way.

Scheduler control.  Some CAN/NMEA engine interfaces provide engine status directly to Signal K, but in my case an NMEA switchbank signal is associated with the main engine ignition switch position.  I use signalk-threshold-notifier to convert this switch signal into a Signal K ALERT notification which tells the scheduler to control the lubrication process: the scheduler runs the process when the ignition switch is in position I (RUN) and otherwise not.  I also use signalk-threshold-notifier to generate an ALERT notification when my stern gland temperature exceeds 60C.

In the scheduler, the lubrication process is configured with a start phase (delay = 0s, duration = 300s) and an iterative phase (delay = 1800s, duration = 120s). The intention here is that when the ignition switch is turned on the lubrication pump will immediately run for five minutes and will then run for two minutes every thirty minutes.

I chose to make the scheduler emit a 'notifications.control.shaftlubepump' ALERT notification to signal operation of the pump. This notification is translated into operation of the engine-room relay by signalk-switchbank which emits NMEA 2000 PGN127502 messages in response to changes in notification state.
