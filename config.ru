until File.exist? '_site/404.html'
  sleep 1
end

require 'rack/contrib/try_static'
require 'rack/contrib/not_found'

rules = []

if ENV['RACK_ENV'] == 'production'
  require 'newrelic_rpm'
  NewRelic::Agent.after_fork(:force_reconnect => true)
  rules = [
    [%w(html),            {'Cache-Control' => 'public, max-age=0'}],
    [%w(css js ico gif jpg png pdf), {'Cache-Control' => 'public, max-age=604800'}]
  ];
end

use Rack::Deflater

use Rack::TryStatic,
  :urls => %w[/],
  :root => "_site",
  :try  => ['index.html', '/index.html'],
  :header_rules => rules

run Rack::NotFound.new('_site/404.html')
