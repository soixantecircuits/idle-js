(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["IdleJs"] = factory();
	else
		root["IdleJs"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var bulkAddEventListener = function bulkAddEventListener(object, events, callback) {
	  events.forEach(function (event) {
	    object.addEventListener(event, function (event) {
	      callback(event);
	    });
	  });
	};
	
	var bulkRemoveEventListener = function bulkRemoveEventListener(object, events) {
	  events.forEach(function (event) {
	    object.removeEventListener(event);
	  });
	};
	
	var IdleJs = function () {
	  function IdleJs(options) {
	    _classCallCheck(this, IdleJs);
	
	    this.defaults = {
	      idle: 10000, // idle time in ms
	      events: ['mousemove', 'keydown', 'mousedown', 'touchstart'], // events that will trigger the idle resetter
	      onIdle: function onIdle() {}, // callback function to be executed after idle time
	      onActive: function onActive() {}, // callback function to be executed after back form idleness
	      onHide: function onHide() {}, // callback function to be executed when window become hidden
	      onShow: function onShow() {}, // callback function to be executed when window become visible
	      keepTracking: true, // set it to false of you want to track only once
	      startAtIdle: false, // set it to true if you want to start in the idle state
	      recurIdleCall: false
	    };
	    this.settings = _extends({}, this.defaults, options);
	    this.idle = this.settings.startAtIdle;
	    this.visible = !this.settings.startAtIdle;
	    this.visibilityEvents = ['visibilitychange', 'webkitvisibilitychange', 'mozvisibilitychange', 'msvisibilitychange'];
	    this.lastId = null;
	  }
	
	  _createClass(IdleJs, [{
	    key: 'resetTimeout',
	    value: function resetTimeout(id, settings) {
	      if (this.idle) {
	        settings.onActive.call();
	        this.idle = false;
	      }
	      clearTimeout(id);
	      if (this.settings.keepTracking) {
	        return this.timeout(this.settings);
	      }
	    }
	  }, {
	    key: 'timeout',
	    value: function timeout(settings) {
	      var timer = this.settings.recurIdleCall ? setInterval : setTimeout;
	      var id;
	      id = timer(function () {
	        this.idle = true;
	        this.settings.onIdle.call();
	      }.bind(this), this.settings.idle);
	      return id;
	    }
	  }, {
	    key: 'start',
	    value: function start() {
	      window.addEventListener('idle:stop', function (event) {
	        bulkRemoveEventListener(window, this.settings.events);
	        this.settings.keepTracking = false;
	        this.resetTimeout(this.lastId, this.settings);
	      });
	      this.lastId = this.timeout(this.settings);
	      bulkAddEventListener(window, this.settings.events, function (event) {
	        this.lastId = this.resetTimeout(this.lastId, this.settings);
	      }.bind(this));
	      if (this.settings.onShow || this.settings.onHide) {
	        bulkAddEventListener(document, this.visibilityEvents, function (event) {
	          if (document.hidden || document.webkitHidden || document.mozHidden || document.msHidden) {
	            if (this.visible) {
	              this.visible = false;
	              this.settings.onHide.call();
	            }
	          } else {
	            if (!this.visible) {
	              this.visible = true;
	              this.settings.onShow.call();
	            }
	          }
	        }.bind(this));
	      }
	    }
	  }]);
	
	  return IdleJs;
	}();
	
	module.exports = IdleJs;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=idle.js.map