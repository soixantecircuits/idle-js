import { IdleJs } from './lib/main.js'

var initialDelay = 2000
console.log(`initialize trigger in: ${initialDelay}`)
var idle = new IdleJs({
  onIdle: function(){
    document.querySelector('#status').classList.toggle('idle');
    document.querySelector('#status').textContent = 'Idle!';
  },
  onActive: function(){
    document.querySelector('#status').classList.toggle('idle');
    document.querySelector('#status').textContent = 'Active!';
  },
  onHide: function(){
    document.querySelector('#visibility').classList.toggle('idle');
    document.querySelector('#visibility').textContent = 'Hidden!';
  },
  onShow: function(){
    // Add a slight pause so you can see the change
    setTimeout(function(){
      document.querySelector('#visibility').classList.toggle('idle');
      document.querySelector('#visibility').textContent = 'Visible!';
    }, 250);
  },
  idle: initialDelay,
  keepTracking: true
}).start();
window.setTimeout( () => {
  let newDelay = 5000;
  idle.set({idle: newDelay});
  console.log(`now triggering in: ${newDelay}`)
}, 15*1000)
