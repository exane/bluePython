var data = {
    exane: {
        name: "Exane",
        id: "exane",
        stats: {
            "atk": 50,
            "def": 30,
            "agi": 40,
            "tec": 20,
            "vit": 80
        },
        "img": "assets/gajeel_150.jpg",
        "skills": ["quick_attack", "assassination"]
    },
    boss: {
        name: "Boss",
        id: "boss",
        stats: {
            "atk": 100,
            "def": 0,
            "agi": 100,
            "tec": 10,
            "vit": 150
        },
        "img": "assets/Serpant.png"
    },
    boss2: {
        name: "Big Boss",
        id: "boss2",
        stats: {
            "atk": 100,
            "def": 50,
            "agi": 100,
            "tec": 10,
            "vit": 500
        },
        "img": "assets/Serpant.png",
        "skills": ["sacrifice"]
    },
    gnomemage: {
        name: "Gnome Mage",
        id: "gnomemage",
        stats: {
            "atk": 10,
            "def": 10,
            "agi": 10,
            "tec": 50,
            "vit": 30
        },
        "img": "assets/GnomeMage.png",
        "skills": ["revive"]

    },
    chernabog: {
        name: "Chernabog",
        id: "chernabog",
        stats: {
            "atk": 25,
            "def": 15,
            "agi": 25,
            "tec": 25,
            "vit": 25
        },
        "img": "assets/Chernabog.png",
        "abilities": ["firearmor"]

    }
}

module.exports = data;