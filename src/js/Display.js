var Display = (function(){

    var Display = function(options){
        this.target = options.target || null;
        this.amount = options.amount;
        this.crit = options.isCrit || false;

        this.buffName = options.buffName || null;
        this.buffStats = options.buffStats || null;
        this.buffDuration = options.buffDuration || null;

        this.id = (new Date()).getSeconds() * 1000 + (new Date()).getMilliseconds();

        if(!this.target){
            throw new Error("target property must be defined!!!"); // !!! 
        }

        if(typeof this.amount == "undefined"){
            this.amount = null;
        }

        if(this.amount != null){
            this.start("number");
        }
        if(this.buffName){
            this.start("buff");
        }
    }
    var r = Display.prototype;

    r.target = null;
    r.amount = null;
    r.crit = null;
    r.id = null;
    r.uiData = null;
    r.displayDuration = 1000;

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

    r.getStyleClass = function(type){
        var styleClass;

        if(typeof type == "string" && type === "buff"){
            styleClass = "display-buff";
        }
        else if(typeof type == "number"){
            var amount = type;

            styleClass = amount <= 0 ? "display-dmg" : "display-heal";
            styleClass += this.crit ? " display-crit" : "";
        }
        else {
            styleClass = "";
        }

        return styleClass;
    }

    r.start = function(type){
        var self = this;
        var coords = this.getSpriteCenter();
        var randomX, randomY;
        var spriteContainer = this.target.uiSprite.parent();

        //console.log(spriteContainer);

        randomX = (Math.random() * 30 | 0) - 15;
        randomY = (Math.random() * 30 | 0) - 15;


        $("<div data-id='" + this.id + "' class='display'></div>").appendTo(spriteContainer);
        this.uiData = $("div[data-id=" + this.id + "]");

        this.uiData.addClass("display-floating-dmg");


        $(this.uiData).css({
            "top": coords.y - this.uiData.height()/ 2 + randomY + "px",
            "left": coords.x - this.uiData.width()/ 2 + randomX + "px"
        });

        if(type === "buff"){
            this.uiData.addClass(this.getStyleClass("buff"));
            this.uiData.text(this.buffName + " buff");
            this.popOut();
        }
        if(type === "number"){
            this.uiData.addClass(this.getStyleClass(this.amount));
            this.uiData.text(this.getAmount());
            this.popOut(this.flyAbove);
        }



        setTimeout(function(){
            $(self.uiData).remove();
        }, this.displayDuration);
    }

    r.popOut = function(next){
        var randomFactor = (Math.random() * 10 | 0) - 20;
        var size = 50 + randomFactor;
        var self = this;
        next = next || function(){};

        size = this.crit ? size + 20 : size;

        var correction = size / 2;

        $(this.uiData).animate({
            "font-size": "+=" + size,
            "top": "-=" + correction,
            "left": "-=" + correction
        }, {
            duration: 200,
            easing: "linear",
            complete: next.bind(self)
        });
    }

    r.flyAbove = function(){
        $(this.uiData).animate({
            "top": "-=20",
            "opacity": "0.75"
        }, {
            duration: this.displayDuration,
            easing: "easeOutCirc"
        })
    }


    return Display;

})();

module.exports = Display;