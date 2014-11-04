var Entity = require("./Entity.js");
var logger = require("./log.js");
var moveData = require("../data/moves.js");

var Player = (function(){
    "use strict";

    var Player = function(options, yourSide, otherSide, uiMenu){
        Entity.call(this, options, yourSide, otherSide);

        this.uiMenuAttack = $(".menu-attack");
        this.uiMenuSkill = $(".menu-skill");
        this.uiMenuBack = $(".menu-back");
        this.uiMenu = uiMenu;
        this.uiAttacksLeft = $(".entity-attacks-left");
        this.uiView = $(".view");
        this.uiWrapper = $(".wrapper");

        this.uiOpenControllerSmall = $(".controller-small .controller-arrow-container");

        this._isOpen = false;
        this._isSmallView = false;

        this.onResize();

        //this.setMenuOpen(false);


        this.initEvents();
    }
    __extends(Player, Entity);
    var r = Player.prototype;

    r.uiMenuAttack = null;
    r.uiMenuDefense = null;
    r.uiMenuSkill = null;
    r.uiMenuBack = null;
    r.uiMenu = null;
    r.uiAttacksLeft = null;
    r.uiOpenControllerSmall = null;
    r.uiView = null;
    r.uiWrapper = null;

    r._isActive = false;
    r._isPlayer = true;

    r._isSmallView = null;

    r._isOpen = null;
    Player._menuOpen = false;

    r.isMenuOpen = Player.isMenuOpen = function(){
        return Player._menuOpen;
    }

    r.setMenuOpen = Player.setMenuOpen = function(bool){
        Player._menuOpen = bool;
    }

    Player.reduceMenuGlobal = function(){
        if(!Player.isMenuOpen()) return;
        Player.setMenuOpen(false);

        var el = $(".controller-small .controller-arrow-container");
        el.find(".controller-arrow-img").addClass("arrow-left");
        el.find(".controller-arrow-img").removeClass("arrow-right");

        el.parent().find(".controller-small-view").stop().fadeOut("fast");

        el.parent().animate({
            //"width": "-=250",
            "left": "+=250"
        }, {
            duration: 300
        });
    }
    Player.extendMenuGlobal = function(){

        if(Player.isMenuOpen()) return;

        Player.setMenuOpen(true);
        var el = $(".controller-small .controller-arrow-container");
        el.find(".controller-arrow-img").removeClass("arrow-left");
        el.find(".controller-arrow-img").addClass("arrow-right");

        el.parent().find(".controller-small-view").stop().fadeIn("slow");

        el.parent().animate({
            //"width": "+=250",
            "left": "-=250"
        }, {
            duration: 300
        });
    }

    Player.openControllerSmall = function(){
        if(Player.isMenuOpen()){
            Player.reduceMenuGlobal();
        }
        else {
            Player.extendMenuGlobal();
        }
        $(".controller-small .controller-arrow-container").parent().find(".controller-small-view").removeClass("hidden");
    }


    r.setActive = function(bool){
        if(bool){
            this.updateAttacksLeftCounter();
            this.uiSetActive(true);
            this.addHighlightBuffs();
        }
        if(!bool){
            this.uiSetActive(false);
            this.removeHighlightBuffs();
        }
        this._isActive = bool;
    }

    r.isActive = function(){
        return this._isActive;
    }

    r.setOpen = function(bool){
        this._isOpen = bool;
    }

    r.isOpen = function(){
        return this._isOpen;
    }

    r.isSmallView = function(){
        return this._isSmallView;
    }

    r.onResize = function(){
        if($(window).height() < 850){
            this._isSmallView = true;
        }
        else {
            this._isSmallView = false;
        }
    }

    r.initEvents = function(){
        var self = this;

        this.uiMenuAttack.click(function(){
            if(self.isActive())
                self.clickAttack.call(self);
        });

        this.uiMenuSkill.click(function(){
            if(self.isActive())
                self.clickSkills.call(self);
        });

        this.uiMenuBack.click(function(){
            if(self.isActive()){
                self.onBack.call(self);
            }
        });

        this.uiOpenControllerSmall.click(function(){
            if(self.isActive())
                self.clickOpenControllerSmall.call(self);
        });

        $(window).resize(this.onResize.bind(this));

        this.uiView.on("click", this.onReset.bind(this));
        //this.resetMenu();

    }

    r.clickSkills = function(){
        this.listSkills();
        //this.uiMenu.children(".menu-main").hide();
        //this.uiMenu.children(".menu-skills").show();


        this.uiWrapper.find(".menu-main").hide();
        this.uiWrapper.find(".menu-skills").show();

        this.expandMenu();
    }

    r.clickAttack = function(){

        this.turnAction.do = this.getDefaultAttack();
        this.uiWrapper.find(".menu-main").hide();
        this.uiWrapper.find(".menu-target-enemy").show();

        this.listTargets(this.getOtherside(), this.getYourside());


        //logger.message("-> Choose a target to attack");
        //this.uiMenu.children(".menu-main").hide();
        this.uiWrapper.find(".menu-main").hide();


        if(this.isTargetSkippable()){
            setTimeout(function(){
                this.onTargetClick(this.getOtherside().getMemberByIndex(0));
            }.bind(this), 1);
            return 0;
        }
        //this.uiMenu.children(".menu-target-enemy").show();
        this.uiWrapper.find(".menu-target-enemy").show();

        this.expandMenu();

    }

    r.clickOpenControllerSmall = function(){
        if(this.isMenuOpen()){
            this.reduceSmallMenu();
        }
        else {
            this.expandSmallMenu();
        }
        this.uiOpenControllerSmall.parent().find(".controller-small-view").removeClass("hidden");
    }

    r.expandSmallMenu = function(){
        if(this.isMenuOpen()) return;

        this.setMenuOpen(true);

        this.uiOpenControllerSmall.find(".controller-arrow-img").removeClass("arrow-left");
        this.uiOpenControllerSmall.find(".controller-arrow-img").addClass("arrow-right");

        this.uiOpenControllerSmall.parent().find(".controller-small-view").stop().fadeIn("slow");

        this.uiOpenControllerSmall.parent().animate({
            //"width": "+=250",
            "left": "-=250"
        }, {
            duration: 300
        });
    }

    r.reduceSmallMenu = function(){
        if(!this.isMenuOpen()) return;
        this.setMenuOpen(false);

        this.uiOpenControllerSmall.find(".controller-arrow-img")
        .addClass("arrow-left")
        .removeClass("arrow-right");

        this.uiOpenControllerSmall.parent().find(".controller-small-view").stop().fadeOut("fast");

        this.uiOpenControllerSmall.parent().animate({
            //"width": "-=250",
            "left": "+=250"
        }, {
            duration: 300
        });
    }

    r.expandMenu = function(){
        this.setOpen(true);
        if(this.isSmallView()) return false;

        var maxHeight = $(".view").css("height");
        //return;
        this.uiMenu.animate({
            "margin-top": "-=" + maxHeight,
            "height": "+=" + maxHeight
        }, {
            duration: 300
        });
    }

    r.reduceMenu = function(){
        if(this.isSmallView()) return 0;

        var maxHeight = $(".view").css("height");
        if(!this.isOpen()) return;
        this.uiMenu.css({
            "margin-top": 0,
            "height": "-=" + maxHeight
        });
    }

    r.onReset = function(){
        if(this.isOpen()){
            this.resetMenu();
            this.removeFreshCooldown();
        }

    }

    r.onBack = function(){
        this.turnAction._back = true;
        this.turnAction.from = this;
        this.setReady();
    }

    r.resetMenu = function(){
        if(this.isFainted()) return 0;
        //this.turnAction = null;
        this.turnAction = {};
        this.reduceMenu();
        this.setOpen(false);
        /*
         this.uiMenu.children(".menu-main").show();
         this.uiMenu.children(".menu-target-enemy").hide();
         this.uiMenu.children(".menu-target-ally").hide();
         this.uiMenu.children(".menu-skills").hide();*/
        this.uiWrapper.find(".menu-main").show();
        this.uiWrapper.find(".menu-target-enemy").hide();
        this.uiWrapper.find(".menu-target-ally").hide();
        this.uiWrapper.find(".menu-skills").hide();

    }

    r.onSkillClick = function(skill){
        if(this.hasChosen()) return 0;
        if(this.hasCooldown(skill.id)) return 0;

        this.listTargets(this.getOtherside(), this.getYourside());

        if(skill.cooldown){
            this.addCooldown(skill.id);
        }

        this.turnAction.do = skill.id;
        this.turnAction.from = this;
        //this.uiMenu.children(".menu-skills").hide();
        this.uiWrapper.find(".menu-skills").hide();

        if(skill.isAoe || skill.target === "self"){
            if(this.hasChosen()) return 0;
            this.setChosen(true);
            this.setReady();
            return 0;
        }

        if(this.isTargetSkippable(skill)){
            this.onTargetClick(this.getOtherside().getMemberByIndex(0));
            return 0;
        }

        if(skill.target && skill.target === "friendly"){
            //this.uiMenu.children(".menu-target-ally").show();
            this.uiWrapper.find(".menu-target-ally").show();
            return 0;
        }


        //this.uiMenu.children(".menu-target-enemy").show();
        this.uiWrapper.find(".menu-target-enemy").show();
    }

    r.isTargetSkippable = function(skill){
        var isSkill = !!skill;
        if(!isSkill) skill = {}
        return this.getOtherside().length() === 1 && (skill.target === "enemy" || !isSkill);
    }

    r.setChosen = function(value){
        if(value){
            this.reduceMenu();
            //$(".controller").hide();
            this.uiSetActive(false);
            this.setActive(false);
        }
        this.setOpen(false);
        this._hasChosen = value;
    }

    r.onTargetClick = function(target){
        if(this.hasChosen()) return 0;

        this.turnAction.target = target;
        this.turnAction.from = this;

        this.setChosen(true);
        this.setReady();
    }

    r.setReady = function(){
        this.ready(this.turnAction);
    }

    r.updateAttacksLeftCounter = function(){
        this.uiAttacksLeft.text(this.getAttacksLeft() || null);
    }

    r.listTargets = function(otherSide, yourSide){
        //if(!this.player) return 0;
        //var ulEnemy = this.uiMenu.children(".menu-target-enemy").find("ul");
        var ulEnemy = this.uiWrapper.find(".menu-target-enemy ul");
        //console.log(ulEnemy, otherSide);
        //var ulAlly = this.uiMenu.children(".menu-target-ally").find("ul");
        var ulAlly = this.uiWrapper.find(".menu-target-ally ul");
        var npc, pointer, i;
        var n = otherSide.length();
        var m = yourSide.length();
        var self = this;

        ulEnemy.text("");
        ulAlly.text("");
        for(i = 0; i < n; i++) {
            npc = otherSide.getMemberByIndex(i);
            pointer = $("<li>" + npc.getName() + "</li>");

            otherSide.addDomPointerReferenceTo(npc.getId(), pointer);


            pointer.on("click", this.onTargetClick.bind(this, npc));
            pointer.on("mouseover", npc.uiSetTarget.bind(npc, true));
            pointer.on("mouseout", npc.uiSetTarget.bind(npc, false));
            pointer.appendTo(ulEnemy);

        }
        for(i = 0; i < m; i++) {
            npc = yourSide.getMemberByIndex(i);
            pointer = $("<li>" + npc.getName() + "</li>");

            yourSide.addDomPointerReferenceTo(npc.getId(), pointer);


            pointer.on("click", this.onTargetClick.bind(this, npc));
            pointer.on("mouseover", npc.uiSetTarget.bind(npc, true));
            pointer.on("mouseout", npc.uiSetTarget.bind(npc, false));
            pointer.appendTo(ulAlly);
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

            $(li).removeClass("onCooldown");
            if(this.hasCooldown(data.id)){
                $(li).addClass("onCooldown");
            }

            $(li).removeClass("noResource");
            if(!this.hasEnoughResources(data.costs || 0)){
                $(li).addClass("noResource");
            }

            ul.append(li);

            //console.log("yolo", );
            $("li[value=" + data.id + "]").on("click", this.onSkillClick.bind(this, data));
        }

    }

    r.hasEnoughResources = function(costs){
        return this.getMana() >= costs;
    }

    r.addHighlightBuffs = function(){
        var n = this.getYourside().length(), m = this.getOtherside().length();
        var i;
        var entity;
        var self = this;
        /*
         for(i = 0; i < n; i++) {
         entity = this.getYourside().getMemberByIndex(i);
         */
        /*   entity.eachBuff(function(buff){
         if(buff.from.getId() === self.getId()){

         }
         })*/
        /*

         }*/
        $("[data-from=" + this.getId() + "]").addClass("buff-highlight");
    }

    r.removeHighlightBuffs = function(){
        $("[data-from=" + this.getId() + "]").removeClass("buff-highlight");
    }


    return Player;
})();

module.exports = Player;