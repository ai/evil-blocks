;(function () {
    "use strict";

    var log = function () {
        if ( !console || !console.log ) {
            return;
        }
        console.log.apply(console, arguments);
    };

    if ( !window.evil || !window.evil.block ) {
        log("You should include evil-blocks.debug.js after evil-blocks.js");
        return;
    }

    var logger = function (obj) {
        for ( var name in obj ) {
            if ( name.indexOf('on ') == -1 ) continue;

            var parts = name.split('on ');
            var event = parts[0] ? parts[0] : parts[1];

            var callback = obj[name];

            (function(event, callback){
                obj[name] = function (e) {
                    var source   = e.el ? e.el[0] : this.block[0];
                    var messages = ['Event "' + event + '" on', source];

                    var params = Array.prototype.slice.call(arguments, 1);
                    if ( params.length > 0 ) {
                        messages.push('with params');
                        messages = messages.concat(params);
                    }

                    log.apply(this, messages);
                    callback.apply(this, arguments);
                }
            })(event, callback);
        }
    };

    evil.block.filters.splice(2, 0, logger);
})();
