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
    a.gallery-left@next-photo href="#"
    a.gallery-right@prev-photo href="#"
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
# Will execute callback only if .gallery-control is in current page
evil.block '.gallery-control', ($, b, block) ->
  current   = 0
  showPhoto = (num) ->
    # b-function finds only inside .gallery-control
    b('img').hide()
    b("img:eql(#{ num })").show()

  initState: ->
    showPhoto(current)

  buttons: ->
    # Shortcuts for data-role="next-photo"
    b.nextPhoto.click ->
      showPhoto(current += 1)

  slideShow: ->
    # You can communicate between blocks by simple events
    block.on 'slideshow-start', ->
      setTimeout( -> b.nextPhoto.click() , 5000)

# Will execute callback only on user page, where .user-page exists
evil.block '.user-page', ($, b, block) ->

  startSlidehow: ->
    b('.gallery-control').trigger('slideshow-start')
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
* Wrap scrips to revive blocks in `evil.block(selector, callback)`.
  It will execute `callback` only if block `selector` exists in current page.
  So you can be free to join all JS files in one.
* `evil.block` will send to `callback` three arguments: `$` is jQuery,
  `b` is “b-function”, `block` is blocks found by `selector`.
* B-function is like jQuery function, but find only inside finded block
  (alias `b('a') = $('a', selector)`).
* Bind JavaScript to `data-role` attribute to be free to change styles
  and classes without dangeros of breaking scripts.
* You can easy find special`data-role` by b-function. It will has properties
  for all roles inside block (`@role-name` will be camelized to `b.roleName`).
* If `callback` return object, `evil-block` will execute all it methods.
  It’s useful to split your script to several initializer with separated
  variables scope.

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

### Others

Add file `lib/evil-blocks.js` to your project.

## See Also

* [Evil Front](https://github.com/ai/evil-front) – pack of helpers and libraries
  for Ruby on Rails and Evil Blocks.
