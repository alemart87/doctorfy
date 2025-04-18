#!/usr/bin/env python3
"""
Genera frontend/public/sitemap.xml con:
  • URLs estáticas
  • Entradas de blog (POSTS del módulo blog)
  • Primeros 200 doctores de la BD
"""
import os, datetime as dt
from xml.etree.ElementTree import Element, SubElement, tostring

# ── BASE URL ─────────────────────────────────────────────────────
BASE_URL = os.getenv("BASE_URL", "https://www.doctorfy.app").rstrip("/")

# ── INTENTAR CARGAR BACKEND (opcional durante el build) ─────────
try:
    from app import create_app
    from models import db, User
    from routes.blog import POSTS          # lista in‑memory del módulo blog
    APP = create_app()
except Exception:
    APP = None
    User = None
    POSTS = []

def url_el(urlset, loc, lastmod, change='monthly', prio='0.8'):
    url = SubElement(urlset, 'url')
    SubElement(url, 'loc').text        = loc
    SubElement(url, 'lastmod').text    = lastmod
    SubElement(url, 'changefreq').text = change
    SubElement(url, 'priority').text   = prio
    return url

def build_sitemap():
    today = dt.date.today().isoformat()
    urlset = Element('urlset', xmlns="http://www.sitemaps.org/schemas/sitemap/0.9")

    # 1️⃣ URLs estáticas
    static_paths = [
        '/', '/login', '/register', '/forgot-password',
        '/guide', '/nutrition', '/doctors',
        '/subscription', '/blog', '/medical-studies'
    ]
    for path in static_paths:
        url_el(urlset, f"{BASE_URL}{path}", today)

    # 2️⃣ Entradas de blog cargadas desde routes.blog.POSTS
    for post in POSTS:
        url_el(urlset, f"{BASE_URL}/blog/{post['slug']}", today, 'weekly', '0.7')

    # 3️⃣ Perfiles de doctor (hasta 200) si hay conexión a BD
    if APP and User:
        with APP.app_context():
            for doc in User.query.filter_by(is_doctor=True).limit(200):
                url_el(urlset, f"{BASE_URL}/doctors/{doc.id}", today, 'weekly', '0.6')

    # — guardar —
    xml_path = os.path.join(os.getcwd(), 'frontend', 'public', 'sitemap.xml')
    os.makedirs(os.path.dirname(xml_path), exist_ok=True)
    with open(xml_path, 'wb') as f:
        f.write(tostring(urlset, encoding='utf-8', method='xml'))
    print(f"Sitemap generado en {xml_path}")

if __name__ == "__main__":
    build_sitemap()