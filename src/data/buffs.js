var logger = require("../js/log.js");

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
    },
    defenseboost: {
        name: "Defense boost",
        id: "defenseboost",
        stats: {
            def: 2
        },
        duration: 5,
        icon: "assets/aura.png"
    },
    attackboost: {
        name: "Attack boost",
        id: "attackboost",
        stats: {
            str: 2
        },
        duration: 5,
        icon: "assets/muscle-up.png"
    },
    firearmor: {
        name: "Fire Armor",
        id: "firearmor",
        desc: "Target inflames his body. All stats are increased by 50% for each ally.",
        stats: {
            def: 0,
            str: 0,
            agi: 0,
            vit: 0,
            tec: 0,
            lck: 0
        },
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

                firearmor.stats = {
                    def: length,
                    str: length,
                    agi: length,
                    vit: length,
                    tec: length,
                    lck: length
                }


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
        stats: {},
        duration: 5,
        effects: {
            onTurnEnd: function(opt){ //opt = buff properties
                //debugger;
                this.changeHpBy(opt.from.getAttr("tec"));
            }
        }
    },
    onHit_test: {
        name: "onHit_test",
        id: "onHit_test",
        desc: "If target got hit, then he immediately regenerates some hp.",
        icon: "assets/aura.png",
        stats: {},
        duration: 5,
        effects: {
            onGetHit: function(opt){
                this.changeHpBy(opt.from.getAttr("tec")/3);
            },
            onHit: function(opt){
                //this.changeHpBy(this.getAttr("tec"));
            }
        }
    },
    test_dot: {
        name: "Rend (dot)",
        id: "test_dot",
        desc: "Target bleeds for x dmg each turn. Each Dmg on this target is also increased by 20%.",
        icon: "assets/ragged-wound.png",
        stats: {},
        duration: 5,
        effects: {
            onTurnEnd: function(opt){
                //var dmg = this.calculateDmg()
                this.changeHpBy(-500);
            },
            onInit: function(opt){
                this.changeIncomingDmgMultiplierBy(0.2);
            },
            onEnd: function(opt){
                this.changeIncomingDmgMultiplierBy(-0.2);
            }
        }
    },
    aimwater_buff: {
        name: "Aimwater",
        id: "aimwater_buff",
        desc: "Increases crit chance by 50% and crit dmg by 200%",
        icon: "assets/beer-stein.png",
        stats: {},
        duration: 5,
        effects: {
            onInit: function(opt){
                this.increaseCritChancesBy(50);
                this.increaseCritDmgBy(200);
            },
            onEnd: function(opt){
                this.decreaseCritChancesBy(50);
                this.decreaseCritDmgBy(200);
            }
        }
    }
}