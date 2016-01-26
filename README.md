# Evil Blocks [![Build Status](https://travis-ci.org/ai/evil-blocks.svg)](https://travis-ci.org/ai/evil-blocks)

<img align="right" width="140" height="115" src="http://ai.github.io/evil-blocks/logo.svg" title="Evil Blocks logo by Roman Shamin">

Evil Block is a tiny JS framework for web pages. It is based on 4 ideas:

* **Split code to independent blocks.** “Divide and conquer” is always good idea.
* **Blocks communicate by events.** Events is an easy and safe method
  to keep complicated dependencies between controls very clean.
* **Separate JS and CSS.** You should only use classes for styles and bind JS
  by special attribute selectors. This way you can update your styles without
  fear to break any scripts.
* **Try not to render on client.** 2-way data-binding looks very cool,
  but it has a [big price]. Most of web pages (unlike web applications)
  can render all HTML on server and use client rendering only in few places.
  Without rendering we can have incredibly clean code and architecture.

See also [Evil Front], a pack of helpers for Ruby on Rails and Evil Blocks.

Role aliases were taken from [Role.js]. Based on Pieces.js by [@chrome].

<a href="https://evilmartians.com/?utm_source=evil-blocks">
<img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg" alt="Sponsored by Evil Martians" width="236" height="54">
</a>

[Role.js]:       https://github.com/kossnocorp/role
[big price]:     http://staal.io/blog/2014/02/05/2-way-data-binding-under-the-microscope/
[Evil Front]:    https://github.com/ai/evil-front
[@chrome]:       https://github.com/chrome

## Quick Example

Slim template:

```haml
.todo-control@@todo
  ul@tasks

    - @tasks.each do |task|
      .task@task
        = task.name
        form@finishForm action="/tasks/#{ task.id }/finish"
          input type="submit" value="Finish"

  form@addForm action="/tasks/"
    input type="text"   name="name"
    input type="submit" value="Add"
```

Block’s CoffeeScript:

```coffee
evil.block '@@todo',

  ajaxSubmit: (e) ->
    e.preventDefault()

    form = e.el
    form.addClass('is-loading')

    $.ajax
      url:      form.attr('action')
      data:     form.serialize()
      complete: -> form.removeClass('is-loading')

  'submit on @finishForm': (e) ->
    @ajaxSubmit(e).done ->
      e.el.closest("@task").addClass("is-finished")

  'submit on @addForm': (e) ->
    e.preventDefault()
    @ajaxSubmit(e).done (newTaskHTML) ->
      @tasks.append(newTaskHTML)
```

## Attributes

If you use classes selectors in CSS and JS, your scripts will be depend
on styles. If you change `.small-button` to `.big-button`, you must
change all the button’s selectors in scripts.

Separated scripts and styles are better, so Evil Blocks prefers to work with
two HTML attributes to bind your JS: `data-block` (to define blocks)
and `data-role` (to define elements inside block).

```html
<div data-block="todo">
    <ul data-role="tasks">
    </ul>
</div>
```

Evil Blocks extends Slim and jQuery, so you can use shortcuts for these
attributes: `@@block` and `@role`. For Haml you can use [Role Block Haml] gem
to use the same shortcuts.

```haml
@@todo
  ul@tasks
```

```js
$('@tasks')
```

With these attributes you can easily change interface style
and be sure in scripts:

```haml
.big-button@addButton
```

Of course, Evil Block doesn’t force you to write only these selectors.
You can use any attributes, that you like.

[Role Block Haml]: https://github.com/vladson/role_block_haml

## Blocks

You should split your interface into independent controls and mark them
with `data-block`:

```haml
header@@header
  a.exit href="#"

.todo-control@@todo
  ul.tasks

.docs-page@@docs
```

Also you can vitalize your blocks in scripts with `evil.block` function:

```coffee
evil.block '@@header',

  init: ->
    console.log('Vitalize', @block)
```

When a page was loaded Evil Blocks finds blocks by `@@header` selector
(this is a shortcut for `[data-block=header]`) and calls `init` on every
founded block. So, if your page contains two headers, `init` will be called
twice with different `@block`’s.

