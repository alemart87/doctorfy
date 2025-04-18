#!/usr/bin/env python3
"""
Genera un sitemap.xml estático para el frontend.

Se lee la misma lógica del endpoint Flask pero escribiendo el archivo
a frontend/public/sitemap.xml; de esa forma Render/Vercel/Netlify lo
servirán directamente sin pasar por el backend.
"""
import os, json, datetime as dt
from xml.etree.ElementTree import Element, SubElement, tostring
try:
    # intentamos cargar create_app y la BD sólo si están disponibles
    from app import create_app
    from models import db, User
except Exception as e:
    create_app = None      # el build seguirá aunque no haya BD
    User = None

BASE_URL = os.getenv("BASE_URL", "https://www.doctorfy.app").rstrip("/")

def build_sitemap():
    doctors = []
    if create_app and User:
        app = create_app()
        with app.app_context():
            doctors = list(User.query.filter_by(is_doctor=True).limit(200))

    urlset = Element('urlset', xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")
    today  = dt.date.today().isoformat()

    static_urls = [
        '/', '/login', '/register', '/forgot-password',
        '/guide', '/doctors', '/nutrition', '/subscription'
    ]

    for path in static_urls:
        url = SubElement(urlset, 'url')
        SubElement(url, 'loc').text        = BASE_URL + path
        SubElement(url, 'lastmod').text    = today
        SubElement(url, 'changefreq').text = 'monthly'
        SubElement(url, 'priority').text   = '0.8'

    # añadir perfiles de doctor sólo si los pudimos leer
    for doc in doctors:
        url = SubElement(urlset, 'url')
        SubElement(url, 'loc').text        = f"{BASE_URL}/doctors/{doc.id}"
        SubElement(url, 'lastmod').text    = today
        SubElement(url, 'changefreq').text = 'weekly'
        SubElement(url, 'priority').text   = '0.6'

    xml_bytes = tostring(urlset, encoding='utf-8', method='xml')
    public_path = os.path.join(os.getcwd(), 'frontend', 'public', 'sitemap.xml')
    os.makedirs(os.path.dirname(public_path), exist_ok=True)
    with open(public_path, 'wb') as f:
        f.write(xml_bytes)
    print(f"Sitemap generado en {public_path}")

if __name__ == "__main__":
    build_sitemap()