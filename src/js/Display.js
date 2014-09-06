var Display = (function(){

    var Display = function(target, amount, crit){
        this.target = target;
        this.amount = amount;
        this.crit = crit || false;
        this.id = (new Date()).getSeconds() * 1000 + (new Date()).getMilliseconds();

        this.start();
    }
    var r = Display.prototype;

    r.target = null;
    r.amount = null;
    r.crit = null;
    r.id = null;
    r.uiData = null;

    r.getSpriteCenter = function(){
        var sprite = this.target.uiSprite;

        //console.log(sprite, $(sprite).position());

        return {
            x: $(sprite).position().left + $(sprite).width() / 2,
            y: $(sprite).position().top + $(sprite).height() / 2
        }
    }

    r.getAmount = function(){
        if(this.amount > 0) return this.amount;
        return this.amount * -1;
    }

    r.getStyleClass = function(amount){
        var styleClass = amount <= 0 ? "display-dmg" : "display-heal";
        styleClass += this.crit ? " display-crit" : "";

        return styleClass;
    }

    r.start = function(){
        var self = this;
        var coords = this.getSpriteCenter();
        var randomX, randomY;

        randomX = (Math.random() * 30 | 0) - 15;
        randomY = (Math.random() * 30 | 0) - 15;


        $("<div data-id='" + this.id + "' class='display'></div>").appendTo(".display-floating-dmg");
        this.uiData = $("div[data-id=" + this.id + "]");

        this.uiData.addClass(this.getStyleClass(this.amount));
        this.uiData.text(this.getAmount());

        $(this.uiData).css({
            "top": coords.y /*+ this.target.uiSprite.height()/ 2 - 50 */ + randomY + "px",
            "left": coords.x /*+ this.target.uiSprite.width() / 2 */ + randomX + "px"
        });


        this.popOut(this.flyAbove);
        this.flyAbove();


        setTimeout(function(){
            $(self.uiData).remove();
        }, 2000);
    }

    r.popOut = function(next){
        var randomFactor = (Math.random() * 10 | 0) - 20;
        var size = 60 + randomFactor;

        size = this.crit ? size + 30 : size;

        var correction = size / 2;

        $(this.uiData).animate({
            "font-size": "+=" + size,
            "top": "-=" + correction,
            "left": "-=" + correction
        }, {
            duration: 200,
            easing: "linear",
            complete: next
        });
    }

    r.flyAbove = function(){
        $(this.uiData).animate({
            "top": "-=80",
            "opacity": "0.75"
        }, {
            duration: 2000,
            easing: "easeOutCirc"
        })
    }


    return Display;

})();

module.exports = Display;