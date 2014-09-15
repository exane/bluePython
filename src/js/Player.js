var Entity = require("./Entity.js");
var logger = require("./log.js");

"use strict";
var Player = (function(){

    var Player = function(options, yourSide, otherSide, uiMenu){
        Entity.call(this, options, yourSide, otherSide);

        this.uiMenuAttack = $("#menu-attack");
        this.uiMenuDefense = $("#menu-defense");
        this.uiMenuSkill = $("#menu-skill");
        this.uiMenu = uiMenu;


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
    r._isOpen = false;

    r.setOpen = function(bool){
        this._isOpen = bool;
    }

    r.isOpen = function(){
        return this._isOpen;
    }

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

        $(".view").click(this.onBack.bind(this));
    }

    r.clickSkills = function(){
        this.uiMenu.children(".menu-main").hide();
        this.uiMenu.children(".menu-skills").show();
        this.expandMenu();

    }

    r.clickDefense = function(){
        if(this.hasChosen()) return 0;
        this.turnAction.do = "default_defense";
        this.turnAction.from = this;
        //this.hasChosen = true;
        this.expandMenu();
        this.setChosen(true);
        this.ready(this.turnAction);
        //console.log(this);
    }

    r.clickAttack = function(){
        this.turnAction.do = "default_attack";


        //logger.message("-> Choose a target to attack");
        this.uiMenu.children(".menu-main").hide();
        this.uiMenu.children(".menu-target-enemy").show();

        this.expandMenu();

    }

    r.expandMenu = function(){
        var maxHeight = $(".view").css("height");
        this.setOpen(true);
        this.uiMenu.animate({
            "margin-top": "-=" + maxHeight,
            "height": "+=" + maxHeight
        }, {
            duration: 300
        });
    }

    r.reduceMenu = function(){
        var maxHeight = $(".view").css("height");
        /*
         this.uiMenu.animate({
         "top": "+="+maxHeight,
         "height": "-="+maxHeight
         });
         */
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
            $(".controller").hide();
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


    return Player;
})();

module.exports = Player;