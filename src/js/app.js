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

battle.addNewPlayer("paladin", "side1", "side2");
battle.addNewPlayer("warrior", "side1", "side2");
battle.addNewPlayer("priest", "side1", "side2");
battle.addNewPlayer("serpant_boss", "side2", "side1");



battle.init();
