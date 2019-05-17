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
reducing the quantity of grease arriving at the stern gland can only be achieved
by modulating the operation of the lubrication pump, so the general requirement
of "pump less grease" becomes: modulate the running of the lubrication pump to
reduce the lubrication duty-cycle.

It would also be helpful if the problem solution allowed easy tweaking of the
duty cycle to suit operational need.

_Solutions considered_

Process control timers suitable for duty cycle management are readily
available - similar to a central-heating programmer their normal application
is to control a relay which is often used simply to interrupt the power supply
to a connected device.

Home-brew scheduler embedded in thSince I happened to have an unused channel on my engine-room NMEA 2000 relay output module which could be used to modulate power to the lubrication pump all that was really needed was some Signal K logic to make things happen sensibly.  Using Signal K had the additional benefit of giving me access to data from my stern-gland temperature sensor as a subsidiary control mechanism.

This set the scene for the development of signalk-process-scheduler.  I use the plugin to solve the lubrication problem in the following way.

Scheduler control.  Some CAN/NMEA engine interfaces provide engine status directly to Signal K, but in my case an NMEA switchbank signal is associated with the main engine ignition switch position.  I use signalk-threshold-notifier to convert this switch signal into a Signal K ALERT notification which tells the scheduler to control the lubrication process: the scheduler runs the process when the ignition switch is in position I (RUN) and otherwise not.  I also use signalk-threshold-notifier to generate an ALERT notification when my stern gland temperature exceeds 60C.

In the scheduler, the lubrication process is configured with a start phase (delay = 0s, duration = 300s) and an iterative phase (delay = 1800s, duration = 120s). The intention here is that when the ignition switch is turned on the lubrication pump will immediately run for five minutes and will then run for two minutes every thirty minutes.

I chose to make the scheduler emit a 'notifications.control.shaftlubepump' ALERT notification to signal operation of the pump. This notification is translated into operation of the engine-room relay by signalk-switchbank which emits NMEA 2000 PGN127502 messages in response to changes in notification state.
