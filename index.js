/*
 * Copyright 2018 Paul Reeve <paul@pdjr.eu>
 * Portions Copyright (2017) Scott Bender (see https://github.com/sbender9/signalk-simple-notifications)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Bacon = require('baconjs')
const Schema = require('./lib/schema.js');
const Log = require('./lib/log.js');

const PLUGIN_SCHEMA_FILE = __dirname + "/schema.json";
const PLUGIN_UISCHEMA_FILE = __dirname + "/uischema.json";
const NOTIFICATION_PREFIX = "notifications.";

module.exports = function(app) {
	var plugin = {};
	var unsubscribes = [];

	plugin.id = "process-scheduler";
	plugin.name = "Process scheduler";
	plugin.description = "Simple process scheduler.";

    const log = new Log(app.setProviderStatus, app.setProviderError, plugin.id);
    const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
    var child_process = require("child_process");

	plugin.schema = function() {
        return(Schema.createSchema(PLUGIN_SCHEMA_FILE).getSchema());
	}

	plugin.uiSchema = function() {
        return(Schema.createSchema(PLUGIN_UISCHEMA_FILE).getSchema());
	}

    // Filter out rules which are disabled and map monitored path values into
    // a stream of comparator values where -1 = below low threshold, 1 = above
    // high threshold and 0 = between threshold.  Eliminate duplicate values
    // in this new stream and issue a notification based upon the resulting
    // comparator.  
    //  
	plugin.start = function(options) {
        if (options.processes !== undefined) log.N("Controlling " + options.processes.length + " process" + ((options.processes.length == 1)?"":"es"));
        
        options.processes.reduce((a, {
            name,
            enablingpaths,
            processpath,
            processoptions
        }) => {
            var stream = Bacon.combineWith(orAll, enablingpaths.filter(v => v.options.includes("enabled")).map(v => app.streambundle.getSelfStream(v.path).skipDuplicates()));
            a.push(stream.onValue(state => {
                if (state) {
                    var child = child_process.fork(__dirname + "/process.js");
                    console.log(JSON.stringify(processoptions));
                    child.send({
                        "sdl" : (processoptions.options.includes("start"))?processoptions.start.delay:0,
                        "sdr" : (processoptions.options.includes("start"))?processoptions.start.duration:0,
                        "idl" : (processoptions.options.includes("iterate"))?processoptions.iterate.delay:0,
                        "idr" : (processoptions.options.includes("iterate"))?processoptions.iterate.duration:0,
                        "edl" : (processoptions.options.includes("end"))?processoptions.end.delay:0,
                        "edr" : (processoptions.options.includes("end"))?processoptions.end.duration:0
                    });
                    child.on('message', (message) => {
                        if (message.action) {
                            log.N("starting " + name);
                            issueNotificationUpdate(processpath);
                        } else {
                            log.N("stopping " + name);
                            cancelNotification(processpath);
                        }
                    });
                    child.on('exit', () => {
                        log.N("terminating " + name);
                        cancelNotification(processpath);
                        child = null;
                    });
                } else {
                    if (child != null) child.kill('SIGHUP');
                }
            }));
            return(a);
        }, []);
	}

	plugin.stop = function() {
		unsubscribes.forEach(f => f())
		unsubscribes = []
	}

    function cancelNotification(npath) {
		var delta = { "context": "vessels." + app.selfId, "updates": [ { "source": { "label": "self.notificationhandler" }, "values": [ { "path": npath, "value": null } ] } ] };
		app.handleMessage(plugin.id, delta);
        return;
    }

	function issueNotificationUpdate(npath) {
        var date = (new Date()).toISOString();
        var notificationValue = { "state": "alert", "message": "Lubrication process", "method": "visual", "date": date };
		var delta = { "context": "vessels." + app.selfId, "updates": [ { "source": { "label": "self.notificationhandler" }, "values": [ { "path": npath, "value": notificationValue } ] } ] };
        delta.updates[0].values[0].value = notificationValue;
		app.handleMessage(plugin.id, delta);
        return;
	}

    function orAll() {
        var retval = false;
        for (var i = 0; i < arguments.length; i++) { retval |= (arguments[i].state == "alert") };
        return(retval);
    }

	return(plugin);
}
