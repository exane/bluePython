var Entity = require("./Entity.js");
var logger = require("./log.js");
var moveData = require("../data/moves.js");

"use strict";
var Player = (function(){

    var Player = function(options, yourSide, otherSide, uiMenu){
        Entity.call(this, options, yourSide, otherSide);

        this.uiMenuAttack = $("#menu-attack");
        this.uiMenuDefense = $("#menu-defense");
        this.uiMenuSkill = $("#menu-skill");
        this.uiMenu = uiMenu;

        this._isOpen = false;
        //this.events = events;


        //this.otherSide = otherSide || null;

        //this.listSkills();
        //this.listTargets(otherSide, yourSide);

        this.initEvents();
    }
    __extends(Player, Entity);
    var r = Player.prototype;

    r.uiMenuAttack = null;
    r.uiMenuDefense = null;
    r.uiMenuSkill = null;
    r.uiMenu = null;

    r.isActive = false;
    r.isPlayer = true;

    //r.otherSide = null;
    //r.events = {};
    r._isOpen = null;

    r.setOpen = function(bool){
        this._isOpen = bool;
    }

    r.isOpen = function(){
        return this._isOpen;
    }

    r.initEvents = function(){
        var self = this;
        //debugger;
        this.uiMenuAttack.click(function(){
            if(self.isActive)
                self.clickAttack.call(self);
        });

        this.uiMenuDefense.click(function(){
            if(self.isActive)
                self.clickDefense.call(self);
        });

        this.uiMenuSkill.click(function(){
            if(self.isActive)
                self.clickSkills.call(self);
        });

        $(".view").on("click", this.onBack.bind(this));
        //this.resetMenu();

    }

    r.clickSkills = function(){
        this.listSkills();
        this.uiMenu.children(".menu-main").hide();
        this.uiMenu.children(".menu-skills").show();
        this.expandMenu();

    }

    r.clickDefense = function(){
        var self = this;
        if(this.hasChosen()) return 0;
        this.turnAction.do = "default_defense";
        this.turnAction.from = this;
        //this.hasChosen = true;
        //this.expandMenu();
        setTimeout(function(){
            self.setChosen(true);
            self.ready(self.turnAction);
        },1);
        //console.log(this);
    }

    r.clickAttack = function(){
        this.turnAction.do = "default_attack";
        this.listTargets(this.getOtherside(), this.getYourside());


        //logger.message("-> Choose a target to attack");
        this.uiMenu.children(".menu-main").hide();
        this.uiMenu.children(".menu-target-enemy").show();

        this.expandMenu();

    }

    r.expandMenu = function(){
        var maxHeight = $(".view").css("height");
        this.setOpen(true);
        //return;
        this.uiMenu.animate({
            "margin-top": "-=" + maxHeight,
            "height": "+=" + maxHeight
        }, {
            duration: 300
        });
    }

    r.reduceMenu = function(){
        //return;
        var maxHeight = $(".view").css("height");
        /*
         this.uiMenu.animate({
         "top": "+="+maxHeight,
         "height": "-="+maxHeight
         });
         */
        if(!this.isOpen()) return;
        this.uiMenu.css({
            "margin-top": 0,
            "height": "-=" + maxHeight
        });
    }

    r.onBack = function(){
        if(this.isOpen()){
            this.resetMenu();
        }
    }

    r.resetMenu = function(){
        if(this.isFainted()) return 0;
        this.turnAction = null;
        this.turnAction = {};
        this.reduceMenu();
        this.setOpen(false);
        this.uiMenu.children(".menu-main").show();
        this.uiMenu.children(".menu-target-enemy").hide();
        this.uiMenu.children(".menu-target-ally").hide();
        this.uiMenu.children(".menu-skills").hide();

    }

    r.onSkillClick = function(skill){
        //console.log(skill);
        if(this.hasChosen()) return 0;
        this.listTargets(this.getOtherside(), this.getYourside());


        //this.listTargets();

        this.turnAction.do = skill.id;
        this.turnAction.from = this;
        this.uiMenu.children(".menu-skills").hide();

        if(skill.isAoe || skill.target === "self"){
            //this.onTargetClick(this.otherSide.member);
            if(this.hasChosen()) return 0;
            this.setChosen(true);
            this.ready(this.turnAction);
            return 0;
        }

        if(skill.target && skill.target === "friendly"){
            this.uiMenu.children(".menu-target-ally").show();
            return 0;
        }


        this.uiMenu.children(".menu-target-enemy").show();
    }

    r.setChosen = function(value){
        if(value){
            this.reduceMenu();
            //$(".controller").hide();
            this.uiToggleActive();
            this.isActive = false;
        }
        this.setOpen(false);
        this._hasChosen = value;
    }

    r.onTargetClick = function(target){
        if(this.hasChosen()) return 0;

        this.turnAction.target = target;
        this.turnAction.from = this;

        //console.log("yolo", this, target);
        //this.hasChosen = true;
        this.setChosen(true);
        this.ready(this.turnAction);
    }

    r.listTargets = function(otherSide, yourSide){
        //if(!this.player) return 0;
        var ulEnemy = this.uiMenu.children(".menu-target-enemy").find("ul");
        //console.log(ulEnemy, otherSide);
        var ulAlly = this.uiMenu.children(".menu-target-ally").find("ul");
        var npc, pointer, i;
        var n = otherSide.length();
        var m = yourSide.length();

        ulEnemy.text("");
        ulAlly.text("");
        for(i = 0; i < n; i++) {
            npc = otherSide.getMemberByIndex(i);
            pointer = $("<li>" + npc.getName() + "</li>");


            otherSide.addDomPointerReferenceTo(npc.getId(), pointer);

            $(pointer).appendTo(ulEnemy);

            $(pointer).on("click", this.onTargetClick.bind(this, npc));
            pointer.on("mouseover", npc.uiToggleActive.bind(npc));
            pointer.on("mouseout", npc.uiToggleActive.bind(npc));
            //console.log(pointer, npc);
        }
        for(i = 0; i < m; i++) {

            npc = yourSide.getMemberByIndex(i);
            pointer = $("<li>" + npc.getName() + "</li>");

            //console.log("npc", npc);

            //this.side2.addDomPointerReferenceTo(npc.id, pointer);
            yourSide.addDomPointerReferenceTo(npc.getId(), pointer);

            $(pointer).appendTo(ulAlly);

            $(pointer).on("click", this.onTargetClick.bind(this, npc));
            pointer.on("mouseover", npc.uiToggleActive.bind(npc));
            pointer.on("mouseout", npc.uiToggleActive.bind(npc));
        }
    }

    r.listSkills = function(){
        //if(!this.player) return 0;
        var ul = $(".menu-skills ul");
        var n = this.getSkillList().length;

        ul.empty("");

        for(var i = 0; i < n; i++) {
            //moves.push(moveData[this.player.skillList[i]].name);
            var data = moveData[this.getSkillList(i)];
            var li = $("<li data-type='skill' value='" + data.id + "'></li>");
            $(li).append("<img src='" + data.icon + "'>");
            $(li).append("<p>" + data.name + "</p>");
            ul.append(li);

            //console.log("yolo", );
            $("li[value=" + data.id + "]").on("click", this.onSkillClick.bind(this, data));
        }

    }



    return Player;
})();

module.exports = Player;