require("./helper.js");
var Battle = require("./Battle.js");
window.pubsub = require("./pubsub.js");
"use strict";

var battle = new Battle();

//battle.adjustAnimSpeed(5);

battle.addNewPlayer("paladin", "down");
battle.addNewPlayer("warrior", "down"); // (id, yourSide) id = charID | yourSide = "top" || "down"
battle.addNewPlayer("rogue", "down");
battle.addNewPlayer("priest", "down");
battle.addNewNpc("serpant_boss", "top");
//battle.addNewNpc("serpant_boss", "top");



battle.init();
