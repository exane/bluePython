var logger = require("../js/log.js");
var util = require("../js/Util.js");
var moveData = require("./moves.js");


var data = {
    exane: {
        name: "Exane",
        id: "exane",
        stats: {
            str: 100,
            def: 100,
            agi: 100,
            int: 100,
            tec: 1000,
            vit: 2000,
            lck: 100
        },
        img: "assets/gajeel_150.jpg",
        skills: ["aimwater", "rend", "hot_test", "fumeboost", "heal", "quick_attack", "assassination", "burnslash"],
        ai: function(){
            var moves = [
                {chance: 100 / 5 + 100 / 5 / 2 + 100 / 5 / 2, id: "rend"},
                {chance: 100 / 5, id: "hot_test"},
                {chance: 100 / 5, id: "heal"},
                {chance: 100 / 5 / 2, id: "quick_attack"},
                {chance: 100 / 5 / 2, id: "burnslash"}
            ];

            //this.turnAction.do = util.random(moves);
        }
    },
    gnomemage: {
        name: "Gnome Mage",
        id: "gnomemage",
        stats: {
            str: 40,
            def: 40,
            agi: 80,
            tec: 100,
            int: 800,
            vit: 10,
            lck: 100
        },
        img: "assets/GnomeMage.png",
        ai: function(){
            //var member = this.getYourside().getRandomMember(false);
            //this.turnAction.do = "aimwater";
            //this.turnAction.target = member;

            //return 0;

            if(this.getYourside().hasDeadMember() && this.getMana() >= moveData["revive"].costs){
                var member = this.getYourside().getRandomMember(false);
                this.turnAction.do = "revive";
                this.turnAction.target = member;
                return 0;
            }


            var m = this.getYourside().getRandomMember(true);
            if(m.getHp() < m.getMaxHp() && this.getMana() >= moveData["heal"].costs){
                this.turnAction.do = "heal";
                this.turnAction.target = m;
                return 0;
            }


            this.turnAction.do = "default_attack";

        },
        skills: ["aimwater", "quick_attack", "revive", "heal"],
        abilities: ["prayer"]

    },
    warrior: {
        name: "Warrior (tank)",
        id: "warrior",
        stats: {
            str: 100,
            def: 1100,
            agi: 110,
            tec: 10,
            int: 10,
            vit: 1000,
            lck: 1000
        },
        img: "assets/warrior_11.png",
        skills: ["shieldwall", "taunt", "mortal_strike", "rend", "bloodthirst", "bladestorm", "battle_shout"],
        abilities: ["endless_rage"],
        //multipleAttacks: 3,
        onBattleStart: function(){
            this.changeManaBy(-this.getMaxMana());
        }
    },
    priest: {
        name: "Priest",
        id: "priest",
        stats: {
            str: 40,
            def: 75,
            agi: 120,
            tec: 250,
            int: 300,
            vit: 800,
            lck: 150
        },
        img: "assets/priest_12.png",
        skills: ["absorb_shield", "renew", "heal", "aoe_heal", "revive"],
        abilities: ["prayer"]
    },
    rogue: {
        name: "Rogue",
        id: "rogue",
        stats: {
            str: 200,
            def: 90,
            agi: 160,
            tec: 100,
            int: 12,
            vit: 500000,//500
            lck: 2500
        },
        img: "assets/rogue.png",
        multipleAttacks: 2,
        skills: ["backstab", "poison_weapon", "rupture", "kidney_shot"],
        abilities: ["calm_mind"]
    },
    serpant_boss: {
        name: "Serpant King",
        id: "serpant_boss",
        stats: {
            str: 200,
            def: 100,
            agi: 200,
            tec: 200,
            int: 10000,
            vit: 10000,
            lck: 2000
        },
        multipleAttacks: 3,
        img: "assets/Serpant.png",
        skills: ["rend", "mortal_strike"],
        ai: function(){
            var moves = [
                {chance: 20, id: "rend"},
                {chance: 10, id: "spawn_mage"},
                {chance: 70, id: "mortal_strike"}
            ];

            this.turnAction.do = util.random(moves);
        },
        abilities: []
    }
}

module.exports = data;