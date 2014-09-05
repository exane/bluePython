var Entity = require("./Entity.js");
"use strict";


var Npc = (function(){
    var Npc = function(options, events, yourSide, otherSide){
        Entity.call(this, options, events, yourSide, otherSide);

    }
    __extends(Npc, Entity);
    var r = Npc.prototype;

    r.startAi = function(){

        this.doAttack();
    }

    r.doAttack = function(){
        var target = this.otherSide.member[0];

        this.ready({
            "do": "default_attack",
            "target": target,
            "from": this
        })
    }

    return Npc;
})();
module.exports = Npc;