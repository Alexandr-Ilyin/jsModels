function EventList() { this._eventHandlers = {}; };
if (typeof(window)==undefined)
	var window = {};

EventList.prototype = {
	addHandler: function (eventName, handler, scope) {
		if (!eventName) throw "eventName is undefined";
		if (!handler) throw "handler is undefined";
		scope = scope || window;

		var handlerArr = this._eventHandlers[eventName];
		if (!handlerArr) {
			handlerArr = [];
			this._eventHandlers[eventName] = handlerArr;
		}
		handlerArr.push({ handler: handler, scope: scope });

		this._tryTriggerImmediately(eventName, handler, scope);
	},
	hasListener : function(eventName){
		return this._eventHandlers[eventName] && this._eventHandlers[eventName].length;
	},

	addOnceHandler: function (eventName, handler, scope) {
		if (!eventName) throw "eventName is undefined";
		if (!handler) throw "handler is undefined";
		scope = scope || window;

		if (this._tryTriggerImmediately(eventName, handler, scope))
			return;

		var handlerArr = this._eventHandlers[eventName];
		if (!handlerArr) {
			handlerArr = [];
			this._eventHandlers[eventName] = handlerArr;
		}
		var oneUsageHandler = function () {
			handler.apply(scope, arguments);
			this.removeHandler(eventName, oneUsageHandler, scope);
		} .attach(this);
		handlerArr.push({ handler: oneUsageHandler, scope: scope });
	},

	_tryTriggerImmediately: function (eventName, handler, scope) {
		var triggeredEventArgs = this._eventHandlers["___triggered_" + eventName];
		if (triggeredEventArgs) {
			var currentHandlers = this._eventHandlers["__current_" + eventName];
			if (currentHandlers)
				currentHandlers.push({ handler: handler, scope: scope });
			else
				handler.apply(scope, triggeredEventArgs);
			return true;
		}
		return false;
	},

	removeHandler: function () {
		var eventName = arguments[0];
		if (!eventName) throw "eventName is undefined";
		var scope;
		var handler = null;
		if (typeof(arguments[1]) == "function") {
			handler = arguments[1];
			if (!handler) throw "handler is undefined";
			scope = arguments[2];
		} else scope = arguments[1];
		scope = scope || window;
		var handlerArr = this._eventHandlers[eventName];
		if (!handlerArr)
			return false;
		var result = false;
		for (var i = 0; i < handlerArr.length; i++)
			if (handlerArr[i].scope == scope && (handler == null || handlerArr[i].handler == handler)) {
				handlerArr.splice(i, 1);
				i--;
				result = true;
			}
		return result;
	},

	_getEventName: function (args) {
		return typeof (args[0]) == "string" ? args[0] : args[0].event;
	},

	_getEventArgs: function (args) {
		if (typeof (args[0]) == "string") {
			var eventArgs = [];
			for (var i = 1; i < args.length; i++)
				eventArgs[i - 1] = args[i];
			return eventArgs;
		}
		else {
			var cfg = args[0];
			return cfg.arguments || [];
		}
	},

	triggeredEvent: function () {
		var eventName = this._getEventName(arguments);
		var args = this._getEventArgs(arguments);
		this._eventHandlers["___triggered_" + eventName] = args;
		this._triggerEvent(eventName, args);
	},

	untriggeredEvent: function () {
		var eventName = this._getEventName(arguments);
		delete this._eventHandlers["___triggered_" + eventName];
	},

	triggerEvent: function () {
		return this._triggerEvent(this._getEventName(arguments), this._getEventArgs(arguments));
	},

	_triggerEvent: function (eventName, eventArgs) {
		var handlerArr = this._eventHandlers[eventName];
		if (!handlerArr) {
			return;
		}
		handlerArr = handlerArr.slice();
		var oldCurrentHandlers = this._eventHandlers["__current_" + eventName];
		this._eventHandlers["__current_" + eventName] = handlerArr;
		var triggerResult = [];
		for (var i = 0; i < handlerArr.length; i++) {
			var result = handlerArr[i].handler.apply(handlerArr[i].scope, eventArgs);
			if (result)
				triggerResult[i]=result;
			if (result === false)
				break;
		}
		this._eventHandlers["__current_" + eventName] = oldCurrentHandlers;
		return triggerResult;
	},

	clearHandlers: function () {
		this._eventHandlers = {};
	}
};
module.exports = EventList;