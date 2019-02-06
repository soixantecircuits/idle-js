var IdleJs = require('../../dist/Idle.js')

var pauseIdle = function () {
  if (idle) {
    idle.stop()
    document.querySelector('.js-idle-pause').hidden = false
    document.querySelector('.js-run').hidden = true
    document.querySelector('.js-wait').hidden = true
  } else {
    console.warn('idle issue', idle)
  }
}
var startIdle = function () {
  if (idle) {
    idle.start()
    document.querySelector('.js-idle-pause').hidden = true
    document.querySelector('.js-run').hidden = true
    document.querySelector('.js-wait').hidden = false
  } else {
    console.warn('idle issue', idle)
  }
}

var idle = new IdleJs({
  idle: 2000,
  onIdle: function () {
    console.log('entry.js - idle')
    document.querySelector('.js-run').hidden = true
    document.querySelector('.js-wait').hidden = false
  },
  onActive: function () {
    console.log('entry.js - active')
    document.querySelector('.js-run').hidden = false
    document.querySelector('.js-wait').hidden = true
  },
  onHide: function () {
    console.log('entry.js - hide')
    document.title = '🙋‍ I\'m here, come on!'
  },
  onShow: function () {
    console.log('entry.js - show')
    document.title = '💁‍ ok, fine... let\'s talk'
  }
}).start()

document.querySelector('.js-run').hidden = false
document.querySelector('.js-wait').hidden = true
document.querySelector('.js-idle-pause').hidden = true
document.querySelector('#pause-idle').onclick = pauseIdle
document.querySelector('#start-idle').onclick = startIdle

console.log('hello, idle will trigger if you do not move your mouse')
