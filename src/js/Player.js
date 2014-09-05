var Entity = require("./Entity.js");
var logger = require("./log.js");

"use strict";
var Player = (function(){

    var Player = function(options, yourSide, otherSide, uiMenu){
        Entity.call(this, options, yourSide, otherSide);

        this.uiMenuAttack = $("#menu-attack");
        this.uiMenuDefense = $("#menu-defense");
        this.uiMenuSkill = $("#menu-skill");
        this.uiMenu  = uiMenu;

        this.fainted = false;

        //this.events = events;


        //this.otherSide = otherSide || null;

        this.initEvents();
    }
    __extends(Player, Entity);
    var r = Player.prototype;

    r.uiMenuAttack = null;
    r.uiMenuDefense = null;
    r.uiMenuSkill = null;
    r.uiMenu = null;

    //r.otherSide = null;
    //r.events = {};

    r.initEvents = function(){
        var self = this;
        this.uiMenuAttack.click(function(){
            self.clickAttack.call(self);
        });

        this.uiMenuDefense.click(function(){
            self.clickDefense.call(self);
        });

        this.uiMenuSkill.click(function(){
            self.clickSkills.call(self);
        });
    }

    r.clickSkills = function(){
        this.uiMenu.children(".menu-main").hide();
        this.uiMenu.children(".menu-skills").show();

    }

    r.clickDefense = function(){
        this.turnAction.do = "default_defense";
        this.turnAction.from = this;
        //this.hasChosen = true;
        this.setChosen(true);
        this.ready(this.turnAction);
        console.log(this);
    }

    r.clickAttack = function(){
        this.turnAction.do = "default_attack";


        //logger.message("-> Choose a target to attack");
        this.uiMenu.children(".menu-main").hide();
        this.uiMenu.children(".menu-target").show();

    }


    r.resetMenu = function(){
        if(this.fainted) return 0;
        this.uiMenu.children(".menu-main").show();
        this.uiMenu.children(".menu-target").hide();
        this.uiMenu.children(".menu-skills").hide();

    }

    r.onSkillClick = function(skill){
        //console.log(skill);
        if(this.hasChosen) return 0;

        this.turnAction.do = skill.id;
        this.turnAction.from = this;
        this.uiMenu.children(".menu-skills").hide();
        if(skill.isAoe){
            //this.onTargetClick(this.otherSide.member);
            if(this.hasChosen) return 0;
            this.setChosen(true);
            this.ready(this.turnAction);
            return 0;
        }
        this.uiMenu.children(".menu-target").show();
    }

    r.setChosen = function(value){
        if(value){
            $(".controller").hide();
        }
        this.hasChosen = value;
    }

    r.onTargetClick = function(target){
        if(this.hasChosen) return 0;

        this.turnAction.target = target;
        this.turnAction.from = this;

        //console.log("yolo", this, target);
        //this.hasChosen = true;
        this.setChosen(true);
        this.ready(this.turnAction);
    }



    return Player;
})();

module.exports = Player;