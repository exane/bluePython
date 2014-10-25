var logger = require("../js/log.js");
var buffData = require("./buffs.js");

var self;
module.exports = self = {
    firearmor: {
        onTurnBegin: function(){

            var firearmor = buffData.load("firearmor");

            if(this.hasBuff("Fire Armor") || this.isFainted())
                return 0;

            logger.message(this.getFullName() + " ignites his armor!");

            this.addBuffOnce(firearmor);



        }

    },
    prayer: {
        onTurnEnd: function(){
            this.changeManaBy(30);
        }
    },
    endless_rage: {
        onTurnBegin: function(){


            if(this.hasBuff("Endless Rage") || this.isFainted()){
                return 0;
            }
            var endless_rage = buffData.load("endless_rage");

            logger.message(this.getFullName() + " is shouting out loud!");

            this.addBuffOnce(endless_rage);



        }
    },
    calm_mind: {
        onTurnEnd: function(){
            this.changeManaBy(20);
        }
    }

}