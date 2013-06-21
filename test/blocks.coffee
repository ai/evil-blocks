evil = window.evil
body = (html) -> $('#fixtures').html(html)

describe 'evil.block', ->

  it 'should add role alias', ->
    body '<b data-role="role-test" />' +
         '<b data-role="multi one" />' +
         '<b data-role="multi" />'
    $('@role-test').length.should.eql(1)
    $('@multi').length.should.eql(2)

  it 'should execute callback only if find selector', ->
    body '<b class="no-page" />'
    called = false
    evil.block '.page', -> called = true

    called.should.be.false

    body '<b class="page" />'
    evil.block '.page', -> called = true

    called.should.be.true

  it 'should execute objects of functions', ->
    called = ''
    body '<b class="page" />'
    evil.block '.page', ->
      initA: ->
        called += 'a'
      initB: ->
        called += 'b'

    called.should.eql('ab')

  it 'should send jQuery and page', ->
    body '<b class="page" />'
    args = []
    evil.block '.page', ->
      args = arguments
      false

    args[0].should.eql(jQuery)
    args[2].should.eql($ $('.page').get(0))

  it 'should send b function', ->
    body '<b class="page">' +
           '<a class="b" data-role="link" /><a data-role="link" />' +
         '</b><a data-role="link" />'
    b = null
    evil.block '.page', ($, _b) -> b = _b

    b('a').length.should.eql(2)
    b.link.length.should.eql(2)

  it 'should came case role name', ->
    body '<b class="page"><a data-role="camel-case-role" /></b>'
    b = null
    evil.block '.page', ($, _b) -> b = _b

    b.camelCaseRole.length.should.eql(1)

  it 'should call on every finded block', ->
    body '<b class="page" /><b class="page" />'
    blocks = []
    evil.block '.page', ($, b, block)-> blocks.push(block)

    blocks.should.eql ($ el for el in $ '.page')

  it 'should properly find elems inside', ->
    body """
      <div class="page"> <b data-role="elem"/> </div>
      <div class="page"> <b data-role="elem"/> </div>
    """

    bs     = []
    blocks = []
    evil.block '.page', ($, b, block) ->
      bs.push b
      blocks.push block

    bs[0]('@elem').should.eql blocks[0].find('@elem')
    bs[1]('@elem').should.eql blocks[1].find('@elem')
