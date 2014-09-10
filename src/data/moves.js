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
 * costs false | number | function
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
        basePower: 40,
        accuracy: 100,
        name: "Default Attack",
        id: "default_attack"
    },
    default_defense: {
        name: "Default Defense",
        priority: 1,
        onTurnBegin: function(){
            this.changeIncomingDmgMultiplierBy(.25);
            logger.message(this.getFullName() + " defends himself!");
        },
        onTurnEnd: function(){
            this.changeIncomingDmgMultiplierBy(4);
        },
        id: "default_defense"
    },
    heal: {
        name: "Heal",
        id: "heal",
        costs: 100,
        onCast: function(opt){
            var val;
            if(opt.target.isFainted()){
                logger.message(this.getFullName() + " uses Heal on " + opt.target.getFullName());
                logger.message(opt.target.getFullName() + " is not alive...");
                return 0;
            }
            opt.target.changeHpBy(val = 200 + this.getSpecialAttackPower());
            logger.message(this.getFullName() + " heals " + opt.target.getFullName()
                + " by " + val + " hp!");
        },
        target: "friendly"
    },
    assassination: {
        id: "assassination",
        name: "Assassination (instant kill)",
        basePower: 100,
        priority: 1,
        costs: function(){
            return this.getMaxMana()*60/100 | 0;
        },
        onAttack: function(opt){
            var enemy = opt.target;
            enemy.changeHpBy(-enemy.getMaxHp());
            logger.message(this.getFullName() + " cut " + enemy.getFullName() + "'s throat!")
        }
    },
    quick_attack: {
        basePower: 80,
        name: "Quick Attack (first hit guaranteed)",
        accuracy: 90,
        priority: 2,
        isCrit: true,
        costs: 25,
        id: "quick_attack"
    },
    revive: {
        name: "Revive",
        id: "revive",
        costs: 200,
        onCast: function(opt){
            var target = opt.target;
            logger.message(this.getFullName() + " revives " + target.getFullName() + "!");
            if(!target.isFainted()){
                return logger.message(this.getFullName() + "'s revive failed! Target is alive.");
            }
            target.revive(1 + this.getSpecialAttackPower() * 0.25);
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
        basePower: 30,
        name: "Burnslash (Aoe)",
        accuracy: 100,
        id: "burnslash",
        isAoe: true,
        priority: 0,
        costs: 150
    },

    attackboost: {
        name: "Attack Boost",
        id: "attackboost",
        costs: 100,
        onCast: function(opt){
            this.addBuff({
                name: "Attack boost",
                stats: {
                    str: 2
                },
                duration: 5,
                icon: "assets/muscle-up.png"
            });

            logger.message("str boosted by 2. total str boosts: " + this.getBoostLevel("str"));
        },
        noTarget: true
    },
    defboost: {
        name: "Defense Boost",
        id: "defboost",
        costs: 100,
        onCast: function(opt){
            this.addBuff({
                name: "Defense boost",
                stats: {
                    def: 2
                },
                duration: 5,
                icon: "assets/aura.png"
            });

            logger.message("def boosted by 2. total def boosts: " + this.getBoostLevel("def"));
        },
        noTarget: true
    },
    fumeboost: {
        name: "Fume Boost",
        id: "fumeboost",
        costs: 500,
        onCast: function(opt){
            this.addBuff({
                name: "Fume boost",
                stats: {
                    def: 6,
                    str: 6,
                    agi: 6,
                    vit: 6,
                    tec: 6,
                    lck: 6
                },
                duration: 20,
                icon: "assets/devfake.jpg"
            });

            logger.message("each stat increased by 300%! ");
        },
        noTarget: true
    }
}
