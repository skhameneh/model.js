/*!
 * model.js v0.02
 *
 * Copyright 2012, Shawn Khameneh
 * http://extraordinarythoughts.com/
 * 
 */

/*jslint nomen: true, white: true, browser: true, forin: true */

(function (window) {
	"use strict";

	var ready = false, readyStack = [], base = function () {}, model = {
		apply: function (obj) {
			var i;
			for (i in obj) {
				this[i] = obj[i];
			}
			if (arguments.length > 1) {
				model.apply.apply(this, Array.prototype.slice.call(arguments, 1));
			}
			return this;
		},
		_constructor: function () {
			return function () {
				this._model = {
					events: {}
				};
				
				if (this.on) {
					var i;
					for (i in this.on) {
						this.on(i, this.on[i]);
					}
				}
				
				this.fire('beforeConstruct');
				if (this.construct) {
					this.construct.apply(this, arguments);
				}
				this.fire('construct');
			};
		},
		createClass: function (params) {
			return base.extend(params);
		},
		createObject: function (params) {
			return new (model.createClass(params))();
		},
		ready: function (fn) {
			if (ready === true) {
				fn();
			} else {
				readyStack.push(fn);
			}
		}
	};
	
	base.extend = function (obj) {
		var cls = model._constructor();
		model.apply.call(cls.prototype = {}, this.prototype, obj);
		cls.superclass = this.prototype;
		cls.extend = base.extend;
		return cls;
	};
	base.prototype = {
		fire: function () {
			var ev = arguments[0], args = Array.prototype.slice.call(arguments, 1);
			if (this._model.events[ev]) {
				var i;
				for (i = 0; i < this._model.events[ev].length; i+=1) {
					this._model.events[ev][i].fn.apply(this, args);
					if (this._model.events[ev][i].singleFire) {
						this._model.events[ev].splice(i, 1);
						i-=1;
					}
				}
				if (this._model.events[ev].length === 0) {
					delete this._model.events[ev];
				}
			}
		},
		on: function (ev, func) {
			if (!this._model.events.hasOwnProperty(ev)) {
				this._model.events[ev] = [];
			}
			var evObj = {
				fn: func
			};
			this._model.events[ev].push(evObj);
			return [evObj, ev, this._model];
		},
		onSingle: function (ev, func) {
			if (!this._model.events.hasOwnProperty(ev)) {
				this._model.events[ev] = [];
			}
			var evObj = {
				fn: func,
				singleFire: true
			};
			this._model.events[ev].push(evObj);
			return [evObj, ev, this._model];
		},
		un: function (e) {
			e[2].events[e[1]].splice(e[2].events[e[1]].indexOf(e[0]), 1);
			if (e[2].events[e[1]].length === 0) {
				delete e[2].events[e[1]];
			}
		},
		apply: model.apply
	};
	
	(function () {
		var fireReady = function () {
			if (ready) {
				return;
			}
			ready = true;
			var i;
			for (i in readyStack) {
				readyStack[i]();
			}
			//delete readyStack;
		}, process;
		
		if (document.readyState === 'complete') {
			setTimeout(fireReady, 1);
		} else if (document.addEventListener) {
			process = function() {
				document.removeEventListener('DOMContentLoaded', process, false);
				document.removeEventListener('load', process, false);
				fireReady();
			};
			document.addEventListener('DOMContentLoaded', process, false );
			window.addEventListener('load', process, false);
		} else if (document.attachEvent) {
			process = function() {
				if (document.readyState === 'complete') {
					document.detachEvent('onreadystatechange', process);
					document.detachEvent('onload', process);
					fireReady();
				}
			};
			document.attachEvent('onreadystatechange', process);
			window.attachEvent('onload', process);
		}
	}());

	window.model = model;
}(window));