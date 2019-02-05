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
