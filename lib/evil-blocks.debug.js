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

    window.evil.block.eventFilter = function (callback, block, event) {
        return function () {
            var params = Array.prototype.slice.call(arguments, 1);
            var messages = ['Event "' + event + '" on', block.block[0]];
            if ( params.length > 0 ) {
                messages.push('with params');
                messages = messages.concat(params);
            }
            log.apply(this, messages);

            callback.apply(this, arguments);
        };
    }
})();
