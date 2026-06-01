import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from a2wsgi import ASGIMiddleware
from server import app as asgi_app
application = ASGIMiddleware(asgi_app)