var Entity = require("./Entity.js");
"use strict";


var Enemy = (function(){
    var Enemy = function(options, events, yourSide, otherSide){
        Entity.call(this, options, events, yourSide, otherSide);

    }
    __extends(Enemy, Entity);
    var r = Enemy.prototype;

    r.startAi = function(){

        this.doAttack();
    }

    r.doAttack = function(){
        var target = this.otherSide.member[0];
        var self = this;

        //testing
        var hasSacrifice = (function(){
            for(var i = 0; i < self.skillList.length; i++) {
                if(self.skillList[i] === "sacrifice") return true;

            }
            return false;
        })();

        this.ready({
            "do": "default_attack",
            "target": target,
            "from": this
        })
    }

    return Enemy;
})();
module.exports = Enemy;