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
    }
};

module.exports = Util;