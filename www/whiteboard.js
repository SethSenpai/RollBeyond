'use strict';

//wholesale copy from the socket.io whiteboard example. --> https://socket.io/demos/whiteboard/

function startWhiteboard() {

  //var socket = io();
  var canvas = document.getElementsByClassName('whiteboard')[0];
  var colors = document.getElementsByClassName('color');
  var context = canvas.getContext('2d');
  var tool = 2;
  var linewd = 2;

  var current = {
    color: 'black'
  };
  var drawing = false;

  canvas.width = 2960;
  canvas.height = 1960;

  canvas.addEventListener('mousedown', onMouseDown, false);
  canvas.addEventListener('mouseup', onMouseUp, false);
  canvas.addEventListener('mouseout', onMouseUp, false);
  canvas.addEventListener('mousemove', throttle(onMouseMove, 10), false);
  
  //Touch support for mobile devices
  canvas.addEventListener('touchstart', onMouseDown, false);
  canvas.addEventListener('touchend', onMouseUp, false);
  canvas.addEventListener('touchcancel', onMouseUp, false);
  canvas.addEventListener('touchmove', throttle(onMouseMove, 10), false);

  [...document.querySelectorAll(".noDefault")].forEach(e => 
    e.addEventListener('contextmenu', el => el.preventDefault()));

  //add event listener for tool selection
  $("input[type='radio']").on('change', function () {
    tool = $("input[name='options']:checked").val();
    if(tool == 3){
      current.color = '#d9d8ca';
      linewd = 50;
    }
    if(tool == 1){
      current.color = 'black';
      linewd = 2;
    }
  });

  for (var i = 0; i < colors.length; i++){
    colors[i].addEventListener('click', onColorUpdate, false);
  }

  socket.on('drawing', onDrawingEvent);

  //window.addEventListener('resize', onResize, false);
  //onResize();


  function drawLine(x0, y0, x1, y1, color, emit, lineW){
    if(emit){
      offset = $('.whiteboard').offset();

      context.beginPath();
      context.moveTo(x0 - offset.left, y0 - offset.top);
      context.lineTo(x1 - offset.left, y1 - offset.top);
      context.strokeStyle = color;
      context.lineWidth = linewd;
      context.stroke();
      context.closePath();
    }
    else
    {
      context.beginPath();
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
      context.strokeStyle = color;
      context.lineWidth = lineW;
      context.stroke();
      context.closePath();
    }


    if (!emit) { return; }
    var w = 2960;
    var h = 1960;

    console.log(`emiting drawing`);
    socket.emit('drawing', {
      x0: x0 - offset.left,
      y0: y0 - offset.top,
      x1: x1 - offset.left,
      y1: y1 - offset.top,
      color: color,
      width: linewd
    });
  }

  function onMouseDown(e){
    if(tool != 1 && tool !=3){return;}
    if(e.button != 0){return};
    drawing = true;
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
  }

  function onMouseUp(e){
    if (tool != 1 && tool !=3) { return; }
    if (!drawing) { return; }
    if(e.button != 0){return};
    drawing = false;
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true, 2);
  }

  function onMouseMove(e){
    if (tool != 1 && tool !=3) { return; }
    if (!drawing) { return; }
    if(e.button != 0){return};
    drawLine(current.x, current.y, e.clientX||e.touches[0].clientX, e.clientY||e.touches[0].clientY, current.color, true, 2);
    current.x = e.clientX||e.touches[0].clientX;
    current.y = e.clientY||e.touches[0].clientY;
  }

  function onColorUpdate(e){
    if(tool != 3)
    {
      current.color = e.target.className.split(' ')[1];
    }
  }

  // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

  function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 , data.y0 , data.x1 , data.y1 , data.color , false , data.width);
  }

  // make the canvas fill its parent
  function onResize() {
    canvas.width = 2960;
    canvas.height = 1960;
  }

}