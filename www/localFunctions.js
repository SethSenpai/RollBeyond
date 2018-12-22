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