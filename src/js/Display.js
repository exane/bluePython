var Display = (function(){

    var type = {
        MANA_GAIN: 0x1,
        MANA_DRAIN: 0x2,
        DAMAGE: 0x4,
        HEAL: 0x8,
        BUFF: 0x10,
        DEBUFF: 0x20,
        CRIT: 0x40,
        MISS: 0x80
    }

    var Display = function(options){
        if(this instanceof Display){
            this.target = options.target || null;
            this.amount = options.amount;
            this.crit = options.isCrit || false;
            this.isMana = options.isMana || false;
            this.isDmg = options.amount < 0;

            this.setTypeFlag(options);

            this.buffName = options.buffName || null;
            this.buffStats = options.buffStats || null;
            this.buffDuration = options.buffDuration || null;

            this.isMiss = options.miss || null;

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
            if(this.isMiss){
                this.start("miss");
            }
        }
        else
            return new Display(options);
    }
    var r = Display.prototype;

    r.target = null;
    r.amount = null;
    r.crit = null;
    r.id = null;
    r.uiData = null;
    r.displayDuration = 1000;
    r.isMiss = null;
    r.isMana = null;
    r.isDmg = null;
    r.typeFlag = 0x0;

    r.getSpriteCenter = function(){
        var sprite = this.target.uiSprite;

        //console.log(sprite, $(sprite).position());

        return {
            x: $(sprite).position().left + $(sprite).width() / 2,
            y: $(sprite).position().top + $(sprite).height() / 2
        }
    }

    r.setTypeFlag = function(opt){
        /*
        DEBUFF: 0x20,
        */
        if(opt.buffName){
            this.typeFlag |= type.BUFF;
        }

        if(opt.isCrit){
            this.typeFlag |= type.CRIT;
        }

        if(opt.miss){
            this.typeFlag |= type.MISS;
        }

        if(opt.amount > 0) {
            if(opt.isMana){
                this.typeFlag |= type.MANA_GAIN;
            }
            else {
                this.typeFlag |= type.HEAL;
            }
        }
        else {
            if(opt.isMana){
                this.typeFlag |= type.MANA_DRAIN;
            }
            else {
                this.typeFlag |= type.DAMAGE;
            }
        }
    }

    r.getAmount = function(){
        if(this.typeFlag & (type.MANA_DRAIN | type.MANA_GAIN | type.HEAL)) return this.amount;
        return this.amount * -1;
    }

    r.getStyleClass = function(type){
        var styleClass;

        if(typeof type == "string" && type === "buff"){
            styleClass = "display-buff";
        }
        else if(typeof type == "number"){
            var amount = type;
            if(this.isMana){
                styleClass = "display-mana";
            }
            else {
                styleClass = amount <= 0 ? "display-dmg" : "display-heal";
            }


            styleClass += this.crit ? " display-crit" : "";
        }
        else if(type === "missed"){
            styleClass = "display-missed";
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

        randomX = (Math.random() * 60 | 0) - 30;
        randomY = (Math.random() * 60 | 0) - 30;


        $("<div data-id='" + this.id + "' class='display'></div>").appendTo(spriteContainer);
        this.uiData = $("div[data-id=" + this.id + "]");

        this.uiData.addClass("display-floating-dmg");


        $(this.uiData).css({
            "top": coords.y - this.uiData.height() / 2 + randomY + "px",
            "left": coords.x - this.uiData.width() / 2 + randomX + "px"
        });

        if(this.typeFlag & type.BUFF){
            this.uiData.addClass(this.getStyleClass("buff"));
            this.uiData.text(this.buffName);
            this.popOut();
        }
        if(type === "number"){
            this.uiData.addClass(this.getStyleClass(this.amount));
            this.uiData.text(this.getAmount());
            if(this.typeFlag & type.DAMAGE){
                this.popOut(this.flyDown);
            }
            else {
                this.popOut(this.flyAbove);
            }
        }
        if(this.typeFlag & type.MISS){
            this.uiData.addClass(this.getStyleClass("missed"));
            this.uiData.text("missed!");
            this.popOut(this.flyAbove);
        }


        setTimeout(function(){
            $(self.uiData).remove();
        }, this.displayDuration);
    }

    r.popOut = function(next){
        var randomFactor = (Math.random() * 10 | 0) - 20;
        var size = 50 + randomFactor;
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
            complete: next.bind(this)
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

    r.flyDown = function(){
        $(this.uiData).animate({
            "top": "+=20",
            "opacity": "0.75"
        }, {
            duration: this.displayDuration,
            easing: "easeOutCirc"
        })
    }


    return Display;

})();

module.exports = Display;