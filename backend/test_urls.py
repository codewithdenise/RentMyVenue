#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.urls import get_resolver
from django.conf import settings

def show_urls(urllist, depth=0):
    for entry in urllist:
        print("  " * depth, entry.pattern, entry.callback if hasattr(entry, 'callback') else 'URLconf')
        if hasattr(entry, 'url_patterns'):
            show_urls(entry.url_patterns, depth + 1)

print("Available URL patterns:")
resolver = get_resolver()
show_urls(resolver.url_patterns)
