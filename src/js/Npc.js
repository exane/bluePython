var Entity = require("./Entity.js");
"use strict";


var Npc = (function(){
    var Npc = function(options, yourSide, otherSide){
        Entity.call(this, options, yourSide, otherSide);


        this.ai = options.ai || this.ai;

    }
    __extends(Npc, Entity);
    var r = Npc.prototype;
    r.ai = true;

    r.startAi = function(){
        if(this.isFainted()) return 0;

        this.turnAction.from = this;
        this.turnAction.target = this.chooseTarget();


        if(typeof this.ai == "function"){
            this.ai.call(this);

            this.ready(this.turnAction);
        }

        else {
            this.doAttack();
        }

    }

    r.doAttack = function(){
        var target = this.chooseTarget();

        this.ready({
            "do": "default_attack",
            "target": target,
            "from": this
        })
    }

    r.chooseTarget = function(){
        var target = this.getOtherside().getRandomMember(true);
        return target;
    }

    return Npc;
})();
module.exports = Npc;