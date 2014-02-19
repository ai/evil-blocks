# Evil Blocks

Evil Block is a tiny JS framework for web pages. It is based on 4 ideas:

* **Split code to independent blocks.** “Divide and rule” is always good idea.
* **Blocks communicate by events.** Events is easy and safe method to clean
  very complicated dependencies between controls.
* **Separate JS and CSS.** You use classes only for styles and bind JS
  by selectors with special attributes. So you can update your styles without
  fear to break your scripts.
* **Try not to render on client.** 2 way data-binding looks very cool,
  but it has [big price]. Most of web pages (instead of web applications)
  can render all HTML on server and use client rendering only in few small
  places. Without rendering we can incredibly clean code and architecture.

See also [Evil Front], a pack of helpers for Ruby on Rails and Evil Blocks.

Sponsored by [Evil Martians]. Role aliases was taken from [Role.js].

[Role.js]:       https://github.com/kossnocorp/role
[big price]:     http://staal.io/blog/2014/02/05/2-way-data-binding-under-the-microscope/
[Evil Front]:    https://github.com/ai/evil-front
[Evil Martians]: http://evilmartians.com/

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
      complete: -> form.addClass('is-loading')

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
on styles. If you will change `.small-button` to `.big-button`, you must
change all button’s selectors in scripts.

Separated scripts and styles are better, so Evil Blocks prefer to work with
two HTML attributes to bind your JS: `data-block` (to define blocks)
and `data-role` (to define elements inside block).

```html
<div data-block="todo">
    <ul data-role="tasks">
    </ul>
</div>
```

Evil Blocks extends Slim and jQuery, so you can use shortcuts for this
attributes: `@@block` and `@role`:

```haml
@@todo
  ul@tasks
```

```js
$('@tasks')
```

With this attributes you can easily change interface style
and be sure in scripts:

```haml
.big-button@addButton
```

Of course, Evil Block doesn’t force you to use only this selectors.
You can any attributes, that you like.

## Blocks

You should split your interface to independent controls and mark them
with `data-block`:

```haml
header@@header
  a.exit href="#"

.todo-control@@todo
  ul.tasks

.docs-page@@docs
```

Then you can vitalize your blocks in scripts by `evil.block` function:

```coffee
evil.block '@@header',

  init: ->
    console.log('Vitalize', @block)
```

When page will be loaded Evil Blocks finds blocks by `@@header` selector
(this is shortcut for `[data-block=header]`) and call `init` on every
founded block. So, if your page contains two headers, `init` will be called
twice with different `@block`.

Property `@block` will contain jQuery-node of current block. You can search
inside current block by `@$(selector)` method:

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

Evil Blocks will automatically create properties with jQuery-nodes
for every element inside block with `data-role` attribute:

```haml
.todo-control@@todo
  ul.tasks@tasks
```

```coffee
evil.block '@@todo',

  addTask: (task) ->
    @tasks.append(task)
```

If you add new HTML by AJAX, you can vitalize new blocks by
`evil.block.vitalize()`. This function will vitalize only new blocks in
document.

```coffee
@sections.append(html)
evil.block.vitalize()
```

## Events

You can bind listeners to events inside block by `"events on selectors"` method:

```coffee
evil.block '@@todo',

  'submit on @finishForm': ->
    # Event listener
```

More difficult example:

```coffee
evil.block '@@form',
  ajaxSearch: -> …

  'change, keyup on input, select': (event) ->
    field = event.el()
    @ajaxSearch('Changed', field.val())
```

Listener will receive jQuery Event object as first argument.
Current element (`this` in jQuery listeners) will be in `event.el` property.
All listeners are delegated on current block, so `click on @button` will be
equal to `@block.on 'click', '@button', ->`.

You should prevent default event behavior by `event.preventDefault()`,
`return false` will not do anything in block’s listeners. I recommend
[evil-front/links] to prevent default behavior in any links with `href="#"`
to clean your code.

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

[evil-front/links]: https://github.com/ai/evil-front/blob/master/evil-front/lib/assets/javascripts/evil-front/links.js

## Blocks Communications

Blocks should communicates by custom jQuery events. You can bind event listener
to block node by `"on events"` method:

```coffee
evil.block '@@slideshow', ->
  nextSlide: -> …

  'on play': ->
    @timer = setInterval(=> @nextSlide, 5000)

  'on stop': ->
    clearInterval(@timer)

evil.block '@@video', ->

  'click on @fullscreenButton': ->
    $('@@slideshow').trigger('stop')
```

If you want to use broadcast messages, you can use custom events on body:

```coffee
evil.block '@@callUs', ->

  'change-city on body': (e, city) ->
    @phoneNumber.text(city.phone)

evil.block '@@cityChanger', ->
  getCurrentCity: -> …

  'change on @citySelect': ->
    $('body').trigger('change-city', @getCurrentCity())
```

## Rendering

If you will render on client and on server-side, you must repeat helpers, i18n,
templates. Client rendering requires a lot of libraries and architecture.
2-way data binding looks cool, but has very [big price] in performance,
templates, animation and overengeniring.

If you develop web page (not web application with offline support, etc),
server-side rendering will be more useful. Users will see your interface
imminently, search engines will index your content and your code will be much
simple and clear.

In most of cases you can avoid client rendering. If you need to add some block
by JS, you can render it hidden to page HTML and show in right time:

```coffee
evil.block '@@comment',

  'click on @addCommentButton': ->
    @newCommentForm.slideDown()
```

If user change some data and you need to update view, you anyway need to send
request to save new data on server. Just ask server to render new view.
For example, on new comment server can return new comment HTML:

```coffee
evil.block '@@comment',

  'submit on @addCommentForm': ->
    $.post '/comments', @addCommentForm.serialize(), (newComment) ->
      @comments.append(newComment)
```

But, of course, some cases require client rendering. Evil Blocks only recommend
to do it server-side, but not force you:

```coffee
evil.block '@@comment',

  'change, keyup on @commentField', ->
    html = JST['comment'](text: @commentField.text())
    @preview.html(html)
```

[big price]: http://staal.io/blog/2014/02/05/2-way-data-binding-under-the-microscope/

## Modules

If your blocks has same behavior, you can create module-block and set
multiple blocks on same tag:

```haml
@popup@@closable
  a@closeLink href="#"
```

```coffee
evil.block '@@closable', ->

  'click on @closeLink': ->
    @block.trigger('close')

evil.block '@@popup', ->

  'on close': ->
    @clock.removeClass('is-open')
```

If you want to use same methods inside multiple block, you can create
inject-function:

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

## Debug

Evil Blocks contains debug extension, which log every events inside blocks.
To enable it, just load `evil-block.debug.js`. For example, in Rails:

```haml
- if Rails.env.development?
  = javascript_include_tag 'evil-block.debug'
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

### Ruby

If you use Sinatra or other non-Rails framework you can add Evil Blocks path
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
