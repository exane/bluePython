"use strict";

var logger = require("./log.js");
var abilityData = require("../data/abilities.js");
var buffData = require("../data/buffs.js");

var Entity = (function(){
    var Display = require("./Display.js");

    var Entity = function(options, yourSide, otherSide){
        this._name = (options && options.name) || "unnamed";
        this._id = (options && options.id) || null;
        this._img = (options && options.img) || null;
        this._stats = options.stats || this._stats;

        this._boosts = {
            str: 100,
            def: 100,
            agi: 100,
            tec: 100,
            vit: 100,
            lck: 100
        }

        this._skillList = options.skills || [];
        this._abilities = options.abilities || [];

        //this.events = events;


        this._yourSide = yourSide;
        this._otherSide = otherSide;
        this._maxHp = this._currHp = this.getMaxHp();
        this._maxMana = this._mana = this.getMaxMana();

        this._buffs = [];
        this._debuffs = [];

        this.turnAction = {};

        this._abilityListener();
        this._buffListener();


        this._nextTurnListener();

        if(options.onBattleStart){
            //options.onBattleStart.call(this);
            pubsub.subscribe("/bp/battle/onBattleStart/", options.onBattleStart.bind(this));
        }

        //console.log(this);
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
    r._debuffs = [];
    r._boosts = {};
    //r._buffTable = [1, 1.5, 2, 2.5, 3, 3.5, 4];
    r._mana = 1;
    r._maxMana = 1;
    r._incomingDmgMultiplier = 1;
    r._outgoingDmgMultiplier = 1;
    r._critDmgMultiplicator = 2;
    r._additionalCritChances = 0;
    r._healMultiplier = 1;

    /**
     * UI Properties
     */
    r.uiSprite = null;
    r.uiName = null;
    r.uiHp = null;
    r.uiMana = null;
    r.uiBuffs = null;
    r.uiDebuffs = null;

    r.turnAction = null;


    /**
     * Getter
     */
    r.getAttr = function(attr){
        attr = attr.toLowerCase();
        return this._stats[attr] * this._boosts[attr] / 100;
    }
    r.getBaseAttr = function(attr){
        attr = attr.toLowerCase();
        return this._stats[attr];
    }
    r.getHp = function(inPercentage){
        if(inPercentage) return 100 * this._currHp / this.getMaxHp() | 0;
        return this._currHp;
    }
    r.getMaxHp = function(){
        return this.getAttr("Vit") * 10;
    }
    r.getMana = function(inPercentage){
        if(inPercentage) return 100 * this._mana / this.getMaxMana() | 0;
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
        if(type == "physical"){
            return this.getPhysicalAttackPower();
        }
        if(type == "special"){
            return this.getSpecialAttackPower();
        }
    }
    r.getCritRate = function(){
        var baseCrit = 500; // 5%
        baseCrit += this.getAttr("Lck") * 1.5;
        baseCrit += this.getAdditionalCritChances() * 100;
        return baseCrit / 100;
    }
    r.getAdditionalCritChances = function(){
        return this._additionalCritChances;
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
    r.getDebuff = function(name){
        var n = this._debuffs.length;

        for(var i = 0; i < n; i++) {
            if(this._debuffs[i].name === name)
                return this._debuffs[i];
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
    r.getIncomingDmgMultiplier = function(){
        return this._incomingDmgMultiplier;
    }
    r.getOutgoingDmgMultiplier = function(){
        return this._outgoingDmgMultiplier;
    }
    r.getCritDmgMultiplicator = function(){
        return this._critDmgMultiplicator;
    }
    r.getHealMultiplier = function(){
        return this._healMultiplier;
    }

    /**
     * Setter
     */
    r.setChosen = function(bool){
        this._hasChosen = bool;
    }
    r.setFainted = function(bool){
        this.setManaTo(0);
        this._fainted = bool;
        this.removeAllBuffs();
        this.removeAllDebuffs();
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

        if(!this.hasBuff(name)){
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
    r.setIncomingDmgMultiplier = function(val){
        this._incomingDmgMultiplier = val;
    }
    r.setOutgoingDmgMultiplier = function(val){
        this._outgoingDmgMultiplier = val;
    }
    r.setCritDmgMultiplicator = function(number){
        this._critDmgMultiplicator = number;
    }
    r.setHealMultiplier = function(number){
        this._healMultiplier = number;
    }

    /**
     * Public Methods
     */
    r.removeAllBuffs = function(){
        //for(var i = 0; i < this._buffs.length; i++) {
        if(!this._buffs.length) return;
        this.removeBuff(this._buffs[0], 0);
        return this.removeAllBuffs();
        //}
    }
    r.removeAllDebuffs = function(){
        //for(var i = 0; i < this._debuffs.length; i++) {
        if(!this._debuffs.length) return;
        this.removeDebuff(this._debuffs[0], 0);
        return this.removeAllDebuffs();
        //}
    }
    r.hasChosen = function(){
        return this._hasChosen;
    }
    r.isFainted = function(){
        return this._fainted;
    }
    r.addBuffOnce = function(buff){
        if(this.hasBuff(buff.name)) return 0;
        this.addBuff(buff);
    }
    r.addBuff = function(buff, from){
        //var stats = buff.stats;
        var duration = buff.duration;
        var name = buff.name;

        if(this.isFainted()) return 0;

        from = from || this;

        if(!name){
            throw new Error("Missing name property! @skill")
        }
        /*
         if(!stats){
         throw new Error("Missing stats property! @skill")
         }*/
        if(!duration){
            throw new Error("Missing duration property! @skill")
        }

        buff.from = from;


        if(!this.hasBuff(name)){
            new Display({buffName: name, /*buffStats: stats, */buffDuration: duration, target: this});
        }

        this._buffEvents(buff);
        var t = this._buffs.push(buff);

        //merge buff & extend duration
        this._mergeBuffs(this._buffs);


        //this._boost(stats);
        this._renderBuffs();
        //pubsub.publish("/bp/battle/onInit/" + this.getId() + "/" + buff.id);
        pubsub.publish("/bp/battle/onInit/" + this.getId() + "/" + buff.id);
    }
    r.addDebuff = function(debuff){
        //var stats = debuff.stats;
        var duration = debuff.duration;
        var name = debuff.name;
        if(this.isFainted()) return 0;

        if(!name){
            throw new Error("Missing name property! @skill")
        }
        /*
         if(!stats){
         throw new Error("Missing stats property! @skill")
         }
         */
        if(!duration){
            throw new Error("Missing duration property! @skill")
        }

        this._buffEvents(debuff);

        if(!this.hasDebuff(name))
            new Display({buffName: name/*, buffStats: stats*/, buffDuration: duration, target: this});

        var t = this._debuffs.push(debuff);

        //merge buff & extend duration
        this._mergeBuffs(this._debuffs);

        //this._boost(stats);
        this._renderBuffs();

        pubsub.publish("/bp/battle/onInit/" + this.getId() + "/" + debuff.id);

    }
    r.removeBuff = function(buff, index){
        pubsub.publish("/bp/battle/onEnd/" + this.getId() + "/" + buff.id);

        if(buff.__handler){
            for(var i = 0; i < buff.__handler.length; i++) {
                pubsub.unsubscribe(buff.__handler[i]);
            }
        }

        this._buffs.splice(index, 1);
        logger.message(buff.name + " wears off.");
        /*for(var stat in buff.stats) {
         this._boosts[stat] -= buff.stats[stat];
         }*/
        //for(var i=0; i<buff.addAbilities.length; i++){
        //    this.removeAbility(buff.addAbilities[i]);
        //}
        //this._renderBuffs();
        this.updateUi();
    }
    r.removeDebuff = function(debuff, index){
        //console.log(debuff, index);
        pubsub.publish("/bp/battle/onEnd/" + this.getId() + "/" + debuff.id);

        if(debuff.__handler){
            for(var i = 0; i < debuff.__handler.length; i++) {
                pubsub.unsubscribe(debuff.__handler[i]);
            }
        }

        this._debuffs.splice(index, 1);
        logger.message(debuff.name + " wears off.");
        for(var stat in debuff.stats) {
            this._boosts[stat] -= debuff.stats[stat];
        }
        //for(var i=0; i<debuff.addAbilities.length; i++){
        //    this.removeAbility(debuff.addAbilities[i]);
        //}
        this._renderBuffs();
    }
    r.updateUi = function(){

        if(this.getHp() > this.getMaxHp()){
            this._currHp = this.getMaxHp();
        }
        this.uiHp.text(this.getHp() + " / " + this.getMaxHp());
        this.uiMana.text(this.getMana() + " / " + this.getMaxMana());
        this.uiHp.css({
            "background": "linear-gradient(to right, #00b900 " + this.getHp(true) + "%, rgba(0,0,0,0) 0%)"
        });
        this.uiMana.css({
            "background": "linear-gradient(to right, #297eff " + this.getMana(true) + "%, rgba(0,0,0,0) 0%)"
        });
        this._renderBuffs();
        //$.event.trigger("bp-tooltip-update");
        pubsub.publish("/bp/tooltip/update");
    }
    r.revive = function(hp){
        hp = hp | 0;
        this.setFainted(false);
        this.uiSprite.removeClass("fainted");
        this.changeHpBy(hp);
        this.changeManaBy(hp);
        //$.event.trigger("bp-ability-onRevive");
        pubsub.publish("/bp/battle/onRevive/");
    }
    r.hasBuff = function(buffName){
        if(this.isFainted()) return false;

        var n = this._buffs.length;
        for(var i = 0; i < n; i++) {
            if(this._buffs[i].name === buffName)
                return true;
        }

        return false;
    }
    r.hasDebuff = function(debuffName){
        if(this.isFainted()) return false;
        var n = this._debuffs.length;
        for(var i = 0; i < n; i++) {
            if(this._debuffs[i].name === debuffName)
                return true;
        }

        return false;
    }
    r.calculateDmgTo = function(move, target, opt){
        //var dmg = this.calculatePower(move) * this.getOutgoingDmgMultiplier() * target.getIncomingDmgMultiplier() | 0;
        var dmg = this.calculatePower(move); //* this.getOutgoingDmgMultiplier() * target.getIncomingDmgMultiplier() | 0;
        var def = (target && target.calculateDef(move)) || 1;
        var rnd = 0;
        dmg = (((((200 / 5) + 2) * dmg * 8 / def) / 50) + 2) * this.getOutgoingDmgMultiplier() * target.getIncomingDmgMultiplier() | 0;
        rnd = Math.random() * (dmg * 10 / 100) - (dmg * 20 / 100);

        dmg += rnd | 0;

        if(opt.isCrit){
            dmg *= this._critDmgMultiplicator;
        }

        //var diff = dmg - def;

        //diff = diff >= 0 ? diff : 0;

        return dmg;
    }
    r.calculateCritChance = function(target, move){

        return this.getCritRate();
    }
    r.calculateCrit = function(chance){
        var crit = Math.random() * 100;

        //console.log(crit <= chance, crit, chance);

        return crit <= chance;

    }
    r.calculatePower = function(move){
        var dmg = (move.basePower * this.getAttr("str"));

        return dmg;
    }
    r.calculateDef = function(){
        var def = this.getAttr("Def");

        //console.log(this._name, def);

        return def;
    }
    r.changeHpBy = function(value, crit){
        if(this.isFainted()) return 0;
        value = value | 0;
        crit = crit || false;

        if(value > 0){
            value *= this.getHealMultiplier();
            value = value | 0;
            pubsub.publish("/bp/battle/onReceiveHeal/" + this.getId())
        }

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

        this.uiHp.css({
            "background": "linear-gradient(to right, #00b900 " + this.getHp(true) + "%, rgba(0,0,0,0) 0%)"
        });

        this.uiHp.text(this.getHp() + " / " + this.getMaxHp());
    }
    r.changeManaBy = function(value){
        if(this.isFainted()) return 0;
        value = value | 0;
        if(this.getMana() + value < 0){
            return false;
        }

        this._mana = this.getMana() + value;

        if(this.getMana() > this.getMaxMana()){
            this._mana = this.getMaxMana();
        }

        new Display({target: this, amount: value, isMana: true});

        this.uiMana.css({
            "background": "linear-gradient(to right, #297eff " + this.getMana(true) + "%, rgba(0,0,0,0) 0%)"
        });

        this.uiMana.text(this.getMana() + " / " + this.getMaxMana());

        return true;
    }
    r.ready = function(data){
        data = data || {};

        if(this.isFainted()){
            data.fainted = true;
            data.from = this;
        }
        //$.event.trigger("bp-battle-chosen", {data: data});
        pubsub.publish("/bp/battle/chosen/", [data]);
    }
    r.decreaseDurationTime = function(){

        this._decreaseBuffTime();
        this._decreaseDebuffTime();

        this._renderBuffs();
        this.updateUi();
    }
    r.changeIncomingDmgMultiplierBy = function(val){
        this.setIncomingDmgMultiplier(this.getIncomingDmgMultiplier() + val);
    }
    r.changeOutgoingDmgMultiplierBy = function(val){
        this.setOutgoingDmgMultiplier(this.getOutgoingDmgMultiplier() + val);
    }
    r.eachBuff = function(cb){
        for(var i = 0; i < this._buffs.length; i++) {
            cb.call(this, this._buffs[i]);
        }
    }
    r.increaseCritChancesBy = function(prozent){
        //50 = 50%, 20 = 20%
        this._additionalCritChances += prozent;
    }
    r.decreaseCritChancesBy = function(prozent){
        this._additionalCritChances -= prozent;
    }
    r.increaseCritDmgBy = function(prozent){
        //50 = 50%, 20 = 20%
        this._critDmgMultiplicator += prozent / 100;
    }
    r.decreaseCritDmgBy = function(prozent){
        this._critDmgMultiplicator -= prozent / 100;
    }
    r.increaseHealMultiplierBy = function(prozent){
        //50 = 50%, 20 = 20%
        this._healMultiplier += prozent / 100;
    }
    r.decreaseHealMultiplierBy = function(prozent){
        this._healMultiplier -= prozent / 100;
    }
    /**
     * stats as object.
     * ie.: {
     *  "str": 20
     * }
     * means: boost str by 20%
     *
     * @param {Object} stats
     * @public
     */
    r.changeBoost = function(stats){

        for(var stat in stats) {
            this._boosts[stat] += stats[stat];


            /*if(this._boosts[stat] >= this._buffTable.length){
             this._boosts[stat] = this._buffTable.length - 1;
             logger.message(stat + " can't be boosted more!");
             }*/
        }
        this.updateUi();
    }
    r.uiToggleActive = function(){
        if(this.uiSprite.hasClass("entity-active")){
            this.uiSprite.removeClass("entity-active");
            return;
        }

        this.uiSprite.addClass("entity-active");
    }

    /**
     * Private Methods
     */
    r._removeHandlers = function(buff){
        if(!buff.__handler) return 0;
        for(var i = 0; i < buff.__handler.length; i++) {
            pubsub.unsubscribe(buff.__handler[i]);
        }
        delete buff.__handler;
    }
    r._mergeBuffs = function(buffs){
        var n = buffs.length;
        /*
         for(var i = 0; i < n; i++) {
         var buff = buffs[i];

         for(var j = i + 1; j < n; j++) {
         if(buff.name === buffs[j].name){
         var buff2 = buffs[j];

         var tmp = {};

         for(var obj in buff) {
         tmp[obj] = buff[obj];
         }
         tmp.duration = buff.duration > buff2.duration ? buff.duration : buff2.duration;


         //stats
         for(var stat in buff.stats) {
         if((buff.stats[stat] + buff2.stats[stat]) < this._buffTable.length){
         tmp.stats[stat] = buff.stats[stat] + buff2.stats[stat];
         }
         else {
         tmp.stats[stat] = this._buffTable.length - 1;
         }
         }


         this._removeHandlers(buff2);
         //this._removeHandlers(buff);
         //this._removeHandlers(buff);
         //this._removeHandlers(tmp);
         //
         //this._buffEvents(tmp);


         buffs.splice(j, 1);
         buffs.splice(i, 1);

         buffs.push(tmp);
         pubsub.publish("/bp/battle/onEnd/" + this.getId() + "/" + tmp.id);


         return this._mergeBuffs(buffs);
         }
         }


         }*/
        for(var i = 0; i < n; i++) {
            var buff = buffs[i];
            for(var j = i + 1; j < n; j++) {
                if(buff.name === buffs[j].name){
                    var buff2 = buffs[j];

                    buff.duration = buff.duration > buff2.duration ? buff.duration : buff2.duration;

                    this._removeHandlers(buff2);

                    buffs.splice(j, 1);
                    return this._mergeBuffs(buffs);

                }
            }
        }

    }
    r._abilityListener = function(){
        var self = this;
        for(var i = 0; i < this.getAbilities().length; i++) {
            if(abilityData[this.getAbilities(i)].onFaint){
                //$(document).on("bp-ability-onFaint", abilityData[this.getAbilities(i)].onFaint.bind(self));
                pubsub.subscribe("/bp/battle/onFaint/", abilityData[this.getAbilities(i)].onFaint.bind(this))
            }
            if(abilityData[this.getAbilities(i)].onRevive){
                //$(document).on("bp-ability-onRevive", abilityData[this.getAbilities(i)].onRevive.bind(self));
                pubsub.subscribe("/bp/battle/onRevive/", abilityData[this.getAbilities(i)].onRevive.bind(this))
            }
            if(abilityData[this.getAbilities(i)].onTurnEnd){
                //$(document).on("bp-ability-onTurnEnd", abilityData[this.getAbilities(i)].onTurnEnd.bind(self));
                pubsub.subscribe("/bp/battle/onTurnEnd/", abilityData[this.getAbilities(i)].onTurnEnd.bind(this))
            }
            if(abilityData[this.getAbilities(i)].onTurnBegin){
                //$(document).on("bp-ability-onTurnBegin", abilityData[this.getAbilities(i)].onTurnBegin.bind(self));
                pubsub.subscribe("/bp/battle/onTurnBegin/", abilityData[this.getAbilities(i)].onTurnBegin.bind(this))
            }
            if(abilityData[this.getAbilities(i)].onBeforeAttack){
                //$(document).on("bp-ability-onBeforeAttack", abilityData[this.getAbilities(i)].onBeforeAttack.bind(self));
                pubsub.subscribe("/bp/battle/onBeforeAttack/", abilityData[this.getAbilities(i)].onBeforeAttack.bind(this))
            }
        }
    }
    r._renderBuffs = function(){
        //console.log($(this.uiBuffs));
        var buff = $("<div></div>");
        var debuff = $("<div></div>");
        var i, b, stats2string, tmp, stat;
        $(this.uiBuffs).empty();
        $(this.uiDebuffs).empty();


        var n = this._buffs.length;
        var m = this._debuffs.length;

        for(i = 0; i < n; i++) {
            b = this._buffs[i];
            stats2string = "";
            tmp = $("<img>");

            for(stat in b.stats) {
                stats2string += stat + ": " + b.stats[stat] + "; ";
            }

            /*
             //$(buff).html(b.name + "<br>" + stats2string + "<br>" + b.duration);
             tmp += b.name + "<br>" + stats2string + "<br>" + b.duration + "<br>";


             */

            if(!this._buffs[i].icon) continue;

            $(tmp).attr("src", b.icon)
            $(tmp).attr("data-id", this.getId());
            $(tmp).attr("data-value", b.name);
            $(tmp).attr("data-type", "buff");

            $(this.uiBuffs).append(tmp);
        }

        for(i = 0; i < m; i++) {
            b = this._debuffs[i];
            stats2string = "";
            tmp = $("<img>");

            for(stat in b.stats) {
                stats2string += stat + ": " + b.stats[stat] + "; ";
            }


            if(!this._debuffs[i].icon) continue;

            $(tmp).attr("src", b.icon)
            $(tmp).attr("data-id", this.getId());
            $(tmp).attr("data-value", b.name);
            $(tmp).attr("data-type", "debuff");

            $(this.uiDebuffs).append(tmp);
        }


        //$(buff).html(tmp);

    }
    r._nextTurnListener = function(){
        var self = this;
        /*
         $(document).on("bp-battle-nextTurn", function(){
         if(self.isFainted()) self.ready();

         //self._hasChosen = false;
         self.setChosen(false);
         self.turnAction = {};
         })
         */
        pubsub.subscribe("/bp/battle/nextTurn/", function(){
            if(self.isFainted()) self.ready();

            //self._hasChosen = false;
            self.setChosen(false);
            self.turnAction = {};
            //console.log(this);
        })
    }
    r._buffListener = function(){
        //pubsub.subscribe("/bp/battle/onTurnEnd")
        /*
         this.eachBuff(function(buff){
         if(!buff.effects) return 0;
         if(buff.effects.onTurnEnd){
         console.log("buff test", this, buff);
         //pubsub.subscribe("/bp/battle/onTurnEnd", buffData.load())
         }
         });
         */
    }
    r._decreaseBuffTime = function(){
        var n = this._buffs.length;
        var i;

        for(i = 0; i < n; i++) {
            var buff = this._buffs[i];

            //buff.duration = -1 => no duration
            if(buff.duration != -1 && buff.duration - 1 === 0){
                this.removeBuff(buff, i);
                return this.decreaseDurationTime();
            }
        }
        for(i = 0; i < n; i++) {
            if(buff.duration === -1) continue;
            this._buffs[i].duration--;
        }
    }
    r._decreaseDebuffTime = function(){
        var n = this._debuffs.length;
        var i;

        for(i = 0; i < n; i++) {
            var debuff = this._debuffs[i];

            //debuff.duration = -1 => no duration
            if(debuff.duration != -1 && debuff.duration - 1 === 0){
                this.removeDebuff(debuff, i);
                return this.decreaseDurationTime();
            }
        }
        for(i = 0; i < n; i++) {
            if(debuff.duration === -1) continue;
            this._debuffs[i].duration--;
        }
    }
    r._buffEvents = function(buff){
        var self = this;
        if(buff.effects){
            var __h = buff.__handler = [];
            if(buff.effects.onTurnEnd){
                __h.push(pubsub.subscribe("/bp/battle/onTurnEnd/",
                    buff.effects.onTurnEnd.bind(this, buff)));
            }
            if(buff.effects.onTurnBegin){
                __h.push(pubsub.subscribe("/bp/battle/onTurnBegin/",
                    buff.effects.onTurnBegin.bind(this, buff)));
            }
            if(buff.effects.onFaint){
                __h.push(pubsub.subscribe("/bp/battle/onFaint/",
                    buff.effects.onFaint.bind(this, buff)));
            }
            if(buff.effects.onRevive){
                __h.push(pubsub.subscribe("/bp/battle/onRevive/",
                    buff.effects.onRevive.bind(this, buff)));
            }
            if(buff.effects.onGetHit){
                __h.push(pubsub.subscribe("/bp/battle/onGetHit/" + this.getId(), // + "/"+ buff.id,
                    buff.effects.onGetHit.bind(this, buff)));
            }
            if(buff.effects.onHit){
                __h.push(pubsub.subscribe("/bp/battle/onHit/" + this.getId(), // + "/"+ buff.id,
                    buff.effects.onHit.bind(this, buff)));
            }
            if(buff.effects.onInit){/*
             __h.push(pubsub.subscribe("/bp/battle/onInit/" + this.getId() + "/"+ buff.id,
             buff.effects.onInit.bind(this, buff)));*/
                __h.push(pubsub.subscribe("/bp/battle/onInit/" + this.getId() + "/" + buff.id, function(){
                    if(buff.__initFlag){
                        return self;
                    }
                    buff.effects.onInit.call(self, buff);
                    buff.__initFlag = true;
                }));
            }
            if(buff.effects.onEnd){/*
             __h.push(pubsub.subscribe("/bp/battle/onEnd/" + this.getId() + "/" + buff.id,
             buff.effects.onEnd.bind(this, buff)));*/
                __h.push(pubsub.subscribe("/bp/battle/onEnd/" + this.getId() + "/" + buff.id, function(){
                        if(buff.__endFlag){
                            return self;
                        }
                        buff.effects.onEnd.call(self, buff);
                        buff.__endFlag = true;
                    }
                ));
            }
            if(buff.effects.onReceiveHeal){
                __h.push(pubsub.subscribe("/bp/battle/onReceiveHeal/" + this.getId(),
                    buff.effects.onReceiveHeal.bind(this, buff)));
            }
        }

    }

    return Entity;
})();

module.exports = Entity;