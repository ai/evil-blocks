;(function ($) {
    "use strict";

    /*
     * Add `@data-role` alias to jQuery.
     *
     * Copy from jquery.role by Sasha Koss https://github.com/kossnocorp/role
     */

    var rewriteSelector = function (context, name, pos) {
        var original = context[name];
        if ( !original ) {
            return;
        }

        context[name] = function () {
            arguments[pos] = arguments[pos].replace(
                /@([\w\u00c0-\uFFFF\-]+)/g, '[data-role~="$1"]');
            return original.apply(context, arguments);
        };

        $.extend(context[name], original);
    };

    rewriteSelector($, 'find', 0);
    rewriteSelector($, 'multiFilter', 0);
    rewriteSelector($.find, 'matchesSelector', 1);
    rewriteSelector($.find, 'matches', 0);

    /*
     * Evil namespace. Also can be used in Evil Front.
     */
    if ( !window.evil ) {
        window.evil = { };
    }

    /**
     * If onready event is already happend.
     */
    var ready = false;

    var callbacks = {
        /**
         * Create callback wrapper for block listener.
         */
        block: function (self, func) {
            return function (e) {
                if ( e.currentTarget == e.target ) {
                    func.apply(self, arguments);
                }
            }
        },

        /**
         * Create callback wrapper for body/document listener.
         */
        global: function (self, func) {
            return function () {
                func.apply(self, arguments);
            }
        },

        /**
         * Create callback wrapper for element listener.
         */
        elem: function (self, func) {
            return function () {
                var event = arguments[0];
                event.el = $(this);
                func.apply(self, arguments);
            }
        }
    };

    /**
     * Execute `callback` on every finded `selector` inside `base`.
     */
    var vitalize = function (base, selector, klass) {
        var blocks = $().add( base.filter(selector) ).
                         add( base.find(selector) );

        if ( blocks.length == 0 ) {
            return;
        }

        var inits = [];

        for ( var i = 0; i < blocks.length; i++ ) {
            var block = $(blocks[i]);

            if ( block.data('evil-vitalized') ) {
                continue;
            }
            block.data('evil-vitalized', true);

            var obj = (function (block) {
                return function (subselector) {
                    return $(subselector, block);
                };
            })(block);

            var actives = { };
            block.find('[data-role]').each(function (_, el) {
                var roles = el.attributes['data-role'].value.split(' ');
                for ( var i = 0; i < roles.length; i++ ) {
                    var role = roles[i];
                    if ( !obj[role] ) {
                        obj[role] = [];
                    }
                    obj[role].push(el);
                }
            });

            obj.block = block;

            var event = function (type, name, prop) {
                var result = callbacks[type](obj, prop);
                if ( window.evil.block.eventFilter ) {
                    result = window.evil.block.eventFilter(result, obj, name);
                }
                return result;
            };

            for ( var name in klass ) {
                var prop = klass[name];

                if ( name.indexOf('on ') == -1 ) {
                    obj[name] = prop;
                    continue;
                }

                (function (name, prop) {
                    var parts = name.split(' on ');

                    if ( parts[1] == 'body' ) {
                        $('body').on(parts[0], event('global', name, prop));

                    } else if ( parts[1] == 'window' ) {
                        $(window).on(parts[0], event('global', name, prop));

                    } else if ( parts[1] ) {
                        block.on(parts[0], parts[1], event('elem', name, prop));

                    } else {
                        block.on(parts[0], event('block', name, prop));
                    }
                })(name, prop);
            }

            inits.push(obj);
        }

        if ( klass.init ) {
            return function () {
                for ( var i = 0; i < inits.length; i++ ) {
                    klass.init.apply(inits[i]);
                }
            };
        }
    };

    /**
     * Create object for every `selector` finded in page and call their
     * `init` method.
     *
     *   evil.block '.user-page .buttons',
     *     init: ->
     *       @gallery.fotorama()
     *     delete: ->
     *       @deleteForm.submit ->
     *         $('user-status').trigger('deleted')
     *     'click on @deleleLink': (e) ->
     *       e.el.addClass('is-loading')
     *       delete()
     *     'on update': ->
     *       location.reload()
     *
     * Every `data-role="aName"` in HTML will create in object `aName` property
     * with jQuery node.
     *
     * To bind delegate listener just create `EVENT on SELECTOR` method.
     * In first argument it will receive jQuery node of `e.currentTarget`,
     * second will be event object and others will be parameters.
     *
     * To communicate between blocks, just trigget custom events. To receive
     * events from another blocks, create `on EVENT` method. Event object will
     * be on first argument here.
     *
     * Block node will be in `@block` property and you can search only inside
     * block by `@(selector)` method.
     *
     * If your block contrain only `init` method, you can use shortcut:
     *
     *   evil.block '.block', ->
     *     # init method
     */
    window.evil.block = function (selector, vitalizer) {
        if ( typeof(vitalizer) == 'function' ) {
            vitalizer = { init: vitalizer };
        }

        window.evil.block.vitalizers.push([selector, vitalizer]);

        if ( ready ) {
            var init = vitalize($(document), selector, vitalizer);
            if ( init ) {
                init();
            }
        }
    };

    /**
     * Evil blocks list.
     */
    window.evil.block.vitalizers = [];

    /**
     * Vitalize all current blocks inside base. You must call it on every
     * new content from AJAX.
     *
     *   'on click on @load': ->
     *     $.get '/comments', (comments) =>
     *       evil.block.vitalize $(comments).applyTo(@comments)
     */
    window.evil.block.vitalize = function (base) {
        if ( base ) {
            base = $(base);
        } else {
            base = $(document);
        }

        var inits = [];
        for ( var i = 0; i < window.evil.block.vitalizers.length; i++ ) {
            var vitalizer = window.evil.block.vitalizers[i];
            inits.push( vitalize(base, vitalizer[0], vitalizer[1]) );
        }

        for ( var i = 0; i < inits.length; i++ ) {
            if ( inits[i] ) {
                inits[i]();
            }
        }
    };

    /*
     * Run all blocks on load.
     */
    $(document).ready(function () {
        setTimeout(function () {
            ready = true;
            evil.block.vitalize();
        }, 1);
    });

})(jQuery);
