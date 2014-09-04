var Player = require("./Player.js");
var Enemy = require("./Enemy.js");
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
        this.allies = new BattleSide($(".side-ally"));
        this.enemies = new BattleSide($(".side-enemy"));

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

        this.addNewAlly(data.exane);
        this.addNewEnemy(data.gnomemage);
        this.addNewEnemy(data.chernabog);
        this.addNewEnemy(data.gnomemage);
        this.addNewEnemy(data.gnomemage);


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
        var n = this.allies.length();
        var m = this.enemies.length();

        for(var i = 0; i < n; i++) {
            var member = this.allies.member[i];
            member.decreaseDurationTime();
        }
        for(var i = 0; i < m; i++) {
            var member = this.enemies.member[i];
            member.decreaseDurationTime();
        }
    }

    r.startAi = function(){
        var n = this.enemies.length()
        for(var i = 0; i < n; i++) {
            var enemy = this.enemies.getMemberByIndex(i);
            enemy.startAi();
        }
    }

    r.addNewAlly = function(options){
        var ally = this.player = new Player(options, this.allies, this.enemies, this.uiMenu, this.events);
        this.allies.add(ally);
    }

    r.addNewEnemy = function(options){
        var enemy = new Enemy(options, this.events, this.enemies, this.allies);
        this.checkIfEntityAlreadyExists(enemy, this.enemies);

        this.enemies.add(enemy);
    }

    r.checkIfEntityAlreadyExists = function(entity, side){
        var k = 1;
        var originalName = entity.name;
        var originalId = entity.id;

        for(var i = 0; i < side.length(); i++) {
            var member = side.getMemberByIndex(i);

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
        var n = this.enemies.length();

        ul.text("");

        for(var i = 0; i < n; i++) {
            var enemy = this.enemies.getMemberByIndex(i);
            var pointer = $("<li>" + enemy.name + "</li>");
            var self = this;

            //console.log("enemy", enemy);

            this.enemies.addDomPointerReferenceTo(enemy.id, pointer);

            $(pointer).appendTo(ul);

            $(pointer).on("click", this.player.onTargetClick.bind(this.player, enemy));
        }
    }

    r.listSkills = function(){
        var ul = $(".menu-skills ul");
        var moves = [];
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
        var n = this.allies.length();
        var m = this.enemies.length();
        var k = 0;
        var sum = n + m;
        var self = this;

        var collectData = [];


        $(document).on("bp-battle-chosen", function(e, data){
            k++;
            //console.log(k, "customEvent");
            collectData.push(data.data);

            //console.log(data.data);
            if(k === sum){
                $(document).unbind("bp-battle-chosen");
                self.runEvent(collectData);
            }
        })
    }

    r.runEvent = function(data){
        //calculate stuff and simulate game, then starts next turn

        var n = data.length;
        var self = this;
        this.createTurnorder(data);
        //console.log("runevent...", data);
        //console.log("sorted", data);
        logger.message("Turn: " + this.turn);

        this.checkEventOnTurnBegin(data);

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
        if(i >= n) {
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

    /*
     r.checkEventOnBattleBegin = function(data){
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
     */

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

                logger.message(user.name + " uses " + move.name + " to attack " + target.name);
                logger.message("but there is no target alive...");
                return 0;
            }

            if(move.onAttack){
                move.onAttack.call(user, target);
            }


            dmg = user.calculateDmgTo(move, target);
            logger.message(user.name + " uses " + move.name + " to attack " + target.name);

            target.changeHpBy(-dmg);
            logger.message(target.name + " takes " + dmg + " damage");
        }

        if(move.boost){
            move.boost.call(user);
        }

        if(move.onAfterAttack){
            move.onAfterAttack.call(user);
        }

        //console.log(target);
        if(target && target.fainted){
            logger.message(target.name + " fainted...");
        }
    }

    r.nextTurn = function(){
        if(!this.allies.hasMemberAlive()){
            this.showGameOver("Loss!")
            return 1;
        }
        if(!this.enemies.hasMemberAlive()){
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
})
    ();

module.exports = Battle;