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
        entity.id = this.sideId + "_" + entity.id;
        //entity.name = this.sideName + " " + entity.name;
        this.member.push(entity);
        this.uiMember.push(null);
        this.createInfoUi(entity);
    }

    r.createInfoUi = function(entity){
        var uiInfo = $(this.uiSide).find(".battle-info");
        var uiSprite = $(this.uiSide).find(".sprite");

        var uiName = "<div id='" + this.sideId + "-battle-name-" + entity.id + "' class='battle-name'>" + entity.getFullName() + "</div>";

        var uiHp = "<div id='" + this.sideId + "-battle-hp-" + entity.id + "' class='bar bar-hp'>" +
            entity.currHp + " / " + entity.maxHp +
            "</div>";


        var sprite = "<img id='" + this.sideId + "-battle-sprite-" + entity.id + "' src='" + entity.img + "'>";
        var spriteContainer = "<div class='sprite-img-container' id='" + this.sideId + "-battle-sprite-" + entity.id + "-container'></div>"


        $(uiName).appendTo(uiInfo);
        $(uiHp).appendTo(uiInfo);

        $(spriteContainer).appendTo(uiSprite);
        $(sprite).appendTo("#" + this.sideId + "-battle-sprite-" + entity.id + "-container");


        entity.uiSprite = $("#" + this.sideId + "-battle-sprite-" + entity.id);
        entity.uiName = $("#" + this.sideId + "-battle-name-" + entity.id);
        entity.uiHp = $("#" + this.sideId + "-battle-hp-" + entity.id);

        entity.uiSprite.attr("data-id", entity.id);

    }

    r.getMemberById = function(id){
        var n = this.member.length;
        for(var i = 0; i < n; i++) {
            if(this.member[i].id !== id) continue;
            return this.member[i];
        }
        return null;
    }

    r.getMemberIndexById = function(id){
        var n = this.member.length;
        for(var i = 0; i < n; i++) {
            if(this.member[i].id !== id) continue;
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
            if(!this.member[i].fainted){
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
            if(!this.member[i].fainted){
                return true;
            }
        }

        return false;
    }

    r.hasDeadMember = function(){
        var n = this.member.length;

        for(var i = 0; i < n; i++) {
            if(this.member[i].fainted){
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

        if(!this.member[index].fainted === alive){
            return this.member[index];
        }

        return this.getRandomMember(alive);

    }

    r.getAllAliveMembers = function(){
        var n = this.member.length;
        var tmp = [];

        for(var i = 0; i < n; i++) {
            if(!this.member[i].fainted){
                tmp.push(this.member[i]);
            }
        }

        return tmp;
    }


    return BattleSide;
})();


module.exports = BattleSide;