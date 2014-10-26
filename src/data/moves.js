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
            target.revive(1 + this.getSpecialAttackPower()*500);
        },
        target: "friendly",
        icon: "assets/ace.png"
    },
    mortal_strike: {
        name: "Mortal Strike",
        id: "mortal_strike",
        basePower: 100,
        target: "enemy",
        desc: "Causes enormous damage and reduces all incoming healing on target by 50%. Costs 50 Mana.",
        costs: 50,
        onCast: function(opt){
            logger.message(opt.target.getFullName() + " suffers great pain! Received healing is reduced by 50%.");
            opt.target.addDebuff(buffData.load("mortal_strike_debuff"), this);
        },
        icon: "assets/battered-axe.png"
    },
    shieldwall: {
        name: "Shieldwall",
        id: "shieldwall",
        target: "self",
        desc: "Causes enormous damage and reduces all incoming healing on target by 50%. Costs 50 Mana.",
        costs: 0,
        priority: 1,
        cooldown: 3,
        onCast: function(opt){
            //logger.message(opt.target.getFullName() + " suffers great pain! Received healing is reduced by 50%.");
            //opt.target.addDebuff(buffData.load("mortal_strike_debuff"), this);
            opt.target.addBuff(buffData.load("shieldwall_buff"));
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
        desc: "Instantly attack the target and heals you by 50% of damage you have dealt. Bloodthirst has double the normal chance to be a critical strike. Costs 30 Mana.",
        basePower: 80,
        id: "bloodthirst",
        target: "enemy",
        costs: 30,
        onBeforeAttack: function(opt){
            opt.isCrit = this.calculateCrit(this.calculateCritChance() * 2);
        },
        onAfterAttack: function(opt, dmg){
            var val = dmg * 50 / 100;
            this.changeHpBy(val);

            //opt.isCrit = this.calculateCrit(this.calculateCritChance() * 2);
        },
        icon: "assets/swallow.png"
    },
    bladestorm: {
        name: "Bladestorm (Aoe)",
        desc: "You become a whirling storm of destructive force, hitting all targets 5 times. Costs 20 Mana each spin. Cooldown for 5 turns.",
        basePower: 15,
        id: "bladestorm",
        target: "enemy",
        isAoe: true,
        costs: 20,
        multiple: 5,
        cooldown: 5,
        onCast: function(opt){

        },
        icon: "assets/spinning-sword.png"
    },
    battle_shout: {
        name: "Battle Shout",
        desc: "Increase strength and vitality by 10%. Additionally you gain 50 mana. Lasts 5 turns.",
        id: "battle_shout",
        target: "friendly",
        isAoe: true,
        //costs: 50,
        cooldown: 5,
        onCast: function(opt){
            opt.target.addBuff(buffData.load("battle_shout"), this);
            if(opt.target.getId() === this.getId())
                this.changeManaBy(50);
        },
        icon: "assets/sonic-shout.png"
    },
    taunt: {
        name: "Taunt",
        desc: "Increases chance of enemies attacking you  by 80% for 5 turns. Costs 0 mana. Cooldown for 5 turns.",
        id: "taunt",
        target: "enemy",
        isAoe: true,
        costs: 0,
        cooldown: 4,
        onCast: function(opt){
            logger.message(this.getFullName() + " taunts " + opt.target.getFullName() + "!");
            opt.target.addDebuff(buffData.load("taunt_debuff"), this);
        },
        icon: "assets/sonic-shout.png"
    },
    renew: {
        name: "Renew",
        desc: "",
        id: "renew",
        target: "friendly",
        //isAoe: true,
        costs: 50,
        onCast: function(opt){
            logger.message(this.getFullName() + " casts renew on " + opt.target.getFullName());
            opt.target.addBuff(buffData.load("renew_buff"), this);

        },
        icon: "assets/lotus-flower.png"
    },
    absorb_shield: {
        name: "Magic Shield Absorb",
        desc: "Absorbs 3000 damage. Costs 350 mana.",
        id: "absorb_shield",
        target: "friendly",
        costs: 350,
        onCast: function(opt){
            logger.message(this.getFullName() + " casts Magic Shield Absorb on " + opt.target.getFullName());
            opt.target.addBuff(buffData.load("absorb_shield_buff"), this);

        },
        icon: "assets/aura.png"
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
            opt.target.changeHpBy(val = 1100 * this.getSpecialAttackPower() | 0);
            logger.message(this.getFullName() + " heals " + opt.target.getFullName()
                + " by " + val + " hp!");
        },
        target: "friendly",
        icon: "assets/ace.png"
    },
    aoe_heal: {
        name: "Heal(Aoe)",
        id: "aoe_heal",
        costs: 300,
        isAoe: true,
        onCast: function(opt){
            var val;
            if(opt.target.isFainted()){
                logger.message(this.getFullName() + " uses Heal(Aoe) on " + opt.target.getFullName());
                logger.message(opt.target.getFullName() + " is not alive...");
                return 0;
            }
            opt.target.changeHpBy(val = 600 * this.getSpecialAttackPower() | 0);
            logger.message(this.getFullName() + " heals " + opt.target.getFullName()
                + " by " + val + " hp!");
        },
        target: "friendly",
        icon: "assets/ace.png"
    },
    spawn_mage: {
        name: "(spawn) gnomemage",
        id: "spawn_mage",
        costs: 0,
        onCast: function(opt){
            this.spawnAlly("gnomemage", false).setTmp(true);
            this.spawnAlly("gnomemage", false).setTmp(true);
            logger.message(this.getFullName() + " is summoning his minions!");
        },
        target: "self",
        icon: "assets/ace.png"
    },
    righteous: {
      name: "Hammer of the Righteous",
      id: "righteous",
      costs: 700,
      basePower: 160,
      target: "enemy",
      onCast: function(opt) {
        logger.message(this.getFullName() + " casts Hammer of the Righteous on " + opt.target.getFullName());
        opt.target.addDebuff(buffData.load("righteous_debuff"), this);
      },
      onAfterAttack: function(opt, dmg) {
        this.changeManaBy((dmg / 3));
      },
      icon: "assets/hammer-drop.png"
    },
    beacon_light: {
      name: "Beacon of Light",
      id: "beacon_light",
      costs: 600,
      target: "friendly",
      isAoe: true,
      onCast: function(opt) {
        logger.message(this.getFullName() + " casts " + this.name + " on " + opt.target.getFullName());
        opt.target.addBuff(buffData.load("beacon_light_buff"), this);
      },
      icon: "assets/gooey-eyed-sun.png"
    },
    purify: {
      name: "purify",
      id: "purify",
      costs: 400,
      target: "friendly",
      isAoe: true,
      onCast: function(opt) {
        logger.message(this.getFullName() + " casts " + this.name + " on " + opt.target.getFullName());
        opt.target.changeManaBy(opt.target.getMaxMana() * .2);
        opt.target.eachDebuff(function(debuff) {
          opt.target.removeDebuff(debuff);
        })
      },
      icon: "assets/embrassed-energy.png"
    },
    genMan: { // test
      basePower: 40,
      accuracy: 100,
      name: "Default Attack",
      id: "genMana",
      onCast: function(opt) {
        this.changeManaBy(200);
      },
      icon: "assets/ace.png"
    },
    __DELETE__: {
        name: "__DELETE__",
        id: "__DELETE__",
        costs: 0,
        onCast: function(opt){
            this.delete();
        },
        target: "self",
        icon: "assets/ace.png"
    },
    __SPAWN__: {
        name: "__SPAWN__",
        id: "__SPAWN__",
        costs: 0,
        onCast: function(opt){
            this.spawnAlly("gnomemage", true).setTmp(true);
            this.spawnAlly("gnomemage", true).setTmp(true);
            this.spawnAlly("gnomemage", true).setTmp(true);
        },
        target: "self",
        icon: "assets/ace.png"
    },
    backstab: {
        name: "Backstep",
        id: "backstab",
        basePower: 120,
        target: "enemy",
        desc: "backstab, if crit then mana +20",
        costs: 60,
        onCast: function(opt){
            if(opt.isCrit) {
                this.changeManaBy(20);
            }
        },
        icon: "assets/backstab.png"
    },
    poison_weapon: {
        name: "Poisonweapon",
        id: "poison_weapon",
        target: "self",
        desc: "Poisonweapon",
        costs: 20,
        onCast: function(opt){
            this.addBuff(buffData.load("poison_weapon_buff"), this);
        },
        icon: "assets/dripping-knife.png"
    },
    rupture: {
        name: "Rupture(dot)",
        id: "rupture",
        basePower: 10,
        target: "enemy",
        desc: "dot",
        costs: 40,
        onCast: function(opt){
            opt.target.addDebuff(buffData.load("rupture_debuff"), this);
        },
        icon: "assets/ragged-wound.png"
    },
    kidney_shot: {
        name: "Kidney Shot",
        id: "kidney_shot",
        target: "enemy",
        desc: "stun",
        costs: 25,
        cooldown: 5,
        onCast: function(opt){
            opt.target.addDebuff(buffData.load("kidney_shot_debuff"), this);
        },
        icon: "assets/ragged-wound.png"
    }

}
