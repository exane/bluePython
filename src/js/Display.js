var Display = (function(){

    var Display = function(target, amount){
        this.target = target;
        this.amount = amount;
        this.id = (new Date()).getSeconds() * 1000 + (new Date()).getMilliseconds();

        this.start();
    }
    var r = Display.prototype;

    r.target = null;
    r.amount = null;
    r.uiNumber = null;
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
        return amount <= 0 ? "display-dmg" : "display-heal";
    }

    r.start = function(){
        var self = this;
        var coords = this.getSpriteCenter();
        var randomX, randomY;

        randomX = (Math.random() * 30 | 0) - 15;
        randomY = (Math.random() * 30 | 0) - 15;


        //this.uiNumber = "<div data-id='" + this.id + "' class='display display-dmg'>150</div>";
        //$(this.uiNumber).css({
        //    top: coords.y,
        //    left: coords.x
        //})
        //$(".display-floating-dmg").append(this.uiNumber);

        $("<div data-id='" + this.id + "' class='display'></div>").appendTo(".display-floating-dmg");
        this.uiData = $("div[data-id=" + this.id + "]");

        this.uiData.addClass(this.getStyleClass(this.amount));
        this.uiData.text(this.getAmount());



        $(this.uiData).css({
            "top": coords.y + self.uiData.height() /*/ 2*/  + randomY + "px",
            "left": coords.x - self.uiData.width() / 2 + randomX + "px"
        });


        this.popOut(this.flyAbove);
        this.flyAbove();



        setTimeout(function(){
            $(self.uiData).remove();
        }, 3000);
    }

    r.popOut = function(next){
        var randomFactor = (Math.random()*3 | 0) - 6;
        var size = 15 + randomFactor;
        var correction = size/2;

        $(this.uiData).animate({
            "font-size": "+=" + size,
            "top": "-="+correction,
            "left": "-="+correction
        }, {
            duration: 60,
            easing: "linear",
            complete: next
        });
    }

    r.flyAbove = function(){
        $(this.uiData).animate({
            "top": "-=150",
            "opacity": "0.75"
        }, {
            duration: 3500,
            easing: "easeOutCirc"
        })
    }



    return Display;

})();

module.exports = Display;