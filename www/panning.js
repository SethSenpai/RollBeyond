function runPanningHooks(){
    var tool = 2;
    var dragging = false;
    var startpoint;
    var standpoint

    //add event listener for tool selection
    $("input[type='radio']").on('change', function () {
        tool = $("input[name='options']:checked").val();
    });

    $('.whiteboard')
    .mousedown(()=>{mdpan(2);})
    .mouseup(()=>{mupan(3);})
    .mousemove(()=>{mmpan(4);});

    function mdpan(e){
        if(tool != 3){return;}
        dragging = true;
        startpoint = {x:event.pageX,y:event.pageY};
        var x = $('.whiteboard').prop('scrollWidth');
        var y = $('.whiteboard').prop('scrollHeight');
        standpoint = {x:x,y:y};
    }

    function mupan(e){
        if(tool != 3){return;}
        dragging = false;
    }

    function mmpan(e){
        if(tool != 3){return;}
        if(dragging){
            var x = event.pageX - startpoint.x;
            var y = event.pageY - startpoint.y;
            console.log(`x: ${x} y: ${y}`);
            //$('#mdl-layout__content').scrollTop(y);
            $('.mdl-layout__content').scrollTop($('.mdl-layout__content').scrollTop() + y);
            //$('.page-content').scrollLeft(x* -1);
        }
    }
}