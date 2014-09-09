var logger = require("../js/log.js");


module.exports = self = {
    firearmor: {
        onTurnBegin: function(){
            //console.log("firearmor on turn begin called!", this);
            var length = this.getYourside().length(true);

            //console.log(this);
            var currMaxHp = this.getMaxHp();
            var currHp = this.getHp();
            var currMaxMana = this.getMaxMana();
            var currMana = this.getMana();

            var percentageOfHp = 100*currHp/currMaxHp;
            var percentageOfMana = 100*currMana/currMaxMana;

            this.setBuffTo({
                name: "Fire Armor",
                stats: {
                    def: length,
                    str: length,
                    agi: length,
                    vit: length,
                    tec: length,
                    lck: length
                },
                duration: -1
            })

            var newCurrMaxHp = this.getMaxHp();
            var newCurrMaxMana = this.getMaxMana();

            this.setHpTo(newCurrMaxHp*percentageOfHp/100);
            this.setManaTo(newCurrMaxMana*percentageOfMana/100);


            logger.message(this.getFullName() + " ignites his armor!");

        },
        onFaint: function(e, opt){
            self.firearmor.onTurnBegin.call(this);
        },
        onRevive: function(e, opt){
            self.firearmor.onTurnBegin.call(this);
        }

    },
    prayer: {
        onTurnEnd: function(){
            this.changeManaBy(20);
        }
    }
}