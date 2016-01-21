idleJs = require("./src/idle-js.js")
console.log('hello')
new idleJs({
    onIdle: function (){
                  console.log('idle !');
                    }
}).start();
