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

	plugin.id = "lube-controller";
	plugin.name = "Lube controller";
	plugin.description = "Lube controller.";

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
        if (options.enablingpaths !== undefined) log.N("monitoring " + options.enablingpaths.length + " path" + ((options.enablingpaths.length == 1)?"":"s"));
        var paths = options.enablingpaths.filter(v => v.options.includes("enabled"));
        var streams = paths.map(v => app.streambundle.getSelfStream(v.path).skipDuplicates());
        var child = null;

        Bacon.combineWith(orAll, streams).onValue(state => {
            if (state) {
                child = child_process.fork(__dirname + "/process.js");
                child.send({
                    "firstdelay": options.processoptions.first.delay,
                    "firstduration": options.processoptions.first.duration,
                    "subsequentdelay": options.processoptions.subsequent.delay,
                    "subsequentduration": options.processoptions.subsequent.duration
                });
                child.on('message', (message) => {
                    console.log("Process received message from child " + JSON.stringify(message));
                    if (message.action) {
                        issueNotificationUpdate(options.processpath);
                    } else {
                        cancelNotification(options.processpath);
                    }
                });
                child.on('exit', () => {
                    cancelNotification();
                    child = null;
                });
            } else {
                if (child != null) child.kill('SIGHUP');
            }
        });
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
