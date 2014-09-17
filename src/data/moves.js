var logger = require("../js/log.js");
var buffData = require("./buffs.js");


var self;

module.exports = self = {
    load: function(id){
        return $.extend(true, {}, self[id]);
    },
    default_attack: {
        basePower: 40,
        accuracy: 100,
        name: "Default Attack",
        id: "default_attack",
        icon: "assets/ace.png"
    },
    default_defense: {
        name: "Default Defense",
        priority: 1,
        onTurnBegin: function(){
            this.changeIncomingDmgMultiplierBy(-0.75);
            logger.message(this.getFullName() + " defends himself!");
        },
        onTurnEnd: function(){
            this.changeIncomingDmgMultiplierBy(0.75);
        },
        id: "default_defense",
        icon: "assets/ace.png"
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
        target: "friendly",
        icon: "assets/ace.png"
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
        },
        icon: "assets/ace.png"
    },
    quick_attack: {
        basePower: 80,
        name: "Quick Attack (first hit guaranteed)",
        accuracy: 90,
        priority: 2,
        isCrit: true,
        costs: 25,
        id: "quick_attack",
        icon: "assets/ace.png"
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
        target: "friendly",
        icon: "assets/ace.png"
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
        },
        icon: "assets/ace.png"
    },
    burnslash: {
        basePower: 30,
        name: "Burnslash (Aoe)",
        accuracy: 100,
        id: "burnslash",
        isAoe: true,
        priority: 0,
        costs: 150,
        icon: "assets/ace.png"
    },
    attackboost: {
        name: "Attack Boost",
        id: "attackboost",
        costs: 100,
        onCast: function(opt){
            this.addBuff(buffData.load("attackboost"), this);

            logger.message("str boosted by 2. total str boosts: " + this.getBoostLevel("str"));
        },
        noTarget: true
    },
    defboost: {
        name: "Defense Boost",
        id: "defboost",
        costs: 100,
        onCast: function(opt){
            this.addBuff(buffData.load("defenseboost"), this);

            logger.message("def boosted by 2. total def boosts: " + this.getBoostLevel("def"));
        },
        noTarget: true,
        icon: "assets/ace.png"
    },
    fumeboost: {
        name: "Fume Boost",
        id: "fumeboost",
        costs: 500,
        onCast: function(opt){
            opt.target.addBuff(buffData.load("fumeboost"), this);

            logger.message("each stat increased by 300%! ");
        },
        target: "self",
        icon: "assets/ace.png"
    },
    hot_test: {
        name: "HoT",
        id: "hot_test",
        target: "friendly",
        onCast: function(opt){

            logger.message(this.getFullName() + " casts HoT!");
            opt.target.addBuff(buffData.load("hot_test"), this);
            opt.target.addBuff(buffData.load("onHit_test"), this);
        },
        icon: "assets/ace.png"
    },
    aimwater: {
        name: "Aimwater(buff)",
        id: "aimwater",
        //noTarget: true,
        target: "self",
        desc: "Increases your crit chance by 50% and your crit damage by 200%. Costs 100 mana. Lasts 5 turns.",
        costs: 100,
        onCast: function(opt){
            logger.message(this.getFullName() + " drinks aimwater! critical chance increased!");
            opt.target.addBuff(buffData.load("aimwater_buff"), this);
        },
        icon: "assets/ace.png"
    },

    mortal_strike: {
        name: "Mortal Strike",
        id: "mortal_strike",
        basePower: 90,
        target: "enemy",
        desc: "Causes enormous damage and reduces all incoming healing on target by 50%. Costs 50 Mana.",
        costs: 50,
        onCast: function(opt){
            logger.message(opt.target.getFullName() + " suffers great pain! Received healing is reduced by 50%.");
            opt.target.addDebuff(buffData.load("mortal_strike_debuff"), this);
        },
        icon: "assets/battered-axe.png"
    },
    rend: {
        name: "Rend (Aoe)",
        desc: "Target bleeds each turn. Each Dmg on this target is also increased by 20%. Costs 20 Mana.",
        basePower: 10,
        id: "rend",
        isAoe: true,
        costs: 20,
        onCast: function(opt){
            logger.message(this.getFullName() + " rend his target!");
            opt.target.addDebuff(buffData.load("rend_debuff"), this);
        },
        icon: "assets/ragged-wound.png"
    },
    bloodthirst: {
        name: "Bloodthirst",
        desc: "Instantly attack the target and heals you by 30% of damage you have dealt. Bloodthirst has double the normal chance to be a critical strike. Costs 30 Mana.",
        basePower: 50,
        id: "bloodthirst",
        target: "enemy",
        costs: 30,
        onBeforeAttack: function(opt){
            opt.isCrit = this.calculateCrit(this.calculateCritChance() * 2);
        },
        onAfterAttack: function(opt, dmg){
            var val = dmg * 30 / 100;
            this.changeHpBy(val);

            //opt.isCrit = this.calculateCrit(this.calculateCritChance() * 2);
        },
        icon: "assets/swallow.png"
    },
    bladestorm: {
        name: "Bladestorm (Aoe)",
        desc: "You become a whirling storm of destructive force, hitting all targets 5 times. Costs 20 Mana each spin.",
        basePower: 15,
        id: "bladestorm",
        target: "enemy",
        isAoe: true,
        costs: 20,
        multiple: 5,
        onCast: function(opt){

        },
        icon: "assets/spinning-sword.png"
    },
    battle_shout: {
        name: "Battle Shout",
        desc: "Increase strength and vitality by 10%. Additionally you gain 30 mana.",
        id: "battle_shout",
        target: "friendly",
        isAoe: true,
        //costs: 50,
        onCast: function(opt){
            opt.target.addBuff(buffData.load("battle_shout"), this);
            if(opt.target.getId() === this.getId())
                this.changeManaBy(30);
        },
        icon: "assets/sonic-shout.png"
    }
}