The `@block` property will contain a jQuery node of current block.
You can search elements inside of current block with `@$(selector)` method:

```coffee
evil.block '@@docs',

  init: ->
    @$('a').attr(target: '_blank') # Open all links inside docs in new tab
                                   # Same as @block.find('a')
```

You can add any methods and properties to your block class:

```coffee
evil.block '@@gallery',
  current: 0

  showPhoto: (num) ->
    @$('img').hide().
      filter("eql(#{ num })").show()

  init: ->
    @showPhoto(@current)
```

Evil Blocks will automatically create properties with jQuery nodes
for every element inside of a block with `data-role` attribute:

```haml
.todo-control@@todo
  ul.tasks@tasks
```

```coffee
evil.block '@@todo',

  addTask: (task) ->
    @tasks.append(task)
```

If you add new HTML with AJAX, you can vitalize new blocks with
`evil.block.vitalize()`. This function will vitalize only new blocks in
a document.

```coffee
@sections.append(html)
evil.block.vitalize()
```

## Events

You can bind listeners to events inside of a block with `events on selectors`
method:

```coffee
evil.block '@@todo',

  'submit on @finishForm': ->
    # Event listener
```

A more difficult example:

```coffee
evil.block '@@form',
  ajaxSearch: -> …

  'change, keyup on input, select': (event) ->
    field = event.el()
    @ajaxSearch('Changed', field.val())
```

Listener will receive a jQuery Event object as the first argument.
Current element (`this` in jQuery listeners) will be contained in `event.el`
property. All listeners are delegated on current block, so `click on @button`
is equal to `@block.on 'click', '@button', ->`.

You should prevent default event behavior with `event.preventDefault()`,
`return false` will not do anything in block’s listeners. I recommend
[evil-front/links] to prevent default behavior in any links with `href="#"`
to clean your code.

You can also bind events on body and window:

```coffee
evil.blocks '@@docs',
  recalcMenu: -> …
  openPage:   -> …

  init: ->
    @recalcMenu()

  'resize on window': ->
    @recalcMenu()

  'hashchange on window': ->
    @openPage(location.hash)
```

Listener `load on window` will execute immediately, if window is already loaded.

[evil-front/links]: https://github.com/ai/evil-front/blob/master/evil-front/lib/assets/javascripts/evil-front/links.js

## Blocks Communications

Blocks should communicate via custom jQuery events. You can bind an event
listener to a block node with `on events` method:

```coffee
evil.block '@@slideshow',
  nextSlide: -> …

  'on play': ->
    @timer = setInterval(=> @nextSlide, 5000)

  'on stop': ->
    clearInterval(@timer)

evil.block '@@video',

  'click on @fullscreenButton': ->
    $('@@slideshow').trigger('stop')
```

If you want to use broadcast messages, you can use custom events on body:

```coffee
evil.block '@@callUs',

  'change-city on body': (e, city) ->
    @phoneNumber.text(city.phone)

evil.block '@@cityChanger',
  getCurrentCity: -> …

  'change on @citySelect': ->
    $('body').trigger('change-city', @getCurrentCity())
```

## Rendering

If you render on the client and on the server-side, you must repeat helpers,
i18n, templates. Client rendering requires a lot of libraries and architecture.
2-way data binding looks cool, but has a very [big price] in performance,
templates, animation and overengeniring.

If you develop a web page (not a web application with offline support, etc),
server-side rendering will be more useful. Users will see your interface
imminently, search engines will index your content and your code will be much
simple and clear.

In most of cases you can avoid client-side rendering. If you need to add a block
with JS, you can render it hidden to page HTML and show it in right time:

```coffee
evil.block '@@comment',

  'click on @addCommentButton': ->
    @newCommentForm.slideDown()
```

If a user changes some data and you need to update the view, you anyway need
to send a request to save the new data on a server. Just ask the server
to render a new view. For example, on a new comment server can return
new comment HTML:

```coffee
evil.block '@@comment',

  'submit on @addCommentForm': ->
    $.post '/comments', @addCommentForm.serialize(), (newComment) ->
      @comments.append(newComment)
```

But, of course, some cases require client-side rendering. Evil Blocks only
recommends to do it on the server side, but not force you:

```coffee
evil.block '@@comment',

  'change, keyup on @commentField', ->
    html = JST['comment'](text: @commentField.text())
    @preview.html(html)
```

[big price]: http://staal.io/blog/2014/02/05/2-way-data-binding-under-the-microscope/

## Debug

Evil Blocks contains a debug extension, which logs all the events inside blocks.
To enable it, just load `evil-blocks-debug.js`. For example, in Rails:

```haml
- if Rails.env.development?
  = javascript_include_tag 'evil-blocks-debug'
```

## Extensions

Evil Blocks has a tiny core. It only finds blocks via selectors,
sets the `@block` property and calls the `init` method. Any other features
(like event bindings or `@$()` method) are created by filters
and can be disabled or replaced.

Before calling `init`, Evil Blocks processes an object through the filters list
in `evil.block.filters`. A filter accepts an object as its first argument and
an unique class ID as the second. It can find some properties inside of
the object, work with block DOM nodes and add/remove some object properties.
If filter returns `false`, Evil Blocks will stop block vitalizing
and will not call the `init` method.

Default filters:

1. **Don’t vitalize same DOM node twice.** It returns `false` if a block
   was already initialized with a given ID.
2. **Add `@$()` method.** It adds a shortcut find method to an object.
3. **Add shortcuts to `@element`.** It adds properties for all children with
   `data-role` attribute.
4. **Bind block events.** Find, bind listeners and remove all the methods with
   a name like `on event`.
5. **Smarter window load listener.** Run `load on window` listener immediately,
   if window is already loaded.
6. **Bind window and body events.** Find, bind listeners and remove all
   the methods with a name like `event on window` or `event on body`.
7. **Bind elements events.** Find, bind listeners and remove all the methods
   with a name like `event on child`.

You can add you own filter to `evil.block.filters`. Most filters should be added
after first filter to not been called on already initialized blocks.

Let’s write filter, which will initialize blocks only when they become
to be visible.

```coffee
filter = (obj) ->
  if not obj.block.is(':visible')
    # Check for visibility every 100 ms
    # and recall vitalizing if block become visible
    checking = ->
      evil.block.vitalize(obj.block) if obj.block.is(':visible')
    setTimeout(checking, 100);

    # Disable block initializing
    return false

# Add filter to list
evil.block.filters.splice(0, 0, filter)
```

With the filters you can change Evil Blocks logic, add some new shortcuts
or features like mixins.

Also you can remove any default filters from `evil.block.filters`. For example,
you can create properties for `data-role` children only from some white list.

But Filters API is still unstable and you should be careful on major updates.

## Modules

If your blocks have same behavior, you can create a module-block
and set multiple blocks on the same tag:

```haml
@popup@@closable
  a@closeLink href="#"
```

```coffee
evil.block '@@closable',

  'click on @closeLink': ->
    @block.trigger('close')

evil.block '@@popup',

  'on close': ->
    @block.removeClass('is-open')
```

If you want to use same methods inside of multiple block, you can create
an inject-function:

```coffee
fancybox = (obj) ->
  for name, value of fancybox.module
    obj[name] = value
  # Initializer code

fancybox.module =
  openInFancybox: (node) ->

evil.block '@@docs',

  init: ->
    fancybox(@)

  'click on @showExampleButton': ->
    @openInFancybox(@example)
```

## Install

### Ruby on Rails

Add `evil-block-rails` gem to `Gemfile`:

```ruby
gem "evil-blocks-rails"
```

Load `evil-blocks.js` in your script:

```js
//= require evil-blocks
```

If you use Rails 3 on Heroku, you may need
[some hack](https://github.com/ai/evil-blocks/issues/17).

### Ruby

If you use Sinatra or other non-Rails framework you can add Evil Blocks path
to Sprockets environment:

```ruby
EvilBlocks.install(sprockets)
```

And change Slim options to support `@@block` and `@rule` shortcuts:

```ruby
EvilBlocks.install_to_slim!
```

Then just load `evil-blocks.js` in your script:

```js
//= require evil-blocks
```

### Others

Add file `lib/evil-blocks.js` to your project.
