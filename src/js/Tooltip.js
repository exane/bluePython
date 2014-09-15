var charData = require("../data/premade-chars.js");
var moveData = require("../data/moves.js");

var Tooltip = (function(){
    var Tooltip = function(battle){
        this.battle = battle;
        this.start();

    }
    var r = Tooltip.prototype;

    r.battle = null;
    r.uiTooltip = null;
    r.entity = null;
    r.type = null;
    r.buff = null;

    r.start = function(){
        this.uiTooltip = $(".tooltip");
        this.listener();
    }

    r.listener = function(){
        var self = this;
        //$(".view .sprite .sprite-img-container").hover(this.onMouseover.bind(this), this.onMouseout.bind(this));
        $(".view .sprite .sprite-img-container").on("mouseover", self.onMouseover.bind(self));
        $(".menu-skills li").on("mouseover", self.onMouseoverSkills.bind(self));
        //$(document).on("bp-tooltip-update", this.render.bind(this));
        pubsub.subscribe("/bp/tooltip/update/", this.render.bind(this));
    }

    r.onMouseoverSkills = function(e){

        this.renderSkill(e);
    }

    r.onMouseover = function(e){
        //console.log("in", $(e.target).attr("data-id"));
        var id = $(e.target).attr("data-id");
        var type = $(e.target).attr("data-type");
        var entity;

        if(!id) return 0;
        if(!type) return 0;

        entity = this.battle.getEntityById(id);
        this.entity = entity;
        this.type = type;


        if(type === "buff" || type === "debuff"){
            //data =
            this.buff = $(e.target).attr("data-value");
            //console.log(entity.getBuff($(e.target).attr("data-value")));
        }
        if(type === "entity"){
            //console.log(entity);

        }
        this.render();


    }

    r.render = function(){
        this.uiTooltip.empty();
        if(this.type === "buff" || this.type === "debuff"){
            this.renderBuff();
        }
        else if(this.type === "entity") {
            this.renderEntity();
        }
    }

    r.renderEntity = function(){
        var entity = this.entity;
        this.uiTooltip.load("./tpl/char-tpl.html", function(){
            var uiSelf = $(this);
            var stats = entity.getStats();

            uiSelf.find(".tooltip-icon img").attr("src", entity.getImg());
            //uiSelf.find(".tooltip-desc").text(buff.desc);
            uiSelf.find(".tooltip-name").text(entity.getFullName());
            uiSelf.find(".tooltip-hp").text(entity.getHp() + " / " + entity.getMaxHp() + " | " + entity.getHp(true) + "%");
            uiSelf.find(".tooltip-mana").text(entity.getMana() + " / " + entity.getMaxMana() + " | " + entity.getMana(true) + "%");

            for(var stat in stats){
                uiSelf.find(".tooltip-stats ul").append("<li>"+stat+ ": "+ entity.getAttr(stat)+"</li>");
            }

            uiSelf.find(".tooltip-stats ul").append("<li>Crit chance: "+entity.getCritRate()+"%</li>");
            uiSelf.find(".tooltip-stats ul").append("<li>Crit dmg: "+entity.getCritDmgMultiplicator()*100+"%</li>");

            for(var i=0; i<entity.getAbilities().length; i++){
                uiSelf.find(".tooltip-abilities").append(entity.getAbilities(i) + "; ");
            }
            for(var i=0; i<entity.getSkillList().length; i++){
                uiSelf.find(".tooltip-skills").append(entity.getSkillList(i) + "; ");
            }

        });
    }

    r.renderSkill = function(e){
        var type = $(e.target).attr("data-type");
        var id = $(e.target).attr("value");
        if(!id) return 0;
        var move = moveData[id];



        this.uiTooltip.load("./tpl/skill-tpl.html", function(){
            var self = $(this);
            self.find(".tooltip-icon img").attr("src", move.icon);
            self.find(".tooltip-name").text(move.name);
            self.find(".tooltip-desc").text(move.desc);
        });
    }


    r.renderBuff = function(){
        var buff;
        var self = this;

        if(this.type === "buff"){
            buff = this.entity.getBuff(this.buff);
        }
        if(this.type === "debuff"){
            buff = this.entity.getDebuff(this.buff);
        }

        this.uiTooltip.load("./tpl/buff-tpl.html", function(){
            var uiSelf = $(this);
            var duration = buff.duration < 0 ? null : buff.duration;

            uiSelf.find(".tooltip-icon img").attr("src", buff.icon);
            uiSelf.find(".tooltip-desc").text(buff.desc);
            uiSelf.find(".tooltip-name").text(buff.name);
            uiSelf.find(".tooltip-type").text(self.type);
            if(duration){
                uiSelf.find(".tooltip-duration").text(buff.duration + " turns left.");
            }
            /*
            if(buff.costs){
                uiSelf.find(".tooltip-costs").text(buff.costs + " Mana");
            }
            */
        });
        /*
        $(name).text(buff.name);

        console.log(buff);

        var duration = $("<div></div>");
        duration.text(buff.duration);


        this.uiTooltip.append(name);
        this.uiTooltip.append(duration);
        */
    }


    return Tooltip;
})();

module.exports = Tooltip;