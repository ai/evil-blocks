;(function ($, window) {
    "use strict";

    // Helpers
    var $window = $(window);

    // Clone object
    var clone = function (origin) {
        var cloned = { };
        for ( var name in origin ) {
            cloned[name] = origin[name];
        }
        return cloned;
    };

    // Is string ends with substring.
    var endsWith = function (string, substring) {
        return string.substr(-substring.length) === substring;
    };

    /*
     * Add `@data-role` alias to jQuery.
     *
     * Copy from jquery.role by Sasha Koss https://github.com/kossnocorp/role
     */

    var rewriteSelector = function (context, name, pos) {
        var original = context[name];
        if ( !original ) return;

        context[name] = function () {
            arguments[pos] = arguments[pos].replace(
                /@@([\w\u00c0-\uFFFF\-]+)/g, '[data-block~="$1"]');
            arguments[pos] = arguments[pos].replace(
                /@([\w\u00c0-\uFFFF\-]+)/g,  '[data-role~="$1"]');
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
    var evil = window.evil;

    // Find selector inside base DOM node and cretae class for it.
    var find = function (base, id, selector, klass) {
        var blocks = $().add( base.filter(selector) ).
                         add( base.find(selector) );

        if ( blocks.length == 0 ) return;

        var objects = [];

        blocks.each(function (_, node) {
            var block = $(node);

            var obj = clone(klass);
            obj.block = block;

            for ( var i = 0; i < evil.block.filters.length; i++ ) {
                var stop = evil.block.filters[i](obj, id);
                if ( stop === false ) return;
            }

            objects.push(obj)
        });

        return function () {
            objects.forEach(function (obj) {
                if (obj.init) obj.init();
            })
        };
    };

    // If onready event was already happend.
    var ready = false;

    // If onload event was already happend.
    var loaded = false;
    $window.load(function (event) {
        loaded = event;
    });

    // Latest block ID
    var lastBlock = 0;

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
    evil.block = function (selector, klass) {
        lastBlock += 1;
        var id = lastBlock;

        if ( typeof(klass) == 'function' ) {
            klass = { init: klass };
        }

        evil.block.defined.push([id, selector, klass]);

        if ( ready ) {
            var init = find($(document), id, selector, klass);
            if ( init ) init();
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
    evil.block.vitalize = function (base) {
        if ( base ) {
            base = $(base);
        } else {
            base = $(document);
        }

        var inits = [];
        evil.block.defined.forEach(function (define) {
            inits.push( find(base, define[0], define[1], define[2]) );
        });

        for ( var i = 0; i < inits.length; i++ ) {
            if ( inits[i] ) inits[i]();
        }
    };

    /**
     * Evil blocks list.
     */
    evil.block.defined = [];

    /**
     * Filters to process block object and add some extra functions
     * to Evil Blocks. For example, allow to write listeners.
     *
     * Filter will receive block object and unique class ID.
     * If filter return `false`, block will not be created.
     */
    evil.block.filters = [];

    var filters = evil.block.filters;

    /**
     * Don’t vitalize already vitalized block.
     *
     * For better perfomance, it should be last filter.
     */
    filters.push(function (obj, id) {
        var ids = obj.block.data('evil-blocks');
        if ( !ids ) {
            ids = [];
        } else if ( ids.indexOf(id) != -1 ) {
            return false;
        }
        ids.push(id);
        obj.block.data('evil-blocks', ids);
    });

    /**
     * Create `this.$()` as alias for `this.block.find()`
     */
    filters.push(function (obj) {
        obj.$ = function (subselector) {
            return obj.block.find(subselector);
        };
    });

    /**
     * Create properties for each element with `data-role`.
     */
    filters.push(function (obj) {
        obj.block.find('[data-role]').each(function (_, el) {
            var roles = el.attributes['data-role'].value.split(' ');
            for ( var i = 0; i < roles.length; i++ ) {
                var role = roles[i];
                if ( !obj[role] ) obj[role] = $();
                if ( obj[role].jquery ) obj[role].push(el);
            }
        });
    });

    /**
     * Syntax sugar to listen block events.
     */
    filters.push(function (obj) {
        for ( var name in obj ) {
            if ( name.substr(0, 3) != 'on ' ) continue;

            var events   = name.substr(3);
            var callback = obj[name];
            delete obj[name];

            (function (events, callback) {
                obj.block.on(events, function (e) {
                    if ( e.currentTarget == e.target ) {
                        callback.apply(obj, arguments);
                    }
                });
            })(events, callback);
        }
    });

    /**
     * Smart `load on window` listener, which fire immediately
     * if page was already loaded.
     */
    filters.push(function (obj) {
        var name     = 'load on window';
        var callback = obj[name];

        if ( !callback ) return;
        delete obj[name];

        if ( loaded ) {
            setTimeout(function () {
                callback.call(obj, loaded);
            }, 1);
        } else {
            $window.load(function (event) {
                callback.call(obj, event);
            });
        }
    });

    /**
     * Syntax sugar to listen window and body events.
     */
    filters.push(function (obj) {
        for ( var name in obj ) {
            var elem = false;
            if ( endsWith(name, 'on body') ) {
                elem = $('body');
            } else if ( endsWith(name, 'on window') ) {
                elem = $window;
            }

            if ( !elem ) continue;

            var event    = name.split(' on ')[0];
            var callback = obj[name];
            delete obj[name];

            (function (elem, event, callback) {
                elem.on(event, function () {
                    callback.apply(obj, arguments);
                });
            })(elem, event, callback);
        }
    });

    /**
     * Syntax sugar to listen element events.
     */
    filters.push(function (obj) {
        for ( var name in obj ) {
            var parts = name.split(' on ');
            if ( !parts[1] ) continue;

            var callback = obj[name];
            delete obj[name];

            (function (parts, callback) {
                obj.block.on(parts[0], parts[1], function (e) {
                    e.el = $(this);
                    callback.apply(obj, arguments);
                });
            })(parts, callback);
        }
    });

    /*
     * Run all blocks on load.
     */
    $(document).ready(function () {
        ready = true;
        evil.block.vitalize();
    });

})(jQuery, window);
