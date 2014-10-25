var logger = require("../js/log.js");
var util = require("../js/Util.js");

var self;
module.exports = self = {
    load: function(id){
        //return Object.create(self[id]);
        return $.extend(true, {}, self[id]);
    },
    fumeboost: {
        name: "Fume boost",
        id: "fumeboost",
        desc: "Increasing each stat by 300%.",

        duration: 20,
        icon: "assets/devfake.jpg"
    },
    firearmor: {
        name: "Fire Armor",
        id: "firearmor",
        desc: "Target inflames his body. All stats are increased by 50% for each ally.",
        /*stats: {
            def: 0,
            str: 0,
            agi: 0,
            vit: 0,
            tec: 0,
            lck: 0
        },*/
        duration: -1,
        icon: "assets/burning-passion.png",
        effects: {
            onInit: function(){
                self.firearmor.effects.onTurnEnd.call(this);
            },
            onTurnEnd: function(){
                var length = this.getYourside().length(true);

                var currMaxHp = this.getMaxHp();
                var currHp = this.getHp();
                var currMaxMana = this.getMaxMana();
                var currMana = this.getMana();

                var percentageOfHp = 100 * currHp / currMaxHp;
                var percentageOfMana = 100 * currMana / currMaxMana;


                var firearmor = self.load("firearmor");

               /* firearmor.stats = {
                    def: length,
                    str: length,
                    agi: length,
                    vit: length,
                    tec: length,
                    lck: length
                }*/


                this.setBuffTo(firearmor);


                var newCurrMaxHp = this.getMaxHp();
                var newCurrMaxMana = this.getMaxMana();

                this.setHpTo(newCurrMaxHp * percentageOfHp / 100);
                this.setManaTo(newCurrMaxMana * percentageOfMana / 100);


            },
            onFaint: function(){
                self.firearmor.effects.onTurnEnd.call(this);
            },
            onRevive: function(){
                self.firearmor.effects.onTurnEnd.call(this);
            }
        }
    },
    hot_test: {
        name: "HoT (Heal over Time)",
        id: "hot_test",
        desc: "Healing of the target at end of each turn.",
        icon: "assets/lotus-flower.png",
        duration: 5,
        effects: {
            onTurnEnd: function(buff){ //opt = buff properties
                //debugger;
                this.changeHpBy(buff.from.getAttr("tec"));
            }
        }
    },
    onHit_test: {
        name: "onHit_test",
        id: "onHit_test",
        desc: "If target got hit, then he immediately regenerates some hp.",
        icon: "assets/aura.png",
        duration: 5,
        effects: {
            onGetHit: function(buff){
                this.changeHpBy(buff.from.getAttr("tec")/3);
            },
            onHit: function(buff){
                //this.changeHpBy(this.getAttr("tec"));
            }
        }
    },
    aimwater_buff: {
        name: "Aimwater",
        id: "aimwater_buff",
        desc: "Increase crit chances by 50% and crit dmg by 200%",
        icon: "assets/beer-stein.png",
        duration: 5,
        effects: {
            onInit: function(buff){
                this.increaseCritChancesBy(50);
                this.increaseCritDmgBy(200);
            },
            onEnd: function(buff){
                this.decreaseCritChancesBy(50);
                this.decreaseCritDmgBy(200);
            }
        }
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
    }
}