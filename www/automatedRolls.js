function hookSheetAutoRolls(){
    $('.ct-saving-throws-summary__ability--str').click(()=>{
        var a = $('.ct-saving-throws-summary__ability--str').children('.ct-saving-throws-summary__ability-modifier').children('.ct-signed-number').children('.ct-signed-number__sign').text();
        var b = $('.ct-saving-throws-summary__ability--str').children('.ct-saving-throws-summary__ability-modifier').children('.ct-signed-number').children('.ct-signed-number__number').text();
        //console.log(a);
        var c = `/r 1d20${a}${b}`;
        rollWrapper(c);
    });
}