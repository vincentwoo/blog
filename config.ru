require 'rack/contrib/try_static'
require 'rack/contrib/not_found'

use Rack::Deflater

use Rack::TryStatic,
  :urls => %w[/],
  :root => "_site",
  :try  => ['index.html', '/index.html'],
  :header_rules => [
    [:all, {'Cache-Control' => 'public, max-age=86400'}],
  ]

run Rack::NotFound.new('_site/index.html')