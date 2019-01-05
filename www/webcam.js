var canvas;
var context;
canvas.width = 200;
canvas.height = 200;
context.width;
context.height;
var video;
var socket;
var mediaSource;
var img;

function loadCam(stream)
{
  try{
    mediaSource = new MediaStream(stream);
    video.srcObject = mediaSource;
  }
  catch (error){ //src fallback
    console.log(`err: ${error}`)
    video.src = URL.createObjectURL(stream);
  }
}

function loadFail()
{
  console.log(`failed to load webcam, is it plugged in and do you have given permission?`);
}

function viewVideo(video,context)
{
  context.drawImage(video,0,0,context.width, context.height);
  socket.emit('stream',{img:canvas.toDataURL('image/webp'),user:userNameLocal});
}

function startWebCam(){
    canvas = document.getElementById("preview");
    context = canvas.getContext("2d");
    context.width = canvas.width;
    context.height = canvas.height;
    video = document.getElementById("video");
    //socket = io();
    img = document.getElementById('play');

    navigator.getUserMedia= (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msgGetUserMedia);
      if(navigator.getUserMedia)
      {
        navigator.getUserMedia({video : {width:200,height:200}},loadCam,loadFail);
      }
      setInterval(function(){
        viewVideo(video,context);
      },33);

      socket.on('stream',(image)=>{
            if(image.user != userNameLocal)
            {
              //console.log(image.user);
              var a = document.querySelector(`#${image.user}`);
              //console.log(a);
              if(a == null){
                console.log(`adding element`);
                $('.webcams').append(`<img id='${image.user}' class="remotecam">`)
              }
              var remote = document.getElementById(`${image.user}`);
              remote.src = image.img;
            }
            
      });
}