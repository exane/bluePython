"use strict";

var BattleSide = (function(){
    var BattleSide = function(side, id, name){
        this.member = [];
        this.uiMember = [];
        this.uiSide = side;

        this.sideId = id || null;
        this.sideName = name || "unnamed";

        //console.log(side);
    }
    var r = BattleSide.prototype;

    r.member = null;
    r.uiMember = null;
    r.uiSide = null;

    r.uiInfo = null;
    r.uiSprite = null;

    r.sideId = null;
    r.sideName = null;

    r.add = function(entity){
        //entity.id = this.sideId + "_" + entity.id;
        entity.setId(this.sideId + "_" + entity.getId());
        //entity.name = this.sideName + " " + entity.name;
        this.member.push(entity);
        this.uiMember.push(null);
        this.createInfoUi(entity);
    }

    r._createUiSprite = function(entity){
        var uiSprite = $(this.uiSide).find(".sprite");
        var sprite = $("<img>");
        var spriteContainer = $("<div></div>");

        $(sprite).attr("id", this.sideId + "-battle-sprite-" + entity.getId());
        $(sprite).attr("src", entity.getImg());

        $(spriteContainer).attr("id", this.sideId + "-battle-sprite-" + entity.getId() + "-container");
        $(spriteContainer).addClass("sprite-img-container");

        $(spriteContainer).appendTo(uiSprite);
        $(sprite).appendTo(spriteContainer);

        entity.uiSprite = $(sprite);
        entity.uiSprite.attr("data-id", entity.getId());
    }

    r._createUiName = function(entity, uiInfo){
        //var uiName = "<div id='" + this.sideId + "-battle-name-" + entity.getId() + "' class='battle-name'>" + entity.getFullName() + "</div>";
        var uiName = $("<div class='battle-name'></div>");

        $(uiName).attr("id", this.sideId + "-battle-name-" + entity.getId());
        $(uiName).text(entity.getFullName());

        $(uiName).appendTo(uiInfo);
        entity.uiName = $(uiName);
    }

    r._createUiBuffs = function(entity, uiInfo){
        var uiBuffs = $("<div></div>").attr("id", this.sideId + "-battle-buffs-" + entity.getId());
        $(uiBuffs).appendTo(uiInfo);
        entity.uiBuffs = $(uiBuffs);
    }

    r._createUiHp = function(entity, uiInfo){
        var uiHp = $("<div class='bar bar-hp'></div>");

        $(uiHp).attr("id", this.sideId + "-battle-hp-" + entity.getId());
        $(uiHp).text(entity.getHp() + " / " + entity.getMaxHp());


        $(uiHp).appendTo(uiInfo);
        entity.uiHp = $(uiHp);

    }
    r._createUiMana = function(entity, uiInfo){
        var uiMana = $("<div class='bar bar-mana'></div>");

        $(uiMana).attr("id", this.sideId + "-battle-mana-" + entity.getId());
        $(uiMana).text(entity.getMana() + " / " + entity.getMaxMana());


        $(uiMana).appendTo(uiInfo);
        entity.uiMana = $(uiMana);

    }

    r.createInfoUi = function(entity){
        var uiInfo = $(this.uiSide).find(".battle-info");

        this._createUiName(entity, uiInfo);
        this._createUiHp(entity, uiInfo);
        this._createUiMana(entity, uiInfo);
        this._createUiBuffs(entity, uiInfo);
        this._createUiSprite(entity);

    }

    r.getMemberById = function(id){
        var n = this.member.length;
        for(var i = 0; i < n; i++) {
            if(this.member[i].getId() !== id) continue;
            return this.member[i];
        }
        return null;
    }

    r.getMemberIndexById = function(id){
        var n = this.member.length;
        for(var i = 0; i < n; i++) {
            if(this.member[i].getId() !== id) continue;
            return i;
        }
        return -1;
    }

    r.length = function(onlyAlive){
        onlyAlive = onlyAlive || false;
        var k = 0;

        if(!onlyAlive){
            return this.member.length;
        }

        for(var i = 0; i < this.member.length; i++) {
            if(!this.member[i].isFainted()){
                k++;
            }
        }

        return k;

    }

    r.getMemberByIndex = function(index){
        return this.member[index];
    }

    r.addDomPointerReferenceTo = function(id, pointer){
        var index = this.getMemberIndexById(id);
        this.uiMember[index] = pointer;
    }

    r.hasMemberAlive = function(){
        var n = this.member.length;

        for(var i = 0; i < n; i++) {
            if(!this.member[i].isFainted()){
                return true;
            }
        }

        return false;
    }

    r.hasDeadMember = function(){
        var n = this.member.length;

        for(var i = 0; i < n; i++) {
            if(this.member[i].isFainted()){
                return true;
            }
        }

        return false;
    }

    r.getRandomMember = function(alive){
        var n = 0;
        var index = 0;
        n = this.member.length;
        index = Math.random() * n | 0;

        if(typeof alive == "undefined"){
            // doesnt matter whether alive or dead
            return this.member[index];
        }

        if(!this.member[index].isFainted() === alive){
            return this.member[index];
        }

        return this.getRandomMember(alive);

    }

    r.getAllAliveMembers = function(){
        var n = this.member.length;
        var tmp = [];

        for(var i = 0; i < n; i++) {
            if(!this.member[i].isFainted()){
                tmp.push(this.member[i]);
            }
        }

        return tmp;
    }


    return BattleSide;
})();


module.exports = BattleSide;