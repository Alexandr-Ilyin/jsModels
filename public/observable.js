var EventList = require("./events");
var Base = require("./base");

var Observable = Base.extend({
	_ensureEvents : function () { this._events = this._events || new EventList();},
	on: function () { this._ensureEvents(); this._events.addHandler.apply(this._events, arguments); return this; },
	once: function () { this._ensureEvents(); this._events.addOnceHandler.apply(this._events, arguments); return this; },
	un: function () { this._ensureEvents(); this._events.removeHandler.apply(this._events, arguments); return this; },
	trigger: function () { this._ensureEvents(); return this._events.triggerEvent.apply(this._events, arguments); },
	triggered: function () { this._ensureEvents(); return this._events.triggeredEvent.apply(this._events, arguments); },
	untriggered: function () { this._ensureEvents(); return this._events.untriggeredEvent.apply(this._events, arguments); },
	init: function () {
		if(!this.handlers)
			return;
		for (var eventName in this.handlers) {
			if(this.handlers[eventName] instanceof Function)
				this.on(eventName, this.handlers[eventName]);
		}
	},

	clearHandlers: function () { this._ensureEvents(); this._events.clearHandlers();},
	reTrigger: function(eventName, target) {
		$v(target, $v.notEmpty);
		this.on(eventName, function() {
			var args = [].slice.call(arguments);
			args.unshift(eventName);
			target.trigger.apply(target, args);
		});
	}
});
module.exports = Observable;