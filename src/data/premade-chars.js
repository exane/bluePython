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
            tec: 1000,
            vit: 2000,
            lck: 100
        },
        img: "assets/gajeel_150.jpg",
        skills: ["aimwater","rend", "hot_test","fumeboost", "heal", "quick_attack", "assassination", "burnslash"],
        ai: function(){
            var moves = [
                {chance: 100/5 + 100/5/2 + 100/5/2, id: "rend"},
                {chance: 100/5, id: "hot_test"},
                {chance: 100/5, id: "heal"},
                {chance: 100/5/2, id: "quick_attack"},
                {chance: 100/5/2, id: "burnslash"}
            ];

            this.turnAction.do = util.random(moves);
        }
    },
    boss: {
        name: "Boss",
        id: "boss",
        stats: {
            str: 100,
            def: 100,
            agi: 100,
            tec: 10,
            vit: 150,
            lck: 100
        },
        img: "assets/Serpant.png"
    },
    boss2: {
        name: "Big Boss",
        id: "boss2",
        stats: {
            str: 100,
            def: 100,
            agi: 100,
            tec: 10,
            vit: 500,
            lck: 100
        },
        img: "assets/Serpant.png",
        skills: ["sacrifice"]
    },
    gnomemage: {
        name: "Gnome Mage",
        id: "gnomemage",
        stats: {
            str: 40,
            def: 40,
            agi: 80,
            tec: 200,
            vit: 750,
            lck: 100
        },
        img: "assets/GnomeMage.png",
        ai: function(){

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
        skills: ["quick_attack","revive", "heal"],
        abilities: ["prayer"]

    },
    chernabog: {
        name: "Chernabog",
        id: "chernabog",
        stats: {
            str: 200,
            def: 50,
            agi: 50,
            tec: 100,
            vit: 1000,
            lck: 100
        },
        img: "assets/Chernabog.png",
        abilities: ["firearmor"],
        skills: ["burnslash"],
        ai: function(){

            var moves = [{chance: 25, id: "burnslash"}, {chance: 75, id: "default_attack"}];
            this.turnAction.do = util.random(moves);

            if(this.getMana() < moveData["burnslash"].costs){
                this.turnAction.do = "default_attack";

            }

        }

    }
}

module.exports = data;