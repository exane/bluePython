var logger = require("../js/log.js");
var util = require("../js/Util.js");

var self;
module.exports = self = {
    load: function(id){
        return $.extend(true, {}, self[id]);
    },
    shieldwall_buff: {
        name: "Shieldwall",
        id: "shieldwall_buff",
        desc: "Reduces damage by 65% for 1 turn.",
        icon: "assets/beer-stein.png",
        duration: 1,
        effects: {
            onInit: function(buff){
                this.changeIncomingDmgMultiplierBy(-0.65)
            },
            onEnd: function(buff){
                this.changeIncomingDmgMultiplierBy(0.65)
            }
        }
    },

    mortal_strike_debuff: {
        name: "Mortal Strike",
        id: "mortal_strike_debuff",
        desc: "Reduce received healing by 50%.",
        icon: "assets/battered-axe.png",
        duration: 5,
        isLimited: true,
        effects: {
            onInit: function(buff){
                this.decreaseHealMultiplierBy(50);
            },
            onEnd: function(buff){
                this.increaseHealMultiplierBy(50);
            }
        }
    },
    rend_debuff: {
        name: "Rend (dot)",
        id: "rend_debuff",
        desc: "Target bleeds each turn. Each Dmg on this target is also increased by 20%.",
        icon: "assets/ragged-wound.png",
        duration: 5,
        effects: {
            onTurnEnd: function(buff){
                //var dmg = this.calculateDmg()
                this.changeHpBy(-(100 + buff.from.getPhysicalAttackPower()));
            },
            onInit: function(buff){
                this.changeIncomingDmgMultiplierBy(0.2);
            },
            onEnd: function(buff){
                this.changeIncomingDmgMultiplierBy(-0.2);
            }
        }
    },
    battle_shout: {
        name: "Battle Shout",
        id: "battle_shout",
        desc: "Increase strength and vitality by 10%.",
        icon: "assets/sonic-shout.png",
        duration: 5,
        isLimited: true,
        effects: {
            onInit: function(buff){
                this.changeBoost({
                    "str": 10,
                    "vit": 10
                });
            },
            onEnd: function(buff){
                this.changeBoost({
                    "str": -10,
                    "vit": -10
                });
            }
        }
    },
    endless_rage: {
        name: "Endless Rage",
        id: "endless_rage",
        desc: "With each hit, you get mana depends on damage you deal. You also get mana for each hit which you get.",
        icon: "assets/muscle-up.png",
        duration: -1,
        effects: {
            onHit: function(buff, dmg){
                var mana = (dmg*5/1000 | 0) < 10 ? (dmg*5/1000 | 0) : 10;
                this.changeManaBy(mana);
            },
            onGetHit: function(opt, dmg){
                var mana = (dmg*10/1000 | 0) < 20 ? (dmg*10/1000 | 0) : 20;
                this.changeManaBy(mana);
            }
        }
    },
    taunt_debuff: {
        name: "Taunt (debuff)",
        id: "taunt_debuff",
        desc: "Increases chance of enemies attacking you  by 80% for 5 turns.",
        icon: "assets/sonic-shout.png",
        duration: 5,
        isLimited: true,
        effects: {
            onBeforeAttack: function(buff, turnOptions){
                var rnd = Math.random()*100 | 0;
                if(rnd <= 80){
                    turnOptions.target = buff.from;
                }
            }
        }
    },
    renew_buff: {
        name: "Renew",
        id: "renew_buff",
        desc: "",
        icon: "assets/lotus-flower.png",
        duration: 5,
        effects: {
            onTurnEnd: function(buff){
                this.changeHpBy(350 * buff.from.getSpecialAttackPower());
            }
        }
    },
    absorb_shield_buff: {
        name: "Magic Shield Absorb",
        id: "absorb_shield_buff",
        desc: "Absorbs 3000 damage.",
        icon: "assets/aura.png",
        duration: 3,
        effects: {
            onInit: function(buff){
                this.changeShieldAbsorbBy(3000);
            },
            onEnd: function(buff){
                this.changeShieldAbsorbBy(-3000);
            },
            onAfterGetAttack: function(buff){
                if(this.getShieldAbsorb() === 0){
                    this.removeBuff(buff);
                }
            }
        }
    },
    poison_weapon_buff: {
        name: "Poisonweapon",
        id: "poison_weapon_buff",
        desc: "50% chance to poison on attack",
        icon: "assets/dripping-knife.png",
        duration: 5,
        effects: {
            onHit: function(buff, dmg, opt){
                var getPoison = (Math.random()*100 | 0) > 50;
                var target = opt.target;

                if(!getPoison) return;
                target.addDebuff(self.load("poison_weapon_dot_debuff"), this);

            }
        }
    },
    poison_weapon_dot_debuff: {
        name: "Poison",
        id: "poison_weapon_dot_debuff",
        desc: "",
        icon: "assets/poison-gas.png",
        duration: 5,
        effects: {
            onTurnEnd: function(buff){
                var source = buff.from;
                this.changeHpBy(-1.23 * source.getPhysicalAttackPower());
            }
        }
    },
    rupture_debuff: {
        name: "Rupture",
        id: "rupture_debuff",
        desc: "",
        icon: "assets/ragged-wound.png",
        duration: 8,
        effects: {
            onTurnEnd: function(buff){
                var source = buff.from;
                this.changeHpBy(-2.67 * source.getPhysicalAttackPower());
            }
        }
    },
    kidney_shot_debuff: {
        name: "Stun",
        id: "kidney_shot_debuff",
        desc: "stun",
        icon: "assets/ragged-wound.png",
        duration: 1,
        effects: {
            onInit: function(buff){
                this.setFrozen(true);
            },
            onEnd: function(buff){
                this.setFrozen(false);
            }
        }
    }
}