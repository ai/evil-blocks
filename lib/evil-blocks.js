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
     * Evil blocks list.
     */
    var vitalizers = [];

    /**
     * If onready event is already happend.
     */
    var ready = false;

    /**
     * Execute `callback` on every finded `selector` inside `base`.
     */
    var vitalize = function (base, selector, callback) {
        var blocks = $().add( base.filter(selector) ).
                         add( base.find(selector) );

        if ( blocks.length == 0 ) {
            return;
        }

        for ( var i = 0; i < blocks.length; i++ ) {
            var block = $(blocks[i]);

            var b = (function (block) {
                return function (subselector) {
                    return $(subselector, block);
                };
            })(block);

            var actives = { };
            block.find('[data-role]').each(function (_, el) {
                var roles = el.attributes['data-role'].value.split(' ');
                for ( var i = 0; i < roles.length; i++ ) {
                    var role = roles[i].replace(/-\w/g, function (s) {
                        return s[1].toUpperCase();
                    });
                    if ( !actives[role] ) {
                        actives[role] = [];
                    }
                    actives[role].push(el);
                }
            });

            for ( var role in actives ) {
                b[role] = b(actives[role]);
            }

            var inits = callback($, b, block);
            if ( typeof(inits) == 'object' ) {
                for ( var init in inits ) {
                    inits[init]($, b, block);
                }
            }
        }
    };

    /**
     * Create callback wrapper for block listener.
     */
    var blockCallback = function (self, func) {
        return function (e) {
            if ( e.currentTarget == e.target ) {
                func.apply(self, arguments);
            }
        }
    };

    /**
     * Create callback wrapper for body/document listener.
     */
    var globalCallback = function (self, func) {
        return function () {
            func.apply(self, arguments);
        }
    };

    /**
     * Create callback wrapper for element listener.
     */
    var elemCallback = function (self, func) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            var el   = $(this);
            args.unshift(el);
            func.apply(self, args);
        }
    };

    /**
     * Convert block class to callback.
     */
    var convert = function (klass) {
        return function ($, obj, block) {
            obj.block = block;

            for ( var name in klass ) {
                var prop = klass[name];

                (function (name, prop) {
                    if ( name.indexOf('on ') == -1 ) {
                        obj[name] = prop;
                        return;
                    }

                    var parts = name.split(' on ');

                    if ( parts[1] == 'body' ) {
                        $('body').on(parts[0], globalCallback(obj, prop));

                    } else if ( parts[1] == 'window' ) {
                        $(window).on(parts[0], globalCallback(obj, prop));

                    } else if ( parts[1] ) {
                        block.on(parts[0], parts[1], elemCallback(obj, prop));

                    } else {
                        block.on(parts[0], blockCallback(obj, prop));
                    }
                })(name, prop);
            }

            if ( typeof(obj.init) == 'function' ) {
                obj.init();
            }
        }
    }

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
     *     'click on @deleleLink': (link) ->
     *       link.addClass('is-loading')
     *       delete()
     *     'on update': ->
     *       location.reload()
     *
     * Every `data-role="aName"` in HTML will create in object `aName` property
     * with jQuery node.
     *
     * To bind delegate listener just create `on EVENT on SELECTOR` method.
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
        if ( typeof(vitalizer) != 'function' ) {
            vitalizer = convert(vitalizer)
        }
        vitalizers.push([selector, vitalizer]);

        if ( ready ) {
            vitalize($(document), selector, vitalizer);
        }
    };

    /**
     * Vitalize all current blocks inside base. You must call it on every
     * new content from AJAX.
     *
     *   'on click on @load': ->
     *     $.get '/comments', (comments) =>
     *       evil.block.vitalize $(comments).applyTo(@comments)
     */
    window.evil.block.vitalize = function (base) {
        base = $(base);

        for ( var i = 0; i < vitalizers.length; i++ ) {
            var vitalizer = vitalizers[i];
            vitalize(base, vitalizer[0], vitalizer[1]);
        }
    };

    /*
     * Run all blocks on load.
     */
    $(document).ready(function () {
        ready = true;
        evil.block.vitalize(document);
    });

})(jQuery);
