require_relative '../ruby/evil-blocks-rails'

require 'slim'
EvilBlocks.install_to_slim!

describe 'Slim hack' do

  it 'adds @dataRole alias' do
    Slim::Template.new { '.name@nameField' }.render.should ==
      '<div class="name" data-role="nameField"></div>'
  end

  it 'supports multiple roles' do
    Slim::Template.new { '@a@b' }.render.should == '<div data-role="a b"></div>'
  end

  it 'adds @@dataBlock alias' do
    Slim::Template.new { '.name@@control' }.render.should ==
      '<div class="name" data-block="control"></div>'
  end

  it 'supports multiple bloks' do
    Slim::Template.new { '@@a@@b' }.render.should ==
      '<div data-block="a b"></div>'
  end

end
