require 'rack/contrib/try_static'
require 'rack/contrib/not_found'

if ENV['RACK_ENV'] == 'production'
  require 'newrelic_rpm'
  NewRelic::Agent.after_fork(:force_reconnect => true)
end

use Rack::Deflater

use Rack::TryStatic,
  :urls => %w[/],
  :root => "_site",
  :try  => ['index.html', '/index.html'],
  :header_rules => [
    [%w(css js), {'Cache-Control' => 'public, max-age=86400'}],
    [%w(ico gif jpg png), {'Cache-Control' => 'public, max-age=604800'}]
  ]

run Rack::NotFound.new('_site/index.html')