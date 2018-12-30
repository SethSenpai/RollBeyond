//import { Socket } from "dgram";

function getCharSheet(login, charName, windowSize){
    $.get('/charSheet',{w:windowSize}, (data)=>{
        console.log(`requesting character sheet`);
        $('#charSheet').empty();
        $.when( $('#charSheet').append(data.b) )
            .done(() => {
                $('.ct-primary-box__tab--actions')
                .click(()=>{swapCharTab(0);});
                $('.ct-primary-box__tab--spells')
                .click(()=>{swapCharTab(1);});
                $('.ct-primary-box__tab--equipment')
                .click(()=>{swapCharTab(2);});
                $('.ct-primary-box__tab--features')
                .click(()=>{swapCharTab(3);});
                $('.ct-primary-box__tab--creatures')
                .click(()=>{swapCharTab(4);});
            }
            );
        

        actionsDom = data.a;
        spellsDom = data.s;
        equipmentDom = data.e;
        featuresDom = data.f;
        creaturesDom = data.c;
        console.log(data);
    })
}

function enablerollsClick(){
    var socket = io();

    $('#confirmRoll').click(()=>{
        var r = $('#confirmEnterRoll').val();
        sendRollToServer(r);
        $('#confirmEnterRoll').val('');
    });

    $('#confirmEnterRoll').keypress((e)=>{
        if(e.which == 13){
            e.preventDefault();
            var r = $('#confirmEnterRoll').val();
            sendRollToServer(r);
            $('#confirmEnterRoll').val('');
        }
    });

    function sendRollToServer(r){
        console.log(`rolls send: ${r}`);
        socket.emit('chat' , r);
    }
}

function windowDraggingRolls(){
    $('.topBar').mousedown(()=>{
        movingWindow = true;
        offset = $('.topBar').offset();
        offset.left = event.pageX- offset.left;
        offset.top = event.pageY - offset.top;
        //console.log(`offset: l${offset.left} t${offset.top}`);
    });

    $('body').mousemove(()=>{
        if(movingWindow == true){
            var x = event.pageX - offset.left;
            var y = event.pageY - offset.top;
            //console.log(`dragging x:${parentOffset.left}, y:${parentOffset.top}`);
            $('#rollsWindow').css('top',y);
            $('#rollsWindow').css('left', x);
        }
    });

    $('body').mouseup(()=>{
        movingWindow = false;
        //console.log(`upclick`);
    });
}

function swapCharTab(n){
    console.log(`swapping content to ${n}`);
    switch(n){
        case 0:
            $('.ct-tab-list__content').empty();
            $('.ct-tab-list__content').append(actionsDom);
        break;
        case 1:
            $('.ct-tab-list__content').empty();
            $('.ct-tab-list__content').append(spellsDom);
        break;
        case 2:
            $('.ct-tab-list__content').empty();
            $('.ct-tab-list__content').append(equipmentDom);
        break;
        case 3:
            $('.ct-tab-list__content').empty();
            $('.ct-tab-list__content').append(featuresDom);
        break;
        case 4:
            $('.ct-tab-list__content').empty();
            $('.ct-tab-list__content').append(creaturesDom);
        break;
    }
}