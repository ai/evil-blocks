evil = window.evil
body = (html) -> evil.block.vitalize $('#fixtures').html(html)

describe 'evil.block', ->
  afterEach ->
    $('#fixtures').html('')
    window.evil.block.vitalizers = []

  it 'adds role alias', ->
    body '<b data-role="role-test" />' +
         '<b data-role="multi one" />' +
         '<b data-role="multi" />'
    $('@role-test').length.should.eql(1)
    $('@multi').length.should.eql(2)

  describe 'function API', ->

    it 'executes callback only if find selector', ->
      called = false
      evil.block '.page', -> called = true

      body '<b class="no-page" />'
      called.should.be.false

      body '<b class="page" />'
      called.should.be.true

    it 'executes objects of functions', ->
      called = ''
      evil.block '.page', ->
        initA: ->
          called += 'a'
        initB: ->
          called += 'b'

      body '<b class="page" />'
      called.should.eql('ab')

    it 'sends jQuery and page', ->
      args = []
      evil.block '.page', ->
        args = arguments
        false

      body '<b class="page" />'
      args[0].should.eql(jQuery)
      args[2].should.eql($ $('.page').get(0))

    it 'sends b function', ->
      b = null
      evil.block '.page', ($, _b) -> b = _b

      body '<b class="page">' +
             '<a class="b" data-role="link" /><a data-role="link" />' +
           '</b><a data-role="link" />'

      b('a').length.should.eql(2)
      b.link.length.should.eql(2)

    it 'camel-cases role name', ->
      b = null
      evil.block '.page', ($, _b) -> b = _b

      body '<b class="page"><a data-role="camel-case-role" /></b>'
      b.camelCaseRole.length.should.eql(1)

    it 'calls on every finded block', ->
      blocks = []
      evil.block '.page', ($, b, block)-> blocks.push(block)

      body '<b class="page" /><b class="page" />'
      blocks.should.eql ($ el for el in $ '.page')

    it 'properly finds elems inside', ->
      bs     = []
      blocks = []
      evil.block '.page', ($, b, block) ->
        bs.push b
        blocks.push block

      body """
        <div class="page"> <b data-role="elem"/> </div>
        <div class="page"> <b data-role="elem"/> </div>
      """

      bs[0]('@elem').should.eql blocks[0].find('@elem')
      bs[1]('@elem').should.eql blocks[1].find('@elem')

  describe 'class API', ->

    it 'executes callback only if find selector', ->
      called = false
      evil.block '.page',
        init: ->
          called = true

      body '<b class="no-page" />'
      called.should.be.false

      body '<b class="page" />'
      called.should.be.true

    it 'creates properties for each role', ->
      prop = false
      evil.block '.page',
        init: ->
          prop = @roleName

      body '<div class="page"> <b data-role="roleName"/> </div>'
      prop[0].should.eql $('@roleName')[0]

    it 'listens block events', ->
      burning = ''
      evil.block '.page',
        'on fire burn': (e, param) ->
          burning += ' ' + e.type + ' ' + param

      body '<div class="page"></div>'
      $('.page').trigger('fire', '1').trigger('burn', '2')
      burning.should.eql ' fire 1 burn 2'

    it 'checks source for block events', ->
      burning = ''
      evil.block '.page',
        'on fire': ->
          burning = '1'

      body '<div class="page"> <b data-role="a"/> </div>'
      $('@a').trigger('fire')
      burning.should.eql('')

    it 'listens elements events', ->
      burning = ''
      evil.block '.page',
        'fire burn on @a, @b': (el, e, param) ->
          burning += ' ' + el.data('role') + ' ' + param

      body """
        <div class="page">
          <b data-role="a" /><b data-role="b" />
        </div>
      """
      $('@a').trigger('fire', '1')
      $('@b').trigger('burn', '2')
      burning.should.eql ' a 1 b 2'

    it 'listens body events', ->
      burning = ''
      evil.block '.page',
        'fire on body': (e, param) ->
          burning = param

      body '<div class="page"></div>'
      $('body').trigger('fire', '1')
      burning.should.eql '1'

    it 'listens body bubble events', ->
      burning = ''
      evil.block '.page',
        'fire on body': ->
          burning = '1'

      body '<div class="page"></div>'
      $('.page').trigger('fire')
      burning.should.eql '1'

    it 'listens window events', ->
      burning = ''
      evil.block '.page',
        'fire on window': (e, param) ->
          burning = param

      body '<div class="page"></div>'
      $(window).trigger('fire', '1')
      burning.should.eql '1'

    it 'finds inside', ->
      finded = false
      evil.block '.page',
        init: ->
          finded = @('b').text()

      body '<div class="page"> <b data-role="role">finded</b> </div>'
      finded.should.eql 'finded'
