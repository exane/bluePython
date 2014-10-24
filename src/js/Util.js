var Util = {
    random: function(arr){
        //arr = [{chance: 25, id: "burnslash"}, {chance: 75, id: "default_attack"}]

        var rnd = Math.random() * 100 | 0;
        var sum = 0;
        arr.sort(function(a, b){
            return a - b;
        });
        for(var i = 0; i < arr.length; i++) {

            sum += arr[i].chance;
            if(sum > rnd) {
                return arr[i].id;
            }

        }

        return -1;
    },
    formatNumber: function(nr){
        var string = nr.toString();
        var lastIndex = string.length - 1;
        var pointAfter = 3;

        var res = [];

        for(var k=0; k<string.length; k++){
            res.push(string[k]);
        }

        for(var i=1; i<string.length; i++){ // "1000"
            if(!(i%3) && i != 0){
                res.splice(lastIndex, 0, ".");
            }
            lastIndex--;
        }

        var resStr = res.toString();


        return (resStr.replace(/,/g, ""));
    }
};

module.exports = Util;