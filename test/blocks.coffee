evil     = window.evil
body     = (html) -> evil.block.vitalize fixtures.html(html)
fixtures = null

describe 'evil.block', ->
  before -> fixtures = $('#fixtures')

  afterEach ->
    fixtures.html('')
    evil.block.vitalizers = []

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

  describe '.eventFilter', ->
    originFilter = evil.block.eventFilter
    after -> evil.block.eventFilter = originFilter

    it 'filters blocks events', ->
      fired = []
      evil.block.eventFilter = (callback, block, event) ->
        block.block.is('.a').should.be.true
        fired.push event
        callback

      evil.block '.a',
        'on fire': ->
      body '<div class="a" />'

      fired.should.eql ['on fire']

  describe '.vitalize()', ->

    it 'calls vitalize on document by default', ->
      called = false
      evil.block '.page', ->
        called = true

      fixtures.html('<b class="page" />')
      evil.block.vitalize()

      called.should.be.true

    it 'calls vitalize on subnode', ->
      called = []
      evil.block '.page', ->
        called.push @block[0].tagName

      fixtures.html('<a class="page" /><span><b class="page" /></span>')
      evil.block.vitalize($('span'))

      called.should.eql ['B']

    it 'accepts DOM nodes', ->
      called = []
      evil.block '.page', ->
        called.push @block[0].tagName

      fixtures.html('<a class="page" /><span><b class="page" /></span>')
      evil.block.vitalize($('#fixtures span'))

      called.should.eql ['B']

  describe '()', ->

    it 'understands function as init', ->
      called = false
      evil.block '.page', -> called = true

      body '<b class="no-page" />'
      called.should.be.false

      body '<b class="page" />'
      called.should.be.true

    it 'executes callback only if find selector', ->
      called = false
      evil.block '.page',
        init: ->
          called = true

      body '<b class="no-page" />'
      called.should.be.false

      body '<b class="page" />'
      called.should.be.true

    it 'executes only once on same block', ->
      called = 0
      evil.block '.page',
        init: ->
          called += 1

      body '<b class="page" />'
      called.should.be.eql(1)

      evil.block.vitalize fixtures
      called.should.be.eql(1)

      fixtures.append('<b class="page" />')
      evil.block.vitalize fixtures
      called.should.be.eql(2)

    it 'creates properties for each role', ->
      prop = false
      evil.block '.page',
        init: ->
          prop = @roleName

      body '<div class="page"> <b data-role="roleName"/> </div>'
      prop.is('@roleName').should.be.true

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
        'fire burn on @a, @b': (e, param) ->
          burning += ' ' + e.el.data('role') + ' ' + param

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
          finded = @$('b').text()

      body '<div class="page"> <b data-role="role">finded</b> </div>'
      finded.should.eql 'finded'

    it 'has block property', ->
      block = []
      evil.block '.page', ->
          block.push @block

      body '<div class="page"></div><div class="page"></div>'

      block.length.should.eql(2)
      block[0].length.should.eql(1)
      block[0].is('.page').should.be.true
      block[1].length.should.eql(1)
      block[1].is('.page').should.be.true

    it 'calls init after all bindings', ->
      events = []

      evil.block '.a',
        init: ->
          $('.b').trigger('fire')
        'on fire': ->
          events.push('a')

      evil.block '.b',
        init: ->
          $('.a').trigger('fire')
        'on fire': ->
          events.push('b')

      body '<div class="a" /><div class="b" />'
      events.should.eql ['b', 'a']
