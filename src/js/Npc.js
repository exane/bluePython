var Entity = require("./Entity.js");
var moveData = require("../data/moves.js");
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


        if(typeof this.ai == "function"){
            this.ai.call(this);

            if(!this.turnAction.target){

                this.turnAction.target = this.chooseTarget();
                this.checkMove();
            }

            this.ready(this.turnAction);
        }

        else {
            this.doAttack();
        }

    }

    r.checkMove = function(){
        var move = moveData[this.turnAction.do];

        if(move.target === "friendly"){
            this.turnAction.target = this.chooseTarget(true);
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

    r.chooseTarget = function(isFriendly){
        var target = this.getOtherside().getRandomMember(true);
        if(isFriendly){
            target = this.getYourside().getRandomMember(true);
        }
        return target;
    }

    return Npc;
})();
module.exports = Npc;