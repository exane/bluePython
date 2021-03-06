
var logging = {};
var debug = false;

var l = $(".log-console");

var scrollDown = function(){
    l.scrollTop(l[0].scrollHeight);
}

logging.public = function(data){

}

logging.message = function(text){
    l.append("<p>" + text + "</p>");
    if(debug){
        console.log(text);
    }
    scrollDown();
}

logging.clear = function(){
    l.text("");
    scrollDown();
}

logging.line = function(){
    l.append("<div class='log-line'></div>")
    scrollDown();
}

 module.exports = logging;