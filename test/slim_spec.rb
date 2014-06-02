require_relative '../lib/evil-blocks-rails'

require 'slim'
EvilBlocks.install_to_slim!

describe 'Slim hack' do

  it 'adds @dataRole alias' do
    expect(Slim::Template.new { '.name@nameField' }.render).to eq(
      '<div class="name" data-role="nameField"></div>')
  end

  it 'supports multiple roles' do
    expect(Slim::Template.new { '@a@b' }.render).to eq(
      '<div data-role="a b"></div>')
  end

  it 'adds @@dataBlock alias' do
    expect(Slim::Template.new { '.name@@control' }.render).to eq(
      '<div class="name" data-block="control"></div>')
  end

  it 'supports multiple bloks' do
    expect(Slim::Template.new { '@@a@@b' }.render).to eq(
      '<div data-block="a b"></div>')
  end

end
