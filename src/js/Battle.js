var Player = require("./Player.js");
var Npc = require("./Npc.js");
var BattleSide = require("./BattleSide.js");
var data = require("../data/premade-chars.js");
var moveData = require("../data/moves.js");
var abilityData = require("../data/abilities.js");
var logger = require("./log.js");

"use strict";

/*
 phase 1 = choose menu
 phase 2 = choose target
 phase 3 = wait until every "member" has chosen
 */

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

    r.debug = false;


    r.init = function(){

        this.addNewNpc(data.gnomemage, this.side1, this.side2);
        this.addNewPlayer(data.exane, this.side1, this.side2);
        this.addNewNpc(data.gnomemage, this.side1, this.side2);
        this.addNewNpc(data.chernabog, this.side1, this.side2);

        this.addNewNpc(data.gnomemage, this.side2, this.side1);
        this.addNewNpc(data.chernabog, this.side2, this.side1);
        this.addNewNpc(data.gnomemage, this.side2, this.side1);
        this.addNewNpc(data.gnomemage, this.side2, this.side1);


        this.listTargets();
        this.listSkills();

        this.battleStart();
    }

    r.battleStart = function(){

        logger.message("Battle started!");

        this.startNewTurn();

    }

    r.startNewTurn = function(){
        $(".controller").show();

        logger.line();

        this.decrementDurationTimer();

        this.observe();

        this.startAi();

        //console.log(this.turnorder);

    }

    r.decrementDurationTimer = function(){
        var n = this.side1.length();
        var m = this.side2.length();

        for(var i = 0; i < n; i++) {
            var member = this.side1.member[i];
            member.decreaseDurationTime();
        }
        for(var i = 0; i < m; i++) {
            var member = this.side2.member[i];
            member.decreaseDurationTime();
        }
    }

    r.startAi = function(){
        var n = this.side2.length();
        var m = this.side1.length();
        var npc;


        for(var i = 0; i < n; i++) {
            npc = this.side2.getMemberByIndex(i);
            if (npc.ai){
                npc.startAi();
            }
        }
        for(var j = 0; j < m; j++) {
            npc = this.side1.getMemberByIndex(j);
            if (npc.ai){
                npc.startAi();
            }
        }
    }

    r.addNewPlayer = function(options, yourSide, otherSide){
        var ally = this.player = new Player(options, yourSide, otherSide, this.uiMenu);
        yourSide.add(ally);
    }

    r.addNewNpc = function(options, yourSide, otherSide){
        var npc = new Npc(options, yourSide, otherSide);
        this.checkIfEntityAlreadyExists(npc, yourSide, otherSide);

        yourSide.add(npc);
    }

    r.checkIfEntityAlreadyExists = function(entity, yourSide){
        var k = 1;
        var originalName = entity.name;
        var originalId = entity.id;
        var member;



        for(var i = 0; i < yourSide.length(); i++) {
            member = yourSide.getMemberByIndex(i);

            if(entity.name === member.name){
                k++;
                entity.name = originalName + " " + k;
                entity.id = originalId + k;
            }
        }

    }

    r.createTurnorder = function(data){
        //var move = moveData[data[i].do];


        data.sort(function(a, b){
            return b.from.getAgi() - a.from.getAgi();
        });

        console.log(data);

        //priority check
        //console.log(data);
        data.sort(function(a, b){
            a = moveData[a.do].priority || 0;
            b = moveData[b.do].priority || 0;

            return b - a;
        });


        return data;
    }

    r.listTargets = function(){
        var ul = this.uiMenu.children(".menu-target").find("ul");
        var n = this.side2.length();

        ul.text("");

        for(var i = 0; i < n; i++) {
            var npc = this.side2.getMemberByIndex(i);
            var pointer = $("<li>" + npc.name + "</li>");

            //console.log("npc", npc);

            this.side2.addDomPointerReferenceTo(npc.id, pointer);

            $(pointer).appendTo(ul);

            $(pointer).on("click", this.player.onTargetClick.bind(this.player, npc));
        }
    }

    r.listSkills = function(){
        var ul = $(".menu-skills ul");
        var n = this.player.skillList.length;

        for(var i = 0; i < n; i++) {
            //moves.push(moveData[this.player.skillList[i]].name);
            var data = moveData[this.player.skillList[i]];
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
        var sum = n + m;
        var self = this;

        var collectData = [];
        var observeList = this.getObserveList();


        $(document).on("bp-battle-chosen", function(e, data){
            k++;

            self.removeFromObserveList(observeList, data.data.from.id);
            //console.log(observeList, data.data);


            collectData.push(data.data);


            //if(k === sum){
            if(!observeList.length){
                $(document).unbind("bp-battle-chosen");
                self.runEvent(collectData);
            }
        })
    }

    r.removeFromObserveList = function(list, id){
        for(var i=0; i< list.length; i++){
            if(list[i] === id){
                list.splice(i, 1);
                return 0;
            }
        }
    }

    r.getObserveList = function(){
        var list = [];
        var res = [];
        var a, b;

        a = this.side1.getAllAliveMembers();
        b = this.side2.getAllAliveMembers();

        list = a.concat(b);

        for(var i=0; i<list.length; i++){
            res.push(list[i].id);
        }

        return res;
    }

    r.runEvent = function(data){
        //calculate stuff and simulate game, then starts next turn

        var n = data.length;
        logger.message("Turn: " + this.turn);


        this.checkEventOnTurnBegin(data);
        this.createTurnorder(data);



        if(this.debug){

            for(var i = 0; i < n; i++) {


                var move = moveData[data[i].do];
                var user = data[i].from;
                var target = data[i].target || null;

                if(user.fainted){
                    continue;
                }

                this.calculateTurnOf(user, target, move);

            }

            this.checkEventOnTurnEnd(data);
            this.nextTurn();
        }
        else {
            $(".controller").hide();
            this.runEventSlow(0, n, data);
        }


    }

    r.runEventSlow = function(i, n, data){
        if(i >= n){
            this.checkEventOnTurnEnd(data);
            this.nextTurn();
            return 0;
        }

        var move = moveData[data[i].do];
        var user = data[i].from;
        var target = data[i].target || null;
        var self = this;

        if(user.fainted){
            self.runEventSlow(++i, n, data);
            return 0;
        }
        this.calculateTurnOf(user, target, move);


        setTimeout(function(){
            self.runEventSlow(++i, n, data);
        }, 1000);


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

            //abilities
            for(var k = 0; k < data[i].from.abilities.length; k++) {
                var ability = abilityData[data[i].from.abilities[k]];
                //var self = data[i].from;

                if(ability.onTurnEnd){
                    ability.onTurnEnd.call(self);
                }
            }


        }
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
            //console.log("yoyo",data[i].from.abilities.length);

            //abilities
            for(var k = 0; k < data[i].from.abilities.length; k++) {
                var ability = abilityData[data[i].from.abilities[k]];
                //var self = data[i].from;

                if(ability.onTurnBegin){
                    ability.onTurnBegin.call(self);
                }
            }


        }
    }

    r.calculateTurnOf = function(user, target, move){
        var dmg = 0;

        if(move.onBeforeAttack){
            move.onBeforeAttack.call(user);
        }

        if(move.onCast){
            move.onCast.call(user, target);
        }

        if(move.basePower){
            if(target.fainted){

                logger.message(user.getFullName() + " uses " + move.name + " to attack " + target.getFullName());
                logger.message("but there is no target alive...");
                return 0;
            }

            if(move.onAttack){
                move.onAttack.call(user, target);
            }


            dmg = user.calculateDmgTo(move, target);
            logger.message(user.getFullName() + " uses " + move.name + " to attack " + target.getFullName());

            target.changeHpBy(-dmg);
            logger.message(target.getFullName() + " takes " + dmg + " damage");
        }

        if(move.boost){
            move.boost.call(user);
        }

        if(move.onAfterAttack){
            move.onAfterAttack.call(user);
        }

        //console.log(target);
        if(target && target.fainted){
            logger.message(target.getFullName() + " fainted...");
        }
    }

    r.nextTurn = function(){
        if(!this.side1.hasMemberAlive()){
            this.showGameOver("Loss!")
            return 1;
        }
        if(!this.side2.hasMemberAlive()){
            this.showGameOver("Won!")
            return -1;
        }

        this.turn++;
        $.event.trigger("bp-battle-nextTurn");
        this.player.resetMenu();
        this.startNewTurn();

    }

    r.showGameOver = function(message){
        var div = $(".gameover");
        div.show();
        div.text(message);
    }


    return Battle;
})();

module.exports = Battle;