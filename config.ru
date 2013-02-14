require 'rack/contrib/try_static'
require 'rack/contrib/not_found'

use Rack::TryStatic,
  :urls => %w[/],
  :root => "_site",
  :try  => ['index.html', '/index.html']

run Rack::NotFound.new('_site/index.html')