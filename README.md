# idle-js

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

`npm install idle-js --save`

## Usage

```js
// Those are the default values
var idle = new idleJs({
  idle: 10000, // idle time in ms
  events: ['mousemove', 'keydown', 'mousedown', 'touchstart'], // events that will trigger the idle resetter
  onIdle: function () {}, // callback function to be executed after idle time
  onActive: function () {}, // callback function to be executed after back form idleness
  onHide: function () {}, // callback function to be executed when window become hidden
  onShow: function () {}, // callback function to be executed when window become visible
  keepTracking: true, // set it to false of you want to track only once
  startAtIdle: false // set it to true if you want to start in the idle state
}).start();
```

## Running examples

#### Webpack:

* Run the command `webpack ./example/webpack/entry.js ./example/webpack/bundle.js`.
* Open `./example/webpack/index.html` in your browser.

#### In browser:

* Open `./example/vanilla/index.html`