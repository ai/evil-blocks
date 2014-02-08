require_relative '../ruby/evil-blocks-rails'

require 'slim'
EvilBlocks.install_to_slim!

describe 'Slim hack' do

  it 'adds @dataRole alias' do
    Slim::Template.new { '.name@nameField' }.render.should ==
      '<div class="name" data-role="nameField"></div>'
  end

end
