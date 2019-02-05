/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	var IdleJs = __webpack_require__(1)

	var idle = new IdleJs({
	  idle: 2000,
	  onIdle: function () {
	    console.log('entry.js - idle')
	  },
	  onActive: function () {
	    console.log('entry.js - active')
	  },
	  onHide: function () {
	    console.log('entry.js - hide')
	  },
	  onShow: function () {
	    console.log('entry.js - show')
	  }
	}).start()

	console.log('hello')


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	'use strict'
	var bulkAddEventListener = function bulkAddEventListener (object, events, callback) {
	  events.forEach(function (event) {
	    object.addEventListener(event, function (event) {
	      callback(event)
	    })
	  })
	}

	var bulkRemoveEventListener = function bulkRemoveEventListener (object, events) {
	  events.forEach(function (event) {
	    object.removeEventListener(event)
	  })
	}

	class IdleJs {
	  constructor (options) {
	    this.defaults = {
	      idle: 10000, // idle time in ms
	      events: ['mousemove', 'keydown', 'mousedown', 'touchstart'], // events that will trigger the idle resetter
	      onIdle: function () {}, // callback function to be executed after idle time
	      onActive: function () {}, // callback function to be executed after back form idleness
	      onHide: function () {}, // callback function to be executed when window become hidden
	      onShow: function () {}, // callback function to be executed when window become visible
	      keepTracking: true, // set it to false of you want to track only once
	      startAtIdle: false, // set it to true if you want to start in the idle state
	      recurIdleCall: false
	    }
	    this.settings = Object.assign({}, this.defaults, options)
	    this.visibilityEvents = ['visibilitychange', 'webkitvisibilitychange', 'mozvisibilitychange', 'msvisibilitychange']
	    this.lastId = null

	    this.reset()

	    this.stopListener = (event) => {
	      this.stop()
	    }
	  }

	  resetTimeout (id, settings, keepTracking = this.settings.keepTracking) {
	    if (this.idle) {
	      this.idle = false
	      settings.onActive.call()
	    }
	    if (id) {
	      clearTimeout(id)
	    }
	    if (keepTracking) {
	      return this.timeout(this.settings)
	    }
	  }

	  timeout (settings) {
	    var timer = (this.settings.recurIdleCall) ? setInterval : setTimeout
	    var id
	    id = timer(function () {
	      this.idle = true
	      this.settings.onIdle.call()
	    }.bind(this), this.settings.idle)
	    return id
	  }

	  start () {
	    window.addEventListener('idle:stop', this.stopListener)

	    this.lastId = this.timeout(this.settings)
	    bulkAddEventListener(window, this.settings.events, function (event) {
	      this.lastId = this.resetTimeout(this.lastId, this.settings)
	    }.bind(this))
	    if (this.settings.onShow || this.settings.onHide) {
	      bulkAddEventListener(document, this.visibilityEvents, function (event) {
	        if (document.hidden || document.webkitHidden || document.mozHidden || document.msHidden) {
	          if (this.visible) {
	            this.visible = false
	            this.settings.onHide.call()
	          }
	        } else {
	          if (!this.visible) {
	            this.visible = true
	            this.settings.onShow.call()
	          }
	        }
	      }.bind(this))
	    }
	  }

	  stop () {
	    window.removeEventListener('idle:stop', this.stopListener)

	    bulkRemoveEventListener(window, this.settings.events)
	    this.lastId = this.resetTimeout(this.lastId, this.settings, false)

	    if (this.settings.onShow || this.settings.onHide) {
	      bulkRemoveEventListener(document, this.visibilityEvents)
	    }
	  }

	  reset ({ idle = this.settings.startAtIdle, visible = !this.settings.startAtIdle } = {}) {
	    this.idle = idle
	    this.visible = visible
	  }
	}

	module.exports = IdleJs


/***/ })
/******/ ]);