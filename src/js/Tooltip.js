

var Tooltip = (function(){
    var Tooltip = function(battle){
        this.battle = battle;
        //this.start();

    }
    var r = Tooltip.prototype;

    r.battle = null;
    r.uiTooltip = null;

    r.start = function(){
        this.uiTooltip = $(".tooltip");
        this.listener();
    }

    r.listener = function(){
        var self = this;
        $(".view .sprite .sprite-img-container").hover(this.onMouseover.bind(this), this.onMouseout.bind(this));
    }

    r.onMouseover = function(e){
        //console.log("in", $(e.target).attr("data-id"));
        var id = $(e.target).attr("data-id");
        var entity = this.battle.getEntityById(id);

        console.log(entity);


    }
    r.onMouseout= function(e){
        //console.log("out", e);

    }


    return Tooltip;
})();

module.exports = Tooltip;