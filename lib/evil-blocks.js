/*
 * Copyright 2013 Andrey “A.I.” Sitnik <andrey@sitnik.ru>,
 * sponsored by Evil Martians.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

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
     * Call `callback` only if `selector` was founded on page.
     * `callback` will receive 3 arguments:
     * * `$` - jQuery.
     * * `b` - like jQuery, but find only inside founded blocks.
     * * `block` - blocks, founded by `selector`.
     *
     * All elements with `data-role` will be add as property to `b`.
     *
     * `callback` can return hash of inititalizer functions,
     * `evil.block` will execute them. It is good way to isolate variables
     * in separated initializers.
     *
     *   evil.block '.user-page', ($, b, block) ->
     *
     *     editUser: ->
     *       # Click on `data-role="edit"` inside `.user-page`
     *       b.edit.click ->
     *         b('.edit-form').show()
     *
     *     delUser: ->
     *       b.del.click -> b('.delete-form').submit()
     *
     *     initGallery: ->
     *       b.gallery.fotorama()
     */
    window.evil.block = function (selector, callback) {
        $(function () {
            var blocks = $(selector);
            for ( var i = 0; i < blocks.length; i++ ) {
                var block = $(blocks[i]);

                var b = function (subselector) {
                    return $(subselector, block);
                };
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
                    b[role] = $(actives[role]);
                }

                var inits = callback($, b, block);
                if ( typeof(inits) == 'object' ) {
                    for ( var init in inits ) {
                        inits[init]($, b, block);
                    }
                }
            }
        });
    };

})(jQuery);
