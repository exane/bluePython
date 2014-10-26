require("./helper.js");
var Battle = require("./Battle.js");
window.pubsub = require("./pubsub.js");
"use strict";

//window.Util = require("./Util.js");
//console.log(Util.formatNumber(100));
//console.log(Util.formatNumber(1000));
//console.log(Util.formatNumber(10000));

var battle = new Battle();

//battle.adjustAnimSpeed(5);

battle.addNewPlayer("warrior", "down"); // (id, yourSide) id = charID | yourSide = "top" || "down"
battle.addNewPlayer("rogue", "down");
battle.addNewPlayer("priest", "down");
battle.addNewNpc("serpant_boss", "top");//yo



battle.init();
