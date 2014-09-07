require("./helper.js");
var Battle = require("./Battle.js");
"use strict";

var battle = new Battle();

battle.init();

//debug only!
battle.onGameOver(function(){
    battle = new Battle();
    battle.init();
});
//console.log(battle);