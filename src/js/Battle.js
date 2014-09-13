$ = require("jquery");
require("jquery-ui");

var Player = require("./Player.js");
var Npc = require("./Npc.js");
var BattleSide = require("./BattleSide.js");
var data = require("../data/premade-chars.js");
var moveData = require("../data/moves.js");
var abilityData = require("../data/abilities.js");
var logger = require("./log.js");
var Display = require("./Display.js");
var Tooltip = require("./Tooltip.js");

"use strict";

var Battle = (function(){
    var Battle = function(){
        this.side1 = new BattleSide($(".side-ally"), "s1", "Team Yolo");
        this.side2 = new BattleSide($(".side-enemy"), "s2", "Team Swag");

        this.uiMenu = $(".controller");
    }
    var r = Battle.prototype;

    r.allies = null;
    r.enemies = null;
    //r.turnorderIndex = 0;
    r.turn = 1;
    r.uiMenu = null;
    r.player = null;
    //r.events = {};
    r.tooltip = null;

    r.speed = 1000;

    r.debug = false;
    r.debugSkipGameover = false; //doesnt work yet / buggy


    r.init = function(){

        //this.addNewNpc(data.gnomemage, this.side1, this.side2);
        //this.addNewPlayer(data.exane, this.side1, this.side2);
        this.addNewPlayer(data.exane, this.side1, this.side2);
        this.addNewNpc(data.gnomemage, this.side1, this.side2);
        //this.addNewNpc(data.gnomemage, this.side1, this.side2);
        //this.addNewNpc(data.chernabog, this.side1, this.side2);
        //this.addNewNpc(data.gnomemage, this.side1, this.side2);

        this.addNewNpc(data.gnomemage, this.side2, this.side1);
        this.addNewNpc(data.chernabog, this.side2, this.side1);
        this.addNewNpc(data.gnomemage, this.side2, this.side1);
        this.addNewNpc(data.gnomemage, this.side2, this.side1);


        if(this.player){
            this.listTargets(this.player.getOtherside(), this.player.getYourside());
            this.listSkills();
        }

        var self = this;
        this.tooltip = new Tooltip(this);
        setTimeout(function(){
            self.battleStart();
        }, 100);
        //this.battleStart();
    }

    r.battleStart = function(){


        logger.message("Battle started!");

        this.startNewTurn();

    }

    r.startNewTurn = function(){
        $(".controller").show();

        this.decrementDurationTimer();

        logger.line();


        this.observe();

        this.startAi();

        //console.log(this.turnorder);

    }

    r.decrementDurationTimer = function(){
        var n = this.side1.length();
        var m = this.side2.length();
        var i, member;

        for(i = 0; i < n; i++) {
            member = this.side1.member[i];
            member.decreaseDurationTime();
        }
        for(i = 0; i < m; i++) {
            member = this.side2.member[i];
            member.decreaseDurationTime();
        }
    }

    r.startAi = function(){
        var n = this.side2.length();
        var m = this.side1.length();
        var npc;


        for(var i = 0; i < n; i++) {
            npc = this.side2.getMemberByIndex(i);
            if(npc.ai){
                npc.startAi();
            }
        }
        for(var j = 0; j < m; j++) {
            npc = this.side1.getMemberByIndex(j);
            if(npc.ai){
                npc.startAi();
            }
        }
    }

    r.addNewPlayer = function(options, yourSide, otherSide){
        var ally = this.player = new Player(options, yourSide, otherSide, this.uiMenu, this.tooltip);
        this.checkIfEntityAlreadyExists(ally, yourSide);
        yourSide.add(ally);
    }

    r.addNewNpc = function(options, yourSide, otherSide){
        var npc = new Npc(options, yourSide, otherSide, this.tooltip);
        this.checkIfEntityAlreadyExists(npc, yourSide, otherSide);

        yourSide.add(npc);
    }

    r.checkIfEntityAlreadyExists = function(entity, yourSide){
        var k = 1;
        var originalName = entity.getName();
        var originalId = entity.getId();
        var member;


        for(var i = 0; i < yourSide.length(); i++) {
            member = yourSide.getMemberByIndex(i);

            if(entity.getName() === member.getName()){
                k++;
                //entity.name = originalName + " " + k;
                entity.setName(originalName + " " + k);
                //entity.id = originalId + k;
                entity.setId(originalId + k);
            }
        }

    }

    r.createTurnorder = function(data){
        //var move = moveData[data[i].do];


        data.sort(function(a, b){
            return b.from.getAttr("agi") - a.from.getAttr("agi");
        });

        //handle speed tie
        this.handleSpeedTie(data);

        //priority check
        data.sort(function(a, b){
            a = moveData[a.do].priority || 0;
            b = moveData[b.do].priority || 0;
            return b - a;
        });


        return data;
    }

    r.handleSpeedTie = function(turnorder){
        //console.log(turnorder);
        var originalTurnorder = turnorder.slice(0); //lazy array copy

        for(var i = 0; i < turnorder.length; i++) {
            var agi = turnorder[i].from.getAttr("agi");
            var k = i;
            var tmp = [];

            while(turnorder[k] && agi === turnorder[k].from.getAttr("agi")) {
                k++;
                tmp.push({
                    rank: Math.random() * 100,
                    id: k - 1
                });
            }

            //sort here
            tmp.sort(function(a, b){
                return b.rank - a.rank;
            });

            //merge
            for(var j = 0; j < tmp.length; j++) {
                var index = i + j;
                turnorder[index] = originalTurnorder[tmp[j].id];
            }


            i = k - 1;
        }
    }

    r.listTargets = function(otherSide, yourSide){
        if(!this.player) return 0;
        var ulEnemy = this.uiMenu.children(".menu-target-enemy").find("ul");
        var ulAlly = this.uiMenu.children(".menu-target-ally").find("ul");
        var npc, pointer, i;
        //var n = this.side2.length();
        var n = otherSide.length();
        var m = yourSide.length();

        ulEnemy.text("");
        ulAlly.text("");
        for(i = 0; i < n; i++) {
            //var npc = this.side2.getMemberByIndex(i);
            npc = otherSide.getMemberByIndex(i);
            pointer = $("<li>" + npc.getName() + "</li>");

            //console.log("npc", npc);

            //this.side2.addDomPointerReferenceTo(npc.id, pointer);
            otherSide.addDomPointerReferenceTo(npc.getId(), pointer);

            $(pointer).appendTo(ulEnemy);

            $(pointer).on("click", this.player.onTargetClick.bind(this.player, npc));
        }
        for(i = 0; i < m; i++) {

            npc = yourSide.getMemberByIndex(i);
            pointer = $("<li>" + npc.getName() + "</li>");

            //console.log("npc", npc);

            //this.side2.addDomPointerReferenceTo(npc.id, pointer);
            yourSide.addDomPointerReferenceTo(npc.getId(), pointer);

            $(pointer).appendTo(ulAlly);

            $(pointer).on("click", this.player.onTargetClick.bind(this.player, npc));
        }
    }

    r.listSkills = function(){
        if(!this.player) return 0;
        var ul = $(".menu-skills ul");
        var n = this.player.getSkillList().length;

        for(var i = 0; i < n; i++) {
            //moves.push(moveData[this.player.skillList[i]].name);
            var data = moveData[this.player.getSkillList(i)];
            var li = "<li value='" + data.id + "'>" + data.name + "</li>";
            ul.append(li);

            //console.log("yolo", );
            $("li[value=" + data.id + "]").on("click", this.player.onSkillClick.bind(this.player, data));
        }

    }

    r.observe = function(){
        var n = this.side1.length(true);
        var m = this.side2.length(true);
        var k = 0;
        var self = this;

        var collectData = [];
        var observeList = this.getObserveList();


        /*
        $(document).on("bp-battle-chosen", function(e, data){
            k++;

            self.removeFromObserveList(observeList, data.data.from.getId());
            collectData.push(data.data);

            if(!observeList.length){
                $(document).unbind("bp-battle-chosen");
                self.runStartEvent(collectData);
            }
        })
        */
        var handle = pubsub.subscribe("/bp/battle/chosen/", function(data){
            k++;

            self.removeFromObserveList(observeList, data.from.getId());
            collectData.push(data);

            if(!observeList.length){
                //$(document).unbind("bp-battle-chosen");
                pubsub.unsubscribe(handle);
                self.runStartEvent(collectData);
            }
        })
    }

    r.removeFromObserveList = function(list, id){
        for(var i = 0; i < list.length; i++) {
            if(list[i] === id){
                list.splice(i, 1);
                return 0;
            }
        }
    }

    r.getObserveList = function(){
        var list;
        var res = [];
        var a, b;

        a = this.side1.getAllAliveMembers();
        b = this.side2.getAllAliveMembers();

        list = a.concat(b);

        for(var i = 0; i < list.length; i++) {
            res.push(list[i].getId());
        }

        return res;
    }

    r.runStartEvent = function(data){
        //calculate stuff and simulate game, then starts next turn

        var n = data.length;
        logger.message("Turn: " + this.turn);


        this.checkEventOnTurnBegin(data);
        this.createTurnorder(data);

        $(".controller").hide();
        this.runEvent(0, n, data);


    }

    r.runEvent = function(i, n, data, k){
        if(i >= n){
            this.checkEventOnTurnEnd(data);
            this.nextTurn();
            return 0;
        }
        k = k || 0;

        var move = moveData[data[i].do];
        var user = data[i].from;
        var target = data[i].target || null;
        var self = this;
        move.target = move.target || "enemy";


        if(user.isFainted()){
            self.runEvent(++i, n, data);
            return 0;
        }
        //marks user as active
        $(user.uiSprite).addClass("entity-active");

        if(typeof move.costs != "undefined" && !k){
            var costs, usable;

            costs = move.costs;

            if(typeof move.costs == "function"){
                costs = move.costs.call(user);
            }

            usable = user.changeManaBy(-costs);
            if(usable === false){
                logger.message(user.getFullName() + " has not enough Mana!");

                setTimeout(function(){
                    $(user.uiSprite).removeClass("entity-active");
                    self.runEvent(++i, n, data);
                }, this.speed);
                return -1;
            }
        }


        if(move.isAoe && move.target === "friendly" && k < user.getYourside().length()){
            setTimeout(function(){
                self.calculateTurnOf(user, user.getYourside().member[k], move);
                k++;
                self.runEvent(i, n, data, k);
            }, 250);
            return;
        }

        if(move.isAoe  && move.target === "enemy" && k < user.getOtherside().length()){
            setTimeout(function(){
                self.calculateTurnOf(user, user.getOtherside().member[k], move);
                k++;
                self.runEvent(i, n, data, k);
            }, 250);
            return;
        }

        if(!move.isAoe) {
            this.calculateTurnOf(user, target, move);
        }


        setTimeout(function(){
            $(user.uiSprite).removeClass("entity-active");
            self.runEvent(++i, n, data);
        }, this.speed);


    }

    r.checkEventOnTurnEnd = function(data){
        var n = data.length;

        for(var i = 0; i < n; i++) {
            var move = moveData[data[i].do];
            var self = data[i].from;

            //skills
            if(move.onTurnEnd){
                move.onTurnEnd.call(self);
            }

        }
        //$.event.trigger("bp-ability-onTurnEnd");
        pubsub.publish("/bp/battle/onTurnEnd/");
    }

    r.checkEventOnTurnBegin = function(data){
        var n = data.length;


        for(var i = 0; i < n; i++) {
            var move = moveData[data[i].do];
            var self = data[i].from;

            //skills
            if(move.onTurnBegin){
                move.onTurnBegin.call(self);
            }


        }
        //$.event.trigger("bp-ability-onTurnBegin");
        pubsub.publish("/bp/battle/onTurnBegin/");
    }

    r.calculateTurnOf = function(user, target, move){
        var critChance = user.calculateCritChance(target, move);
        var wasFainted = target ? target.isFainted() : false; //target.isFainted() || null;
        var isCrit = (move.isCrit == null || typeof move.isCrit == "undefined")
            ? user.calculateCrit(critChance)
            : move.isCrit;

        var opt = {
            target: target,
            yourSide: user.getYourside(),
            otherSide: user.getOtherside(),
            isCrit: isCrit
        }
        var dmg = this.calculateDmg(user, target, move, opt);

        if(move.onBeforeAttack){
            move.onBeforeAttack.call(user, opt);
        }


        if(move.onCast){
            move.onCast.call(user, opt);
        }

        if(move.basePower){
            if(move.onAttack){
                move.onAttack.call(user, opt);
            }
            target.changeHpBy(-dmg, opt.isCrit);
            pubsub.publish("/bp/battle/onGetHit/" + target.getId());
            pubsub.publish("/bp/battle/onHit/" + user.getId());
        }

        //if(move.boost){ //deprecated!
        //    move.boost.call(user, opt);
        //}

        if(move.onAfterAttack){
            move.onAfterAttack.call(user, opt);
        }


        //console.log(target);
        if(target && target.isFainted() && !wasFainted){
            //$.event.trigger("bp-ability-onFaint", opt);
            pubsub.publish("/bp/battle/onFaint/", [opt]);
            logger.message(target.getFullName() + " fainted...");
        }
    }

    r.calculateDmg = function(user, target, move, opt){
        var dmg;
        if(!target || move.target == "friendly") return 0;
        if(target.isFainted()){

            logger.message(user.getFullName() + " uses " + move.name + " to attack " + target.getFullName());
            logger.message("but there is no target alive...");
            return 0;
        }


        dmg = user.calculateDmgTo(move, target, opt);
        logger.message(user.getFullName() + " uses " + move.name + " to attack " + target.getFullName());

        //target.changeHpBy(-dmg, opt.isCrit);
        logger.message(target.getFullName() + " takes " + dmg + " damage!" + (move.isCrit ? " (crit)" : ""));
        return dmg;
    }

    r.nextTurn = function(){
        if(!this.side1.hasMemberAlive()){
            this.showGameOver(this.side2.sideName + " won!");
            return 1;
        }
        if(!this.side2.hasMemberAlive()){
            //this.showGameOver("Won!")
            this.showGameOver(this.side1.sideName + " won!");
            return -1;
        }

        this.turn++;
        //$.event.trigger("bp-battle-nextTurn");
        pubsub.publish("/bp/battle/nextTurn/");
        if(this.player){
            this.player.resetMenu();
        }
        this.startNewTurn();

    }

    r.showGameOver = function(message){
        var div = $(".gameover");
        div.show();
        div.text(message);
    }

    r.getEntityById = function(id){
        var s1 = this.side1.getMemberById(id);
        var s2 = this.side2.getMemberById(id);

        if(s1){
            return s1;
        }
        if(s2){
            return s2;
        }

        return null;
    }


    return Battle;
})();

module.exports = Battle;