var logger = require("../js/log.js");

var self;
module.exports = self = {
    load: function(id){
        return Object.create(self[id]);
    },
    fumeboost: {
        name: "Fume boost",
        id: "fumeboost",
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
        icon: "assets/lotus-flower.png",
        stats: {},
        duration: 5,
        effects: {
            onTurnEnd: function(){
                this.changeHpBy(100);
            }
        }
    },
    onHit_test: {
        name: "onHit_test",
        id: "onHit_test",
        icon: "assets/aura.png",
        stats: {},
        duration: 5,
        effects: {
            onGetHit: function(){
                this.changeHpBy(50);
            },
            onHit: function(){
                this.changeHpBy(-50);
            }
        }
    },
    test_dot: {
        name: "Rend (dot)",
        id: "test_dot",
        icon: "assets/ragged-wound.png",
        stats: {},
        duration: 5,
        effects: {
            onTurnEnd: function(){
                //var dmg = this.calculateDmg()
                this.changeHpBy(-3000);
            }
        }
    }
}