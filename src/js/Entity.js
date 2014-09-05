"use strict";

var logger = require("./log.js");

var Entity = (function(){
    var Entity = function(options, events, yourSide, otherSide){
        this.name = (options && options.name) || "unnamed";
        this.id = (options && options.id) || null;
        this.img = (options && options.img) || null;
        this.stats = options.stats || this.stats;

        this.boosts = { //percent
            "atk": 1,
            "def": 1,
            "agi": 1,
            "tec": 1,
            "vit": 1
        }

        this.skillList = options.skills || [];
        this.abilities = options.abilities || [];

        //this.events = events;


        this.yourSide = yourSide;
        this.otherSide = otherSide;
        this.maxHp = this.currHp = (this.getVit() * 10);

        this.buffs = [];

        this.turnAction = {};




        this.nextTurnListener();
    }
    var r = Entity.prototype;

    r.name = "unnamed";
    r.maxHp = 100;
    r.currHp = 0;
    r.img = null;

    r.uiSprite = null;
    r.uiName = null;
    r.uiHp = null;
    //r.uiInfo = null;

    //r.currTurn = 0;
    r.hasChosen = false;
    r.turnAction = {};

    r.fainted = false;

    r.yourSide = null;
    r.otherSide = null;

    r.turnAction = null;


    //r.events = null;

    r.stats = {
        "atk": 50,
        "def": 50,
        "agi": 50,
        "tec": 50,
        "vit": 50
    };

    r.boosts = null;

    r.skillList = [];
    r.abilities = [];
    r.buffs = [];


    r.boost = function(stats){
        //this.boosts[attr] += val;
        for(var stat in stats) {
            this.boosts[stat] += stats[stat];
        }
        this.updateUi();
    }

    r.buff = function(opt){
        var stats = opt.stats;
        var duration = opt.duration;

        //console.log(this);

        //debugger;

        this.buffs.push(opt);
        this.boost(stats);
    }

    r.decreaseDurationTime = function(){
        var n = this.buffs.length;


        for(var i = 0; i < n; i++) {
            var buff = this.buffs[i];
            if(buff.duration - 1 === 0){
                this.buffRemove(buff, i);
                return this.decreaseDurationTime();
            }
        }

        for(var i = 0; i < n; i++) {
            this.buffs[i].duration--;
        }
    }

    r.buffRemove = function(buff, index){
        this.buffs.splice(index, 1);
        for(var stat in buff.stats) {
            this.boosts[stat] -= buff.stats[stat];
        }
    }

    r.getHp = function(){
        //return (this.currHp * this.stats.vit) * 10;
        return this.currHp;
    }

    r.updateUi = function(){
        this.uiHp.text(this.getHp() + " / " + this.getMaxHp());
    }

    r.getMaxHp = function(){
        return this.getVit() * 10;
    }

    r.getStats = function(){
        return this.stats;
    }

    r.changeHpBy = function(value){
        if(this.fainted) return 0;

        this.currHp = this.getHp() + value;
        if(this.currHp > this.getMaxHp()){
            this.currHp = this.maxHp;
        }

        if(this.currHp <= 0){
            this.currHp = 0;
            this.fainted = true;

            this.uiSprite.addClass("fainted");
        }

        this.uiHp.text(this.getHp() + " / " + this.getMaxHp());
    }

    r.ready = function(data){
        data = data || {};

        if(this.fainted){
            data.fainted = true;
            data.from = this;
        }
        $.event.trigger("bp-battle-chosen", {data: data});
    }

    r.calculateDmgTo = function(move, target){
        var dmg = this.calculatePower(move);
        var def = target.calculateDef(move);

        var diff = dmg - def;

        diff = diff >= 0 ? diff : 0;

        return diff;
    }

    r.getAtk = function(){
        return this.stats.atk * this.boosts.atk;
    }
    r.getDef = function(){
        return this.stats.def * this.boosts.def;
    }
    r.getAgi = function(){
        return this.stats.agi * this.boosts.agi;
    }
    r.getVit = function(){
        return this.stats.vit * this.boosts.vit;
    }
    r.getTec = function(){
        return this.stats.tec * this.boosts.tec;
    }
    r.calculatePower = function(move){
        return (move.basePower + this.getAtk());
    }

    r.calculateDef = function(){
        var def = this.getDef();

        //console.log(this.name, def);

        return def;
    }

    r.nextTurnListener = function(){
        var self = this;
        $(document).on("bp-battle-nextTurn", function(){
            if(self.fainted) self.ready();

            self.hasChosen = false;
            self.turnAction = {};
        })
    }

    r.revive = function(hp){
        this.fainted = false;
        this.uiSprite.removeClass("fainted");
        this.changeHpBy(hp);
    }


    return Entity;
})();

module.exports = Entity;