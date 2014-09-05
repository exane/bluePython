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
            this.boosts.def += 1;
            logger.message(this.name + " defends himself!");
        },
        onTurnEnd: function(){
            this.boosts.def -= 1;
        },
        id: "default_defense"
    },
    heal: {
        name: "Heal",
        id: "heal"
    },
    assassination: {
        id: "assassination",
        name: "Assassination (instant kill)",
        basePower: 100,
        priority: 1,
        onAttack: function(enemy){
            enemy.changeHpBy(-enemy.maxHp);
            logger.message(this.getFullName() + " cut " + enemy.getFullName() + "'s throat!")
        }
    },
    quick_attack: {
        basePower: 50,
        name: "Quick Attack",
        accuracy: 90,
        priority: 2,
        id: "quick_attack"
    },
    revive: {
        name: "Revive",
        id: "revive",
        onCast: function(target){
            logger.message(this.getFullName() + " revives " + target.getFullName() + "!");
            if(!target.fainted){
                return logger.message(this.getFullName() + "'s revive failed! Target is alive.");
            }
            target.revive(1);
        }

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
    }
}
