var logger = require("../js/log.js");


module.exports = {
    firearmor: {
        onTurnBegin: function(){
            //console.log("firearmor on turn begin called!", this);
            var length = this.yourSide.length(true);

            this.buff({
                name: "Fire Armor",
                stats: {
                    def: length,
                    atk: length,
                    agi: length,
                    vit: length,
                    tec: length,
                    lck: length
                },
                duration: 1
            })


            logger.message(this.getFullName() + " ignites his armor!");

        }
    }
}