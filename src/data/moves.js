var logger = require("../js/log.js");

/*
 *
 * id required
 * name required
 * basePower null | number
 * isCrit false | true
 * priority 0
 * target "enemy" | "friendly"
 * accuracy 100
 * isAoe false | true
 * noTarget false | true
 *
 * possible events: (context: user | params: opt.target, opt.yourSide, opt.otherSide)
 * onTurnBegin
 * onBeforeAttack
 * onAttack
 * onCast // alternative to onAttack, without basePower attr
 * onAfterAttack
 * onTurnEnd

 also:
 - id muss und sollte extakt gleich heißen wie
    die object notation ( test { id: "test"} )
 - überall wo kein required dabei steht können
    weggelassen werden. die ersten werte sind immer
    die default werte falls man sie nicht mit angibt.
    im falle von basePower wird default null sein
    (falls man ein buff kreieren will, oder ne
    attacke ohne anzugreifen/dmg zu machen)
 - isCrit is nur dazu da um einen crit zu erzwingen..
    oder eben genau das gegenteil: wenn wert weggelassen wird
    (also weder true noch false) dann wird für die attacke
    ganz normal crit kalkuliert
 - priority is die erzwungende angriffsreihenfolge.
    0 is standard und alles darunter und drüber wird
    extra bei der angriffsreihenfolge berechnet
    (also jemand mit 1 greift vor allen an die < 1 haben,
    die mit <0 sind sogar nach allen standard attacken drann)
 - genauigkeit is in prozent
 - noTarget is eine flag für den player das er kein
    target aussuchen muss
 */


module.exports = {
    default_attack: {
        basePower: 30,
        accuracy: 100,
        name: "Default Attack",
        id: "default_attack"
    },
    default_defense: {
        name: "Default Defense",
        priority: 1,
        boost: function(){ //deprecated!
            this.boosts.def += 2;
            logger.message(this.name + " defends himself!");
        },
        onTurnEnd: function(){
            this.boosts.def -= 2;
        },
        id: "default_defense"
    },
    heal: {
        name: "Heal",
        id: "heal",
        onCast: function(opt){
            if(opt.target.fainted){
                logger.message(this.getFullName() + " uses Heal on " + opt.target.getFullName());
                logger.message(opt.target.getFullName() + " is not alive...");
                return 0;
            }
            opt.target.changeHpBy(200);
            logger.message(this.getFullName() + " heals " + opt.target.getFullName()
                + " by 200 hp!");
        },
        target: "friendly"
    },
    assassination: {
        id: "assassination",
        name: "Assassination (instant kill)",
        basePower: 100,
        priority: 1,
        onAttack: function(opt){
            var enemy = opt.target;
            enemy.changeHpBy(-enemy.maxHp);
            logger.message(this.getFullName() + " cut " + enemy.getFullName() + "'s throat!")
        }
    },
    quick_attack: {
        basePower: 50,
        name: "Quick Attack (first hit guaranteed)",
        accuracy: 90,
        priority: 2,
        isCrit: true,
        id: "quick_attack"
    },
    revive: {
        name: "Revive",
        id: "revive",
        onCast: function(opt){
            var target = opt.target;
            logger.message(this.getFullName() + " revives " + target.getFullName() + "!");
            if(!target.fainted){
                return logger.message(this.getFullName() + "'s revive failed! Target is alive.");
            }
            target.revive(1);
        },
        target: "friendly"
    },

    sacrifice: {
        basePower: 300,
        name: "sacrifice",
        accuracy: 100,
        priority: -1,
        id: "sacrifice",
        onBeforeAttack: function(opt){
            logger.message(this.getFullName() + " sacrifices himself and causes an explosion!");
        },
        onAfterAttack: function(opt){
            this.changeHpBy(-this.maxHp);
        }
    },

    burnslash: {
        basePower: 20,
        name: "Burnslash (Aoe)",
        accuracy: 100,
        id: "burnslash",
        isAoe: true,
        priority: 0
    },

    ultrabuffDEBUG: {
        name: "debug buff testing",
        id: "ultrabuffDEBUG",
        onCast: function(opt){
            this.buff({
                name: "buff testing",
                stats: {
                    atk: 2
                },
                duration: 5
            });

            logger.message("atk boosted by 2. total atk boosts: " + this.boosts.atk);
        },
        noTarget: true
    }
}
