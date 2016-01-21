# idle-js

Get bus
[comment]: <> ([![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/))

# Testing
 
Webpack:
Using webpack, create an entry.js file with the following code:
```
  idleJs = require("./src/idle-js.js")
  console.log('hello')
  new idleJs({
    onIdle: function (){
      console.log('idle !');
    }
  }).start();
```

And an index file with the following code:
```
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <script type="text/javascript" src="bundle.js" charset="utf-8"></script>
  </body>
</html>
```

Run the command webpack ./entry.js bundle.js and open index.html in your browser.

With script tag: (the file you are looking for is in the dist directory)

```
<!DOCTYPE html>
<html>
<head>
  <title>Vanilla Idle</title>
  <style>
    #status, #visibility{
      background-color: #E6EFC2;
      border-color: #C6D880;
      color: #264409;
      padding:20px;
      text-align: center;
      width:100px;
    }
    #status.idle, #visibility.idle{
      background-color: #FFF6BF;
      border-color: #FFD324;
      color: #514721;
    }
  </style>
</head>
<body>
  <h1>Vanilla Idle</h1>
  <div id="status">Active!</div>
  <div id="visibility">Visible!</div>

  <script type="text/javascript" src="./dist/idle-js.js"></script>
  <script type="text/javascript">
    idle({
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
      idle: 2000,
      keepTracking: true
    }).start();
  </script>
</body>
</html>
```

