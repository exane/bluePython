var logger = require("../js/log.js");

/*
 * possible events:
 * onBeforeAttack
 * onAfterAttack
 * onTurnBegin
 * onTurnEnd
 * onCast // alternative to attacks with basePower
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
        boost: function(){
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
        onBeforeAttack: function(){
            logger.message(this.getFullName() + " sacrifices himself and causes an explosion!");
        },
        onAfterAttack: function(){
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
                stats: {
                    atk: 2
                },
                duration: 5
            });

            logger.message("atk boosted by 2. total atk boosts: "+ this.boosts.atk);
        },
        noTarget: true
    }
}
