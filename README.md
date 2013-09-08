# Evil Blocks

Evil Block is a tiny framework for web pages. It splits your application
to separated blocks with isolated styles and scripts.

Sponsored by [Evil Martians](http://evilmartians.com/).
Role aliases taken from [role](https://github.com/kossnocorp/role)
and [role-rails](https://github.com/kossnocorp/role-rails) by Sasha Koss.

## Quick Example

### Slim Template

```haml
.user-page
  .title User Name
  .gallery-control.is-big
    // Evil Blocks add @data-role alias to Slim
    // .class to bind styles, @data-role to bind JavaScript
    a.gallery-left@nextPhoto href="#"
    a.gallery-right@prevPhoto href="#"
    img src="photos/1.jpg"
    img src="photos/2.jpg"
    img src="photos/3.jpg"
```

### Sass Styles

```sass
// Block
.user-page
  // All elements must be inside blocks (like in namespaces)
  .title
    font-size: 20px

// Block
.gallery-control
  position: relative
  img, .gallery-left, .gallery-right
    position: absolute
  // Modificator
  &.is-big
    width: 600px
```

### CoffeeScript

```coffee
# Will execute init only if .gallery-control is in current page
evil.block '.gallery-control',
  current: 0

  showPhoto: (num) ->
    @('img').hide().
      filter("eql(#{ num })").show()

  init: ->
    @showPhoto(@current)

  'click on @nextPhoto', (link, event) ->
    @showPhoto(current += 1)

  'on start-slideshow', ->
    # You can communicate between blocks by simple events
    setTimeout( => @nextPhoto.click() , 5000)

# Will execute init only on user page, where .user-page exists
evil.block '.user-page',

  init: ->
    @('.gallery-control').trigger('start-slideshow')
```

## Styles

* You split all you tags to “blocks” and “elements”. Elements must belong
  to block. Blocks can be nested.
* Blocks classes must have special suffix, that can’t be accidentally used
  in elements. For example. `-page`, `-layout`, `-control` suffixes
  (for example, `.user-page`, `.header-layout`, `.gallery-control`).
* All styles must have block class in condition. For example,
  `.user-page .title`, `.user-page .edit`. So all you styles is protected
  from accidentally same classes (it’s important, if you join all your CSS files
  in one file).
* If block can be nested in another blocks (like common controls), adds prefix
  to all its elements (like `.gallery-left`). If block is a root block
  (like `.user-page` or `.header-layout`) be free to use short classes.
* Classes to modificate elements or blocks, must be like sentence without a noun
  (for example, `.is-big`, `.with-header`).

## JavaScript

* Unobtrusive JavaScript.
* Write animation and states in CSS. JavaScript just changes CSS classes.
* Avoid rendering. Send from server HTML, not JSON.
* Split JS by widgets. Describe widget class in `evil.block(selector, klass)`.
  It will create `klass` instance and call `init` method for each selectors,
  which exist in current page. So you can be free to join all JS files in one.
* Describe events by `EVENTS on SELECTORS` methods
  (like `keyup submit on @name, @family`). This methods save this and
  receive jQuery node in first argument and event in second.
* Bind JavaScript to `data-role` attribute to be free to change styles
  and classes without dangeros of breaking scripts.
* Every tag with `data-role` will by as property in object with jQuery node.
* If you need to find elements inside block, use `@(selector)` function.
* If you need to communicate between blocks, use custom events and create
  block events listeners by `on EVENTS` method. It will receive events object
  as first argument and event parameters as next arguments.

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

And change Slim options to support `@data-rule` shortcut:
```ruby
EvilBlocks.install_to_slim!
```

Then just load `evil-blocks.js` in your script:
```js
//= require evil-blocks
```

### Others

Add file `lib/evil-blocks.js` to your project.

## See Also

* [Evil Front](https://github.com/ai/evil-front) – pack of helpers and libraries
  for Ruby on Rails and Evil Blocks.
