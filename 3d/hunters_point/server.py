from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer

class CORSRequestHandler (SimpleHTTPRequestHandler):
    def end_headers (self):
        self.send_header('Access-Control-Allow-Origin', '*')
        SimpleHTTPRequestHandler.end_headers(self)


def run():
    Handler = CORSRequestHandler
    Handler.extensions_map = {'.mjs': 'application/javascript'}
    with TCPServer(('', 8000), Handler) as httpd:
        httpd.serve_forever()


if __name__ == '__main__':
    run()