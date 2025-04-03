import os
import sys
import django
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

if __name__ == '__main__':
    from daphne.cli import CommandLineInterface
    sys.exit(CommandLineInterface().run(['-b', '0.0.0.0', '-p', '8000', 'backend.asgi:application'])) 