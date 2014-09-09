var logger = require("../js/log.js");


module.exports = self = {
    firearmor: {
        onTurnBegin: function(){
            //console.log("firearmor on turn begin called!", this);
            var length = this.getYourside().length(true);

            //console.log(this);
            var currMaxHp = this.getMaxHp();
            var currHp = this.getHp();

            var percentageOfHp = 100*currHp/currMaxHp;

            this.setBuffTo({
                name: "Fire Armor",
                stats: {
                    def: length,
                    atk: length,
                    agi: length,
                    vit: length,
                    tec: length,
                    lck: length
                },
                duration: -1
            })

            var newCurrMaxHp = this.getMaxHp();

            this.setHpTo(newCurrMaxHp*percentageOfHp/100);


            logger.message(this.getFullName() + " ignites his armor!");

        },
        onFaint: function(e, opt){
            self.firearmor.onTurnBegin.call(this);
        },
        onRevive: function(e, opt){
            self.firearmor.onTurnBegin.call(this);
        }

    }
}