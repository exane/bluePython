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
var Util = require("./Util.js");

"use strict";

var Battle = (function(){
    var Battle = function(){
        this.side1 = new BattleSide($(".side-ally"), "s1", "Team Yolo", this);
        this.side2 = new BattleSide($(".side-enemy"), "s2", "Team Swag", this);

        this.uiMenu = $(".controller");
    }
    var r = Battle.prototype;

    r.allies = null;
    r.enemies = null;
    r.turn = 1;
    r.uiMenu = null;
    r.player = [];
    r.playerOrder = 0;
    r.tooltip = null;

    r._speedMultiplicator = 1;

    r.speed = 1000;

    r.debug = false;


    r.adjustAnimSpeed = function(percentage){ //
        this._speedMultiplicator = percentage / 100;
    }
    r.resetAnimSpeed = function(){
        this._speedMultiplicator = 1;
    }
    r.getAnimSpeedMultiplicator = function(){
        return this._speedMultiplicator;
    }

    r.getPlayerIndexById = function(id){
        var n = this.player.length;
        for(var i = 0; i < n; i++) {
            if(id === this.player[i].getId())
                return i;
        }
        return -1;
    }
    r.removePlayer = function(id){
        this.player.splice(this.getPlayerIndexById(id), 1);
    }

    r.init = function(){

        //this.addNewNpc(data.gnomemage, this.side1, this.side2);
        //this.addNewPlayer(data.exane, this.side1, this.side2);
        /*
         this.addNewPlayer("warrior", "side1", "side2");
         */
        /*
         this.addNewPlayer("priest", "side1", "side2");
         */
        //this.addNewPlayer(data.warrior, this.side1, this.side2);
        //this.addNewNpc(data.gnomemage, this.side1, this.side2);
        //this.addNewNpc(data.gnomemage, this.side1, this.side2);
        //this.addNewNpc(data.chernabog, this.side1, this.side2);
        //this.addNewNpc(data.gnomemage, this.side1, this.side2);

        //this.addNewNpc(data.gnomemage, this.side2, this.side1);
        //this.addNewNpc(data.chernabog, this.side2, this.side1);
        //this.addNewNpc("serpant_boss", "side2", "side1");
        //this.addNewNpc(data.gnomemage, this.side2, this.side1);
        //this.addNewNpc(data.gnomemage, this.side2, this.side1);

        /*
         if(this.player){
         this.listTargets(this.player.getOtherside(), this.player.getYourside());
         this.listSkills();
         }*/

        var self = this;
        this.tooltip = new Tooltip(this);
        setTimeout(function(){
            self.battleStart();
            pubsub.publish("/bp/battle/onBattleStart/");
        }, 100);
    }

    r.battleStart = function(){


        logger.message("Battle started!");

        this.startNewTurn();

    }

    r.startNewTurn = function(){
        $(".controller").show();

        this.decrementDurationTimer(this.side1);
        this.decrementDurationTimer(this.side2);

        logger.line();


        this.observe();

        this.startAi(this.side1);
        this.startAi(this.side2);

        //console.log(this.turnorder);

    }

    r.decrementDurationTimer = function(side){
        var n = side.length();
        var i, member;

        for(i = 0; i < n; i++) {
            member = side.member[i];
            member.decreaseDurationTime();
            member.reduceCooldownTimerBy(1);
        }
    }

    r.startAi = function(side){
        var n = side.length();
        var npc;


        for(var i = 0; i < n; i++) {
            npc = side.getMemberByIndex(i);
            if(npc.ai){
                npc.startAi();
            }
        }
    }

    r.addNewPlayer = function(options, yourSide, otherSide){
        if(typeof options == "string"){
            options = data[options];
        }
        if(typeof yourSide == "string"){
            switch(yourSide) {
                case "top":
                    yourSide = this.side2;
                    otherSide = this.side1;
                    break;
                case "down":
                    yourSide = this.side1;
                    otherSide = this.side2;
                    break;
            }
            //yourSide = this[yourSide];
        }
        if(typeof otherSide == "string"){
         otherSide = this[otherSide];
         }
        //var ally = this.player = new Player(options, yourSide, otherSide, this.uiMenu, this.tooltip);
        var ally = new Player(options, yourSide, otherSide, this.uiMenu, this.tooltip, this.playerOrder++);
        this.checkIfEntityAlreadyExists(ally, yourSide);
        //this.player.push(ally);
        yourSide.add(ally);

        return ally;
    }

    r.addNewNpc = function(options, yourSide, otherSide){
        if(typeof options == "string"){
            options = data[options];
        }
        if(typeof yourSide == "string"){
            /*yourSide = this[yourSide];*/
            switch(yourSide) {
                case "top":
                    yourSide = this.side2;
                    otherSide = this.side1;
                    break;
                case "down":
                    yourSide = this.side1;
                    otherSide = this.side2;
                    break;
            }
        }
        if(typeof otherSide == "string"){
            otherSide = this[otherSide];
        }
        var npc = new Npc(options, yourSide, otherSide/*, this.tooltip*/);
        this.checkIfEntityAlreadyExists(npc, yourSide, otherSide);

        yourSide.add(npc);

        return npc;
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

        data.sort(function(a, b){
            return b.from.getAttr("agi") - a.from.getAttr("agi");
        });

        //handle speed tie
        this.handleSpeedTie(data);

        //handle multiple attacks per turn
        this.handleMultipleAttacksOrder(data);

        //priority check
        data.sort(function(a, b){
            a = moveData[a.do].priority || 0;
            b = moveData[b.do].priority || 0;
            return b - a;
        });


        return data;
    }

    r.handleMultipleAttacksOrder = function(turnorder){
        turnorder.sort(function(a, b){
            var orderA = 1, orderB = 1;

            orderA += a._attackOrder || 0;
            orderB += b._attackOrder || 0;
            return b.from.getAttr("agi") / orderB - a.from.getAttr("agi") / orderA;
        });

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

    r.observe = function(){
        /*
         var n = this.side1.length(true);
         var m = this.side2.length(true);
         */
        var k = 0, i = 0;
        var self = this;

        var collectData = [];
        var observeList = this.getObserveList();


        while(self.player[i] && self.player[i].isFainted()) {
            i++;
        }
        this.handlePlayerEvents(i);


        var handle = pubsub.subscribe("/bp/battle/chosen/", function(data){
            k++;

            if(data._back){

                data.from.setActive(false);
                self.removeFromCollectList(data.from.getId(), collectData);
                data.from.resetAttacksLeft();

                if(i > 0) i--;
                self.removeFromCollectList(self.player[i].getId(), collectData);
                self.player[i].resetAttacksLeft();
                self.handlePlayerEvents(i);
                return;
            }

            if(data.from.isPlayer()) i++;

            self.removeFromObserveList(observeList, data.from.getId());
            collectData.push(data);

            if(!data.from.isPlayer() && data.from.hasMultipleAttacks() && data.from.hasAttacksLeft()){
                data.from.startAi();
            }

            if(data.from.isPlayer() && data.from.hasMultipleAttacks() && data.from.hasAttacksLeft()){
                //data.from.decreaseAttacksLeftBy(1);
                self.handlePlayerEvents(--i);
                return;
            }

            if(data.from.isPlayer() && i < self.player.length){
                while(self.player[i] && self.player[i].isFainted()) {
                    i++;
                }
                self.handlePlayerEvents(i)
            }

            if(!observeList.length){
                pubsub.unsubscribe(handle);
                self.runStartEvent(collectData);
            }
        })
    }

    r.removeFromCollectList = function(id, list){
        var n = list.length;
        for(var i = 0; i < n; i++) {
            if(list[i].from.getId() === id){
                list[i].from.removeFreshCooldown(true);
                list.splice(i, 1);
                return this.removeFromCollectList(id, list);
            }
        }
    }

    r.handlePlayerEvents = function(playerIndex){
        if(!this.player[playerIndex]) return 0;
        this.player[playerIndex].setActive(true);
        this.player[playerIndex].setChosen(false);
        this.player[playerIndex].uiSetActive(true);// = true;
        this.player[playerIndex].resetMenu();
        if(this.player[playerIndex].isFainted()){
            this.player[playerIndex].setChosen(true);
            this.player[playerIndex].ready();
        }
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
            var member = list[i];
            if(member.hasMultipleAttacks()){
                member.resetAttacksLeft();
                for(var k = 0; k < member.getMultipleAttacks(); k++) {
                    res.push(member.getId());
                }
                continue;
            }
            res.push(member.getId());
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

    r.runEvent = function(i, n, data, k, multiple){
        var t;

        if(i >= n){
            this.checkEventOnTurnEnd(data);
            this.nextTurn();
            return 0;
        }
        k = k || 0;
        multiple = multiple || 0;

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
                }, this.speed * this.getAnimSpeedMultiplicator());
                return -1;
            }
        }


        if(move.isAoe && move.target === "friendly" && k < user.getYourside().length()){
            setTimeout(function(){
                self.calculateTurnOf(user, user.getYourside().member[k], move);
                k++;
                self.runEvent(i, n, data, k, multiple);
            }, 250 * this.getAnimSpeedMultiplicator());
            return;
        }

        if(move.isAoe && move.target === "enemy" && k < user.getOtherside().length()){
            setTimeout(function(){
                self.calculateTurnOf(user, user.getOtherside().member[k], move);
                k++;
                self.runEvent(i, n, data, k, multiple);
            }, 250 * this.getAnimSpeedMultiplicator());
            return;
        }

        if(move.target === "self"){
            target = user;
        }

        if(!move.isAoe){
            this.calculateTurnOf(user, target, move);
        }

        if(move.multiple && multiple < move.multiple - 1){
            setTimeout(function(){
                $(user.uiSprite).removeClass("entity-active");
                multiple++;
                self.runEvent(i, n, data, 0, multiple);
            }, this.speed / 6 * this.getAnimSpeedMultiplicator());

            return;
        }

        setTimeout(function(){
            $(user.uiSprite).removeClass("entity-active");
            self.runEvent(++i, n, data);
        }, this.speed * this.getAnimSpeedMultiplicator());


    }

    r.checkEventOnTurnBegin = function(data){
        var n = data.length;


        for(var i = 0; i < n; i++) {
            var move = moveData[data[i].do] || {};
            var self = data[i].from;

            //skills
            if(move.onTurnBegin){
                move.onTurnBegin.call(self);
            }


        }
        //$.event.trigger("bp-ability-onTurnBegin");
        pubsub.publish("/bp/battle/onTurnBegin/");
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
/*
    r.isHit = function(user, target, move){
        var rnd = Math.random()*100 | 0;
        var accuracy = typeof move.accuracy === "undefined" ? 100 : move.accuracy;

        accuracy -= target.getEvadeChance();
        accuracy += user.getHitChance();

        if(rnd < accuracy) {
            return true;
        }

        return false;
    }*/

    r.calculateTurnOf = function(user, target, move){
        var critChance = user.calculateCritChance(target, move);
        var wasFainted = target ? target.isFainted() : false; //target.isFainted() || null;
        var isCrit = (move.isCrit == null || typeof move.isCrit == "undefined")
        ? user.calculateCrit(critChance)
        : move.isCrit;
        var isTargetLocked = move.isAoe || false;
        var originalTarget = target;
        var isHit = target.isHit(user, move);

        var opt = {
            target: target,
            yourSide: user.getYourside(),
            otherSide: user.getOtherside(),
            isCrit: isCrit,
            isHit: isHit
        }
        var dmg;

        if(user.isFrozen()){ //stun
            return;
        }

        if(move.onBeforeAttack){
            move.onBeforeAttack.call(user, opt);
        }


        $.when(pubsub.publish("/bp/battle/onBeforeAttack/" + user.getId(), [opt]))
        .then((function(){
            if(isTargetLocked){
                opt.target = originalTarget;
            }
            if(!isHit){ // attack missed
                opt.target.evade();
                return;
            }
            if(move.onCast){
                move.onCast.call(user, opt);
            }
            if(move.basePower){

                if(move.onAttack){
                    move.onAttack.call(user, opt);
                }

                dmg = this.calculateDmg(user, opt.target, move, opt);
                opt.target.changeHpBy(-dmg, opt.isCrit);

                $.when(pubsub.publish("/bp/battle/onGetHit/" + opt.target.getId(), [dmg]))
                .then(pubsub.publish("/bp/battle/onHit/" + user.getId(), [dmg, opt]))
                .then(pubsub.publish("/bp/battle/onAfterGetAttack/" + opt.target.getId(), [opt]));

                /*
                 $.when(pubsub.publish("/bp/battle/onAfterGetAttack/" + opt.target.getId(), [opt]))
                 .done((function(){

                 }).bind(this));*/
            }

        }).bind(this))
        .then(function(){
            if(!isHit){
                //attack missed
            }
            if(isTargetLocked){
                opt.target = originalTarget;
            }

            if(move.onAfterAttack){
                move.onAfterAttack.call(user, opt, [dmg]);
            }

            if(opt.target && opt.target.isFainted() && !wasFainted){
                //$.event.trigger("bp-ability-onFaint", opt);
                $.when(pubsub.publish("/bp/battle/onFaint/", [opt]))
                .then(logger.message(opt.target.getFullName() + " fainted..."));
            }
        }.bind(this));

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
        $.when(pubsub.publish("/bp/battle/nextTurn/"))
        .then(function(){
            for(var i = 0; i < this.player.length; i++) {
                this.player[i].resetMenu();
            }
            this.startNewTurn();
        }.bind(this));

        //if(this.player){
        //    this.player.resetMenu();
        //}
        /*for(var i = 0; i < this.player.length; i++) {
         this.player[i].resetMenu();
         }
         this.startNewTurn();*/

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