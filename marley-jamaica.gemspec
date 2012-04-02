# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{marley-jamaica}
  s.version = "0.0.4"
  s.summary = %q{Jamaica Reggae client with library for Marley}
  s.description = %q{A simple client for the Reggae data interchange format}
  s.authors     = ["Herb Daily"]
  s.email       = 'herb.daily@safe-mail.net'
  s.homepage    = 'http://github.com/herbdaily/jamaica'
  s.required_rubygems_version = Gem::Requirement.new(">= 1.0.0") if s.respond_to? :required_rubygems_version=
  s.add_runtime_dependency 'marley', '~>0.7.0'
  s.files = Dir.glob(["README.*","lib/**/*"])
end
