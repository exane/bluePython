var logger = require("../js/log.js");
var buffData = require("./buffs.js");



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
            return 1;//this.getMaxMana()*60/100 | 0;
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
            this.addBuff(buffData.load("attackboost"));

            logger.message("str boosted by 2. total str boosts: " + this.getBoostLevel("str"));
        },
        noTarget: true
    },
    defboost: {
        name: "Defense Boost",
        id: "defboost",
        costs: 100,
        onCast: function(opt){
            this.addBuff(buffData.load("defenseboost"));

            logger.message("def boosted by 2. total def boosts: " + this.getBoostLevel("def"));
        },
        noTarget: true
    },
    fumeboost: {
        name: "Fume Boost",
        id: "fumeboost",
        costs: 500,
        onCast: function(opt){
            this.addBuff(buffData.load("fumeboost"));

            logger.message("each stat increased by 300%! ");
        },
        noTarget: true
    },
    hot_test: {
        name: "HoT",
        id: "hot_test",
        target: "friendly",
        onCast: function(opt){

            logger.message(this.getFullName() + " casts HoT!");
            opt.target.addBuff(buffData.load("hot_test"), this);
            opt.target.addBuff(buffData.load("onHit_test"), this);
        }
    },
    rend: {
        name: "rend (dot)(debuff)",
        basePower: 20,
        id: "rend",
        isAoe: true,
        onCast: function(opt){
            logger.message(this.getFullName() + " rend his target!");
            opt.target.addDebuff(buffData.load("test_dot"));
        }

    },
    aimwater: {
        name: "Aimwater(buff)",
        id: "aimwater",
        target: "friendly",
        costs: 100,
        onCast: function(opt){
            logger.message(this.getFullName() + " drinks aimwater! critical chance increased!");
            opt.target.addBuff(buffData.load("aimwater_buff"));
        }
    }
}
