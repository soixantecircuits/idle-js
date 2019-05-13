'use strict'
require('@babel/polyfill')

var bulkAddEventListener = function bulkAddEventListener (object, events, callback) {
  events.forEach(function (event) {
    object.addEventListener(event, callback)
  })
}

var bulkRemoveEventListener = function bulkRemoveEventListener (object, events, callback) {
  events.forEach(function (event) {
    object.removeEventListener(event, callback)
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
    this.throwOnBadKey(Object.keys(options), Object.keys(this.defaults))
    this.settings = Object.assign({}, this.defaults, options)
    this.visibilityEvents = ['visibilitychange', 'webkitvisibilitychange', 'mozvisibilitychange', 'msvisibilitychange']
    this.clearTimeout = null

    this.reset()

    this.stopListener = (event) => {
      this.stop()
    }
    this.idlenessEventsHandler = (event) => {
      if (this.idle) {
        this.idle = false
        this.settings.onActive.call()
      }
      this.resetTimeout(this.settings)
    }
    this.visibilityEventsHandler = (event) => {
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
    }
  }

  resetTimeout (settings, keepTracking = this.settings.keepTracking) {
    if (this.clearTimeout) {
      this.clearTimeout()
      this.clearTimeout = null
    }
    if (keepTracking) {
      this.timeout(this.settings)
    }
  }

  timeout (settings) {
    var timer = (this.settings.recurIdleCall) ? {
      set: setInterval.bind(window),
      clear: clearInterval.bind(window),
    } : {
      set: setTimeout.bind(window),
      clear: clearTimeout.bind(window),
    };

    var id = timer.set(function () {
      this.idle = true
      this.settings.onIdle.call()
    }.bind(this), this.settings.idle)

    this.clearTimeout = () => timer.clear(id);
  }

  start () {
    window.addEventListener('idle:stop', this.stopListener)
    this.timeout(this.settings)

    bulkAddEventListener(window, this.settings.events, this.idlenessEventsHandler);

    if (this.settings.onShow || this.settings.onHide) {
      bulkAddEventListener(document, this.visibilityEvents, this.visibilityEventsHandler);
    }

    return this
  }

  stop () {
    window.removeEventListener('idle:stop', this.stopListener)

    bulkRemoveEventListener(window, this.settings.events, this.idlenessEventsHandler)
    this.resetTimeout(this.settings, false)

    if (this.settings.onShow || this.settings.onHide) {
      bulkRemoveEventListener(document, this.visibilityEvents, this.visibilityEventsHandler)
    }

    return this
  }

  reset ({ idle = this.settings.startAtIdle, visible = !this.settings.startAtIdle } = {}) {
    this.idle = idle
    this.visible = visible

    return this
  }

  throwOnBadKey (keys, goodKeys) {
    keys.forEach(function (key) {
      if (! goodKeys.includes(key)) {
        throw `set: Unknown key ${key}`
      }
    })
  }

  set (options) {
    this.throwOnBadKey(Object.keys(options), Object.keys(this.defaults))
    this.settings = Object.assign(this.settings, options)
  }
}

module.exports = IdleJs
