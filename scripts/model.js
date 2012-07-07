/*!
 * model.js v0.01
 *
 * Copyright 2012, Shawn Khameneh
 * http://extraordinarythoughts.com/
 * 
 */

(function(window, undefined) {
	var ready = false, readyStack = [];
	
	var model = {
		apply: function(obj) {
			var i;
			for(i in obj)
				this[i] = obj[i];
			if(arguments.length > 1)
				model.apply.apply(this, Array.prototype.slice.call(arguments, 1));
			return this;
		},
		_constructor: function() {
			return function() {
				this._model = {
					events: {}
				};
				
				if(this.on) {
					var i;
					for(i in this.on)
						this.on(i, this.on[i]);
				}
				
				this.fire('beforeConstruct');
				if(this.construct)
					this.construct.apply(this, arguments);
				this.fire('construct');
			}
		},
		createClass: function(params) {
			return base.extend(params);
		},
		createObject: function(params) {
			return new (model.createClass(params))();
		},
		ready: function(fn) {
			ready===true?fn():readyStack.push(fn);
		}
	};
	
	var base = function(){};
	base.extend = function(obj) {
		var cls = model._constructor();
		model.apply.call(cls.prototype = {}, this.prototype, obj);
		cls.superclass = this.prototype;
		cls.extend = base.extend;
		return cls;
	};
	base.prototype = {
		fire: function() {
			var event = arguments[0];
			arguments = Array.prototype.slice.call(arguments, 1);
			if(this._model.events[event]) {
				for(var i = 0; i < this._model.events[event].length; i++) {
					this._model.events[event][i].fn.apply(this, arguments);
					if(this._model.events[event][i].singleFire)
						this._model.events[event].splice(i--, 1);
				}
				if(this._model.events[event].length === 0)
					delete this._model.events[event];
			}
		},
		on: function(event, func) {
			if(!this._model.events.hasOwnProperty(event))
				this._model.events[event] = [];
			var ev = {
				fn: func
			};
			this._model.events[event].push(ev);
			return [ev, event, this._model];
		},
		onSingle: function(event, func) {
			if(!this._model.events.hasOwnProperty(event))
				this._model.events[event] = [];
			var ev = {
				fn: func,
				singleFire: true
			}
			this._model.events[event].push(ev);
			return [ev, event, this._model];
		},
		un: function(e) {
			e[2].events[e[1]].splice(e[2].events[e[1]].indexOf(e[0]), 1);
			if(e[2].events[e[1]].length === 0)
				delete e[2].events[e[1]];
		},
		apply: model.apply
	};
	
	(function(){
		var fireReady = function() {
			if(ready)
				return;
			ready = true;
			var i;
			for(i in readyStack)
				readyStack[i]();
			delete readyStack;
		}
		
		if(document.readyState === 'complete') {
			setTimeout(fireReady, 1);
		} else if(document.addEventListener) {
			var process = function() {
				document.removeEventListener('DOMContentLoaded', process, false);
				document.removeEventListener('load', process, false);
				fireReady();
			}
			document.addEventListener('DOMContentLoaded', process, false );
			window.addEventListener('load', process, false);
		} else if (document.attachEvent) {
			var process = function() {
				if(document.readyState === 'complete') {
					document.detachEvent('onreadystatechange', process);
					document.detachEvent('onload', process);
					fireReady();
				}
			}
			document.attachEvent('onreadystatechange', process);
			window.attachEvent('onload', process);
		}
	})();

	window.model = model;
})(window);