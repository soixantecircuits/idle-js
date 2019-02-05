var IdleJs = require('../src/Idle.js')

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
}).start();

console.log('hello')
