var IdleJs = require('../src/Idle.js')
console.log('hello')
new IdleJs({
  onIdle: function () {
    console.log('idle !')
  }
}).start()
