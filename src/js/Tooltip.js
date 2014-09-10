var Tooltip = (function(){
    var Tooltip = function(battle){
        this.battle = battle;
        //this.start();

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
        //$(".view .sprite .sprite-img-container").on("mouseout", this.onMouseover.bind(this));
        $(document).on("bp-tooltip-update", this.render.bind(this));
    }

    r.onMouseover = function(e){
        //console.log("in", $(e.target).attr("data-id"));
        var id = $(e.target).attr("data-id");
        var type = $(e.target).attr("data-type");
        var entity;

        if(!id) return 0;

        entity = this.battle.getEntityById(id);
        this.entity = entity;
        this.type = type;

        if(type === "entity"){
            //console.log(entity);

        }
        else if(type === "buff"){
            //data =
            this.buff = $(e.target).attr("data-value");
            //console.log(entity.getBuff($(e.target).attr("data-value")));
        }


        this.render();
    }

    r.render = function(){
        this.uiTooltip.empty();
        if(this.type === "buff"){

            this.renderBuff();
        }
    }

    r.renderEntity = function(){

    }

    r.renderBuff = function(){
        var buff = this.entity.getBuff(this.buff);
        var name = $("<div></div>");
        $(name).text(buff.name);

        var duration = $("<div></div>");
        duration.text(buff.duration);


        this.uiTooltip.append(name);
        this.uiTooltip.append(duration);
    }


    return Tooltip;
})();

module.exports = Tooltip;