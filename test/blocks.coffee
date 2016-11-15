evilBlock = require('../lib/evil-blocks')
body     = (html) -> evilBlock.vitalize fixtures.html(html)
fixtures = null

describe 'evilBlock', ->
  before -> fixtures = $('#fixtures')

  afterEach ->
    fixtures.html('')
    evilBlock.defined = []

  it 'adds role alias', ->
    body '<b data-role="roleTest" />' +
         '<b data-role="multi one" />' +
         '<b data-role="multi" />'
    $('@roleTest').length.should.eql(1)
    $('@multi').length.should.eql(2)

  it 'adds block alias', ->
    body '<b data-block="roleTest" />' +
         '<b data-block="multi one" />' +
         '<b data-block="multi" />'
    $('@@roleTest').length.should.eql(1)
    $('@@multi').length.should.eql(2)

  describe '.vitalize()', ->

    it 'calls vitalize on document by default', ->
      called = false
      evilBlock '.page', ->
        called = true

      fixtures.html('<b class="page" />')
      evilBlock.vitalize()

      called.should.be.true

    it 'calls vitalize on subnode', ->
      called = []
      evilBlock '.page', ->
        called.push @block[0].tagName

      fixtures.html('<a class="page" /><span><b class="page" /></span>')
      evilBlock.vitalize($('span'))

      called.should.eql ['B']

    it 'accepts DOM nodes', ->
      called = []
      evilBlock '.page', ->
        called.push @block[0].tagName

      fixtures.html('<a class="page" /><span><b class="page" /></span>')
      evilBlock.vitalize($('#fixtures span'))

      called.should.eql ['B']

  describe '()', ->

    it 'understands function as init', ->
      called = false
      evilBlock '.page', -> called = true

      body '<b class="no-page" />'
      called.should.be.false

      body '<b class="page" />'
      called.should.be.true

    it 'executes callback only if find selector', ->
      called = false
      evilBlock '.page',
        init: ->
          called = true

      body '<b class="no-page" />'
      called.should.be.false

      body '<b class="page" />'
      called.should.be.true

    it 'executes only once on same block', ->
      called = 0
      evilBlock '.page',
        init: ->
          called += 1

      body '<b class="page" />'
      called.should.be.eql(1)

      evilBlock.vitalize fixtures
      called.should.be.eql(1)

      fixtures.append('<a class="page" />')
      evilBlock.vitalize fixtures
      called.should.be.eql(2)

    it 'works with multiple blocks on same node', ->
      called = ''
      evilBlock '.page',
        init: ->
          called += '1'
      evilBlock '.page',
        init: ->
          called += '2'

      body '<b class="page" />'
      called.should.be.eql('12')

      evilBlock.vitalize fixtures
      called.should.be.eql('12')

    it 'creates properties for each role', ->
      prop = false
      evilBlock '.page',
        init: ->
          prop = @roleName

      body '<div class="page"> <b data-role="roleName"/> </div>'
      prop.is('@roleName').should.be.true

    it 'listens block events', ->
      burning = ''
      evilBlock '.page',
        'on fire burn': (e, param) ->
          burning += ' ' + e.type + ' ' + param
        'on ice': ->
          burning += ' ice'

      body '<div class="page"></div>'
      $('.page').trigger('fire', '1').trigger('burn', '2')
      burning.should.eql ' fire 1 burn 2'

    it 'checks source for block events', ->
      burning = ''
      evilBlock '.page',
        'on fire': ->
          burning = '1'

      body '<div class="page"> <b data-role="a"/> </div>'
      $('@a').trigger('fire')
      burning.should.eql('')

    it 'listens elements events', ->
      burning = ''
      evilBlock '.page',
        'fire burn on @a, @b': (e, param) ->
          burning += ' ' + e.el.data('role') + ' ' + param
        'ice on @a': ->
          burning += ' ice'

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
      evilBlock '.page',
        'fire on body': (e, param) ->
          burning = param
        'ice on body': ->
          burning += 'ice'

      body '<div class="page"></div>'
      $('body').trigger('fire', '1')
      burning.should.eql '1'

    it 'listens body bubble events', ->
      burning = ''
      evilBlock '.page',
        'fire on body': ->
          burning = '1'

      body '<div class="page"></div>'
      $('.page').trigger('fire')
      burning.should.eql '1'

    it 'listens window events', ->
      burning = ''
      evilBlock '.page',
        'fire on window': (e, param) ->
          burning = param

      body '<div class="page"></div>'
      $(window).trigger('fire', '1')
      burning.should.eql '1'

    it 'fires event immedently if page already loaded', (done) ->
      burning = false
      evilBlock '.page',
        'load on window': ->
          burning = true

      body '<div class="page"></div>'
      setTimeout( ->
        burning.should.be.true
        done()
      , 10)

    it 'finds inside', ->
      finded = false
      evilBlock '.page',
        init: ->
          finded = @$('b').text()

      body '<div class="page"> <b data-role="role">finded</b> </div>'
      finded.should.eql 'finded'

    it 'has block property', ->
      block = []
      evilBlock '.page', ->
          block.push @block

      body '<div class="page"></div><div class="page"></div>'

      block.length.should.eql(2)
      block[0].length.should.eql(1)
      block[0].is('.page').should.be.true
      block[1].length.should.eql(1)
      block[1].is('.page').should.be.true

    it 'calls init after all bindings', ->
      events = []

      evilBlock '.a',
        init: ->
          $('.b').trigger('fire')
        'on fire': ->
          events.push('a')

      evilBlock '.b',
        init: ->
          $('.a').trigger('fire')
        'on fire': ->
          events.push('b')

      body '<div class="a" /><div class="b" />'
      events.should.eql ['b', 'a']

    it 'prevents to override properties by elements', ->
      value = null
      evilBlock '.page',
        one: 1
        'on fire': ->
          value = @one

      body '<div class="page"><b data-role="one"/></div>'

      $('.page').trigger('fire')
      value.should.eql(1)
