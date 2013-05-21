=begin
Copyright 2013 Andrey “A.I.” Sitnik <andrey@sitnik.ru>,
sponsored by Evil Martians.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
=end

module EvilBlocks
  # Change Slim options to support @data-role shortcut.
  def self.install_to_slim!
    # Add @data-role alias to Slim.
    #
    # Copy from role-rails by Sasha Koss.
    # https://github.com/kossnocorp/role-rails
    Slim::Parser.default_options[:shortcut]['@'] = { :attr => 'data-role' }
    Slim::Engine.default_options[:merge_attrs]['data-role'] = ' '
  end

  # Add assets paths to standalone Sprockets environment.
  def self.install(sprockets)
    sprockets.append_path(Pathname(__FILE__).dirname.join('assets/javascripts'))
  end

  if defined? ::Rails
    # Tell Ruby on Rails to add `evil-block.js` to Rails Admin load paths.
    class Engine < ::Rails::Engine
      initializer 'evil-front.slim' do
        EvilBlocks.install_to_slim! if defined?(Slim::Parser)
      end
    end
  end
end
