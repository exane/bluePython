var logger = require("../js/log.js");


var data = {
    exane: {
        name: "Exane",
        id: "exane",
        stats: {
            atk: 100,
            def: 80,
            agi: 100,
            tec: 100,
            vit: 100,
            lck: 100
        },
        img: "assets/gajeel_150.jpg",
        skills: ["quick_attack", "assassination", "burnslash"]
    },
    boss: {
        name: "Boss",
        id: "boss",
        stats: {
            atk: 100,
            def: 0,
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
            atk: 100,
            def: 50,
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
            atk: 40,
            def: 60,
            agi: 80,
            tec: 100,
            vit: 80,
            lck: 100
        },
        img: "assets/GnomeMage.png",
        ai: function(){

            if(this.yourSide.hasDeadMember()){
                var member = this.yourSide.getRandomMember(false);
                this.turnAction.do = "revive";
                this.turnAction.target = member;
                return 0;
            }
                //this.doAttack();
                //this.turnAction.do = "default_defense";


            var m = this.yourSide.getRandomMember(true);
            if(m.getHp() < m.getMaxHp()){
                this.turnAction.do = "heal";
                this.turnAction.target = m;
                return 0;
            }


            this.turnAction.do = "default_attack";




        },
        skills: ["revive", "heal"]

    },
    chernabog: {
        name: "Chernabog",
        id: "chernabog",
        stats: {
            atk: 100,
            def: 70,
            agi: 50,
            tec: 100,
            vit: 120,
            lck: 100
        },
        img: "assets/Chernabog.png",
        abilities: ["firearmor"],
        skills: ["burnslash"],
        ai: function(){
            this.turnAction.do = "burnslash";
        }

    }
}

module.exports = data;