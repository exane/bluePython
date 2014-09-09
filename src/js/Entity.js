"use strict";

var logger = require("./log.js");
var abilityData = require("../data/abilities.js");

var Entity = (function(){
    var Display = require("./Display.js");

    var Entity = function(options, yourSide, otherSide){
        this._name = (options && options.name) || "unnamed";
        this._id = (options && options.id) || null;
        this._img = (options && options.img) || null;
        this._stats = options.stats || this._stats;

        this._boosts = {
            str: 0,
            def: 0,
            agi: 0,
            tec: 0,
            vit: 0,
            lck: 0
        }

        this._skillList = options.skills || [];
        this._abilities = options.abilities || [];

        //this.events = events;


        this._yourSide = yourSide;
        this._otherSide = otherSide;
        this._maxHp = this._currHp = this.getMaxHp();
        this._maxMana = this._mana = this.getMaxMana();

        this._buffs = [];

        this.turnAction = {};

        this._abilityListener();


        this._nextTurnListener();
    }
    var r = Entity.prototype;

    /**
     * Private Properties
     */
    r._name = "unnamed";
    r._id = null;
    r._maxHp = 1;
    r._currHp = 1;
    r._img = null;
    r._hasChosen = false;
    r._fainted = false;
    r._yourSide = null;
    r._otherSide = null;
    r._stats = {};
    r._skillList = [];
    r._abilities = [];
    r._buffs = [];
    r._boosts = {};
    r._buffTable = [1, 1.5, 2, 2.5, 3, 3.5, 4];
    r._mana = 1;
    r._maxMana = 1;

    /**
     * UI Properties
     */
    r.uiSprite = null;
    r.uiName = null;
    r.uiHp = null;
    r.uiMana = null;
    r.uiBuffs = null;

    r.turnAction = null;


    /**
     * Getter
     */
    r.getAttr = function(attr){
        attr = attr.toLowerCase();
        return this._stats[attr] * this._buffTable[this._boosts[attr]];
    }
    r.getBaseAttr = function(attr){
        attr = attr.toLowerCase();
        return this._stats[attr];
    }
    r.getHp = function(){
        return this._currHp;
    }
    r.getMaxHp = function(){
        return this.getAttr("Vit") * 10;
    }
    r.getMana = function(){
        return this._mana;
    }
    r.getMaxMana = function(){
        return this.getAttr("tec") * 10;
    }
    r.getSpecialAttackPower = function(){
        var tec = this.getAttr("tec") * 2;

        return tec;
    }
    r.getPhysicalAttackPower = function(){
        var str = this.getAttr("str") * 2;

        return str;
    }
    r.getAttackPower = function(type){
        if(type == "physical") {
            return this.getPhysicalAttackPower();
        }
        if(type == "special"){
            return this.getSpecialAttackPower();
        }
    }
    r.getCritRate = function(){
        var baseCrit = 500;
        baseCrit += this.getAttr("Lck") * 1.5;
        return baseCrit / 100;
    }
    r.getFullName = function(){
        return this._yourSide.sideName + " " + this._name;
    }
    r.getYourside = function(){
        return this._yourSide;
    }
    r.getOtherside = function(){
        return this._otherSide;
    }
    r.getSkillList = function(index){
        if(typeof index == "undefined") return this._skillList;
        return this._skillList[index];
    }
    r.getAbilities = function(index){
        if(typeof index == "undefined") return this._abilities;
        return this._abilities[index];
    }
    r.getImg = function(){
        return this._img;
    }
    r.getBuff = function(name){
        var n = this._buffs.length;

        for(var i = 0; i < n; i++) {
            if(this._buffs[i].name === name)
                return this._buffs[i];
        }
        return null;
    }
    r.getBoostLevel = function(attr){
        return this._boosts[attr];
    }
    r.getId = function(){
        return this._id;
    }
    r.getName = function(){
        return this._name;
    }
    r.getStats = function(){
        return this._stats;
    }

    /**
     * Setter
     */
    r.setChosen = function(bool){
        this._hasChosen = bool;
    }
    r.setFainted = function(bool){
        this._fainted = bool;
    }
    r.setImg = function(img){
        this._img = img;
    }
    r.setId = function(id){
        this._id = id;
    }
    r.setName = function(name){
        this._name = name;
    }
    r.setBuffTo = function(opt){
        var stats = opt.stats;
        var duration = opt.duration;
        var name = opt.name;

        if(!name){
            throw new Error("Missing name property! @skill")
        }
        if(!stats){
            throw new Error("Missing stats property! @skill")
        }
        if(!duration){
            throw new Error("Missing duration property! @skill")
        }

        if(!this._hasBuff(name)){
            return this.addBuff(opt);
        }

        var tmp = {};
        var buff = this.getBuff(name);
        for(var stat in stats) {
            var diff = stats[stat] - this._boosts[stat];
            buff.stats[stat] += diff;
            tmp[stat] = diff;
        }
        this._boost(tmp);

        this.updateUi();
    }
    r.setHpTo = function(value){
        if(this.isFainted()) return 0;

        this._currHp = value | 0;

        if(this.getHp() > this.getMaxHp()){
            this._currHp = this.getMaxHp();
        }

        //this.uiHp.text(this.getHp() + " / " + this.getMaxHp());
        this.updateUi();
    }
    r.setManaTo = function(value){
        if(this.isFainted()) return 0;

        this._mana = value | 0;

        if(this.getMana() > this.getMaxMana()){
            this._mana = this.getMaxMana();
        }
        this.updateUi();
    }

    /**
     * Public Methods
     */
    r.hasChosen = function(){
        return this._hasChosen;
    }
    r.isFainted = function(){
        return this._fainted;
    }
    r.addBuff = function(opt){
        var stats = opt.stats;
        var duration = opt.duration;
        var name = opt.name;

        if(!name){
            throw new Error("Missing name property! @skill")
        }
        if(!stats){
            throw new Error("Missing stats property! @skill")
        }
        if(!duration){
            throw new Error("Missing duration property! @skill")
        }

        //console.log(this);

        //debugger;
        /**
         * visuell
         */
        new Display({buffName: name, buffStats: stats, buffDuration: duration, target: this});

        this._buffs.push(opt);

        //merge buff & extend duration
        this._mergeBuffs();

        this._boost(stats);
        this._renderBuffs();
    }
    r.buffRemove = function(buff, index){
        //console.log(buff, index);
        this._buffs.splice(index, 1);
        logger.message(buff.name + " wears off.");
        for(var stat in buff.stats) {
            this._boosts[stat] -= buff.stats[stat];
        }
        this._renderBuffs();
    }
    r.updateUi = function(){
        this.uiHp.text(this.getHp() + " / " + this.getMaxHp());
        this.uiMana.text(this.getMana() + " / " + this.getMaxMana());
        this._renderBuffs();
    }
    r.revive = function(hp){
        hp = hp | 0;
        this.setFainted(false);
        this.uiSprite.removeClass("fainted");
        this.changeHpBy(hp);
        $.event.trigger("bp-ability-onRevive");
    }
    r.calculateDmgTo = function(move, target, opt){
        var dmg = this.calculatePower(move);
        var def = target.calculateDef(move);

        if(opt.isCrit){
            dmg *= 2;
        }

        var diff = dmg - def;

        diff = diff >= 0 ? diff : 0;

        return diff;
    }
    r.calculateCritChance = function(target, move){
        //var baseCrit = 500;
//
        //baseCrit += this.getAttr("Lck");
//
        //return baseCrit / 100;
        return this.getCritRate();
    } //deprecated!
    r.calculateCrit = function(chance){
        var crit = Math.random() * 100;

        //console.log(crit <= chance, crit, chance);

        return crit <= chance;

    }
    r.calculatePower = function(move){
        var dmg = (move.basePower + this.getAttr("str"));

        /*if(move.isCrit){
         dmg *= 2;
         }*/

        return dmg;
    }
    r.calculateDef = function(){
        var def = this.getAttr("Def");

        //console.log(this._name, def);

        return def;
    }
    r.changeHpBy = function(value, crit){
        if(this.isFainted()) return 0;
        crit = crit || false;

        //console.log("entity", this);
        new Display({target: this, amount: value, isCrit: crit});

        this._currHp = this.getHp() + value;
        if(this.getHp() > this.getMaxHp()){
            this._currHp = this.getMaxHp();
        }

        if(this.getHp() <= 0){
            this._currHp = 0;
            this.setFainted(true);

            this.uiSprite.addClass("fainted");
        }

        this.uiHp.text(this.getHp() + " / " + this.getMaxHp());
    }
    r.changeManaBy = function(value){
        if(this.getMana() + value < 0){
            return false;
        }

        this._mana = this.getMana() + value;

        if(this.getMana() > this.getMaxMana()){
            this._mana = this.getMaxMana();
        }

        new Display({target: this, amount: value, isMana: true});


        this.uiMana.text(this.getMana() + " / " + this.getMaxMana());

        return true;
    }
    r.ready = function(data){
        data = data || {};

        if(this.isFainted()){
            data.fainted = true;
            data.from = this;
        }
        $.event.trigger("bp-battle-chosen", {data: data});
    }
    r.decreaseDurationTime = function(){
        var n = this._buffs.length;
        var i;


        for(i = 0; i < n; i++) {
            var buff = this._buffs[i];

            //buff.duration = -1 => no duration
            if(buff.duration != -1 && buff.duration - 1 === 0){
                this.buffRemove(buff, i);
                return this.decreaseDurationTime();
            }
        }

        for(i = 0; i < n; i++) {
            if(buff.duration === -1) continue;
            this._buffs[i].duration--;
        }

        //console.log(this.getFullName(), this._boosts);
        this._renderBuffs();
    }

    /**
     * Private Methods
     */
    r._hasBuff = function(buffName){
        var n = this._buffs.length;
        for(var i = 0; i < n; i++) {
            if(this._buffs[i].name === buffName)
                return true;
        }

        return false;
    }
    r._boost = function(stats){

        for(var stat in stats) {
            this._boosts[stat] += stats[stat];

            //console.log(this);

            if(this._boosts[stat] > this._buffTable.length){
                this._boosts[stat] = this._buffTable.length - 1;
                logger.message(stat + " can't be boosted more!");
            }
        }
        this.updateUi();
    }
    r._mergeBuffs = function(){
        var n = this._buffs.length;

        for(var i = 0; i < n; i++) {
            var buff = this._buffs[i];

            for(var j = i + 1; j < n; j++) {
                if(buff.name === this._buffs[j].name){
                    var buff2 = this._buffs[j];

                    var tmp = {};

                    tmp.name = buff.name;
                    tmp.duration = buff.duration > buff2.duration ? buff.duration : buff2.duration;
                    tmp.stats = {};

                    //stats
                    for(var stat in buff.stats) {
                        if((buff.stats[stat] + buff2.stats[stat]) < this._buffTable.length){
                            tmp.stats[stat] = buff.stats[stat] + buff2.stats[stat];
                        }
                        else {
                            tmp.stats[stat] = this._buffTable.length - 1;
                        }
                    }

                    this._buffs.splice(j, 1);
                    this._buffs.splice(i, 1);

                    this._buffs.push(tmp);


                    return this._mergeBuffs();
                }
            }
        }
    }
    r._abilityListener = function(){
        var self = this;
        for(var i = 0; i < this.getAbilities().length; i++) {
            if(abilityData[this.getAbilities(i)].onFaint){
                $(document).on("bp-ability-onFaint", abilityData[this.getAbilities(i)].onFaint.bind(self));
            }
            if(abilityData[this.getAbilities(i)].onRevive){
                $(document).on("bp-ability-onRevive", abilityData[this.getAbilities(i)].onRevive.bind(self));
            }
        }
    }
    r._renderBuffs = function(){
        //console.log($(this.uiBuffs));
        var buff = $("<div></div>");
        $(this.uiBuffs).empty();
        $(buff).addClass("test-buff");

        var n = this._buffs.length;
        for(var i = 0; i < n; i++) {
            var b = this._buffs[i];
            var stats2string = "";

            for(var stat in b.stats) {
                stats2string += stat + ": " + b.stats[stat] + "; ";
            }

            $(buff).html(b.name + "<br>" + stats2string + "<br>" + b.duration);

        }

        $(this.uiBuffs).append(buff);

    }
    r._nextTurnListener = function(){
        var self = this;
        $(document).on("bp-battle-nextTurn", function(){
            if(self.fainted) self.ready();

            //self._hasChosen = false;
            self.setChosen(false);
            self.turnAction = {};
        })
    }

    return Entity;
})();

module.exports = Entity;