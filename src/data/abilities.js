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



        },
        onFaint: function(e, opt){
            //self.firearmor.onTurnBegin.call(this);
        },
        onRevive: function(e, opt){
            //self.firearmor.onTurnBegin.call(this);
        }

    },
    prayer: {
        onTurnEnd: function(){
            this.changeManaBy(20);
        }
    }
}