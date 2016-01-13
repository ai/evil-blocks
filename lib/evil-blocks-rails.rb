module EvilBlocks
  # Change Slim options to support @data-role shortcut.
  def self.install_to_slim!
    # Add @data-role alias to Slim.
    #
    # Copy from role-rails by Sasha Koss.
    # https://github.com/kossnocorp/role-rails
    shortcut = Slim::Parser.options[:shortcut]
    shortcut['@']  = { attr: 'data-role' }
    shortcut['@@'] = { attr: 'data-block' }
    Slim::Engine.options[:merge_attrs]['data-role']  = ' '
    Slim::Engine.options[:merge_attrs]['data-block'] = ' '
  end

  # Add assets paths to standalone Sprockets environment.
  def self.install(sprockets)
    sprockets.paths << Pathname(__FILE__).dirname
  end

  if defined? ::Rails
    class Engine < ::Rails::Engine
      initializer 'evil-blocks' do |app|
        EvilBlocks.install(app.config.assets)
        EvilBlocks.install_to_slim! if defined?(Slim::Parser)
      end
    end
  end
end
