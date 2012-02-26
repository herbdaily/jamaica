module Marley
  class Client
    # Here we define the Jamaica client class for Marley.  This client
    # is a simple HTML page that is intended to be run in a browser.
    # It will have its actual UI metadata in the global variable '_jamaica_json'
    # and onDocumentReady, this will be turned into the client UI.
    def initialize(opts={})
      @opts={:app_name => 'Application',:css => '', :js => ''}.merge(opts)
      @client_dir="#{File.dirname(__FILE__)}/client/"
      @libs = Dir.glob("#{@client_dir}*.js")
      @styles = [ 'jamaica.css' ]
    end
    def joint(joint_d,joint_name)
      [:css,:js].each do |ext|
        fn="#{joint_d}#{joint_name}.#{ext.to_s}"
        File.exists?(fn) && send(ext,File.new(fn,"r").read)
      end
    end
    def css(add_css=nil)
      @opts[:css]+=add_css if add_css
      @opts[:css]
    end
    def js(add_js=nil)
      @opts[:js]+=add_js if add_js
      @opts[:js]
    end
    def to_s(json='')
      <<-EOHTML
      <head>
        <title>#{@opts[:app_name]}</title>
        <script type='text/javascript'>var _jamaica_json=#{json}; #{ @libs.map{ |l| File.new(l).read }.push(@opts[:js]).join("\n") }</script>
        <style>#{ @styles.map{ |s| File.new("#{@client_dir}#{s}").read }.push(@opts[:css]).join("\n") }
      </head>
      <body></body>
      EOHTML
    end
  end
end
