var canvas;
var context;
canvas.width = 320;
canvas.height = 240;
context.width;
context.height;
var video;
var socket;


function loadCam(stream)
{
  video.src = window.URL.createObjectURL(stream);
  //logger('camara cargada correctamente [OK]');
}

function loadFail()
{
  logger('Camara no encontrada, revise la camara');
}

function viewVideo(video,context)
{
  context.drawImage(video,0,0,context.width, context.height);
  socket.emit('stream',canvas.toDataURL('image/webp'));
}

function startWebCam(){
    canvas = document.getElementById("preview");
    context = canvas.getContext("2d");
    context.width = canvas.width;
    context.height = canvas.height;
    video = document.getElementById("video");
    socket = io();

    navigator.getUserMedia= (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msgGetUserMedia);
      if(navigator.getUserMedia)
      {
        navigator.getUserMedia({video : true},loadCam,loadFail);
      }
      setInterval(function(){
        viewVideo(video,context);
      },120);
}