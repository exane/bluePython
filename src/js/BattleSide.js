"use strict";

var BattleSide = (function(){
    var BattleSide = function(side){
        this.member = [];
        this.uiMember = [];
        this.uiSide = side;

        //console.log(side);
    }
    var r = BattleSide.prototype;

    r.member = null;
    r.uiMember = null;
    r.uiSide = null;

    r.uiInfo = null;
    r.uiSprite = null;

    r.add = function(entity){
        this.member.push(entity);
        this.uiMember.push(null);
        this.createInfoUi(entity);
    }

    r.createInfoUi = function(entity){
        var uiInfo = $(this.uiSide).find(".battle-info");
        var uiSprite = $(this.uiSide).find(".sprite");

        var uiName = "<div id='battle-name-" + entity.id + "' class='battle-name'>" + entity.name + "</div>";

        var uiHp = "<div id='battle-hp-" + entity.id + "' class='bar bar-hp'>" +
            entity.currHp + " / " + entity.maxHp +
            "</div>";


        var sprite = "<img id='battle-sprite-" + entity.id + "' src='" + entity.img + "'>";


        $(uiName).appendTo(uiInfo);
        $(uiHp).appendTo(uiInfo);

        $(sprite).appendTo(uiSprite);

        entity.uiSprite = $("#battle-sprite-" + entity.id);
        entity.uiName = $("#battle-name-" + entity.id);
        entity.uiHp = $("#battle-hp-" + entity.id);

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
        var k=0;

        if(!onlyAlive){
            return this.member.length;
        }

        for(var i=0; i<this.member.length; i++){
            if(!this.member[i].fainted) {
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




    return BattleSide;
})();


module.exports = BattleSide;