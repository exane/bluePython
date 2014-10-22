require("./helper.js");
var Battle = require("./Battle.js");
window.pubsub = require("./pubsub.js");
"use strict";

var battle = new Battle();

//battle.adjustAnimSpeed(5);

battle.addNewPlayer("warrior", "side1", "side2");
battle.addNewPlayer("priest", "side1", "side2");
battle.addNewNpc("serpant_boss", "side2", "side1");



battle.init();
