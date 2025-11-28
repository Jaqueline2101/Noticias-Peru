"""
Scraper de noticias peruanas 2025 - Diarios Reconocidos y Regionales Sur
"""
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import time
import re
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import argparse
import json
import sys

# Archivos de control
STATUS_FILE = 'scraper_status.json'
STOP_FLAG = 'stop_scraper.flag'

# Cargar variables de entorno
load_dotenv()

# ====================================================
# CONFIGURACIÓN
# ====================================================
SUPABASE_URL = "https://dyjcskzwgztfzrafefxa.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5amNza3p3Z3p0ZnpyYWZlZnhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTI2ODIsImV4cCI6MjA3OTQ4ODY4Mn0.h24P81bLHQaRDOvSwsRT6c9GiYzfpYcSe6D4xmzLpdc"

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[ERROR] Faltan variables de entorno SUPABASE_URL o SUPABASE_KEY")
    exit()

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Configuración de argumentos
parser = argparse.ArgumentParser(description='Scraper de Noticias')
parser.add_argument('--start-date', type=str, help='Fecha inicio (YYYY-MM-DD)', default=None)
parser.add_argument('--end-date', type=str, help='Fecha fin (YYYY-MM-DD)', default=None)
parser.add_argument('--hoy', action='store_true', help='Escanear solo noticias de hoy (modo rápido)')
args = parser.parse_args()

# Configuración de fechas
START_DATE = None
END_DATE = None

if args.hoy:
    print("[*] MODO HOY ACTIVADO: Escaneando solo noticias del día actual.")
    START_DATE = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    END_DATE = datetime.now().replace(hour=23, minute=59, second=59, microsecond=0)
    MAX_PAGES = 3 # Reducido a 3 para velocidad máxima
else:
    MAX_PAGES = 20 # Profundidad normal

if args.start_date and not args.hoy:
    try:
        START_DATE = datetime.strptime(args.start_date, '%Y-%m-%d')
        print(f"[*] Fecha inicio: {START_DATE.date()}")
    except ValueError:
        print("[!] Formato de fecha inicio inválido.")

if args.end_date and not args.hoy:
    try:
        END_DATE = datetime.strptime(args.end_date, '%Y-%m-%d')
        # Ajustar al final del día
        END_DATE = END_DATE.replace(hour=23, minute=59, second=59)
        print(f"[*] Fecha fin: {END_DATE.date()}")
    except ValueError:
        print("[!] Formato de fecha fin inválido.")

# Si no se especifican fechas, usar hoy por defecto
if not START_DATE:
    START_DATE = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
if not END_DATE:
    END_DATE = datetime.now().replace(hour=23, minute=59, second=59, microsecond=0)

MIN_NOTICIAS = 100 
# MAX_PAGES ya definido arriba

# OPTIMIZACIÓN: Ejecución en paralelo
print(f"[*] Iniciando scraping ultrarrápido con {MAX_PAGES} páginas de profundidad...")

# ====================================================
# LISTA DE MEDIOS SOLICITADOS
# ====================================================
MEDIOS_CONFIG = [
    # NACIONALES
    {"nombre": "El Comercio", "url_base": "https://elcomercio.pe", "tipo": "Nacional", "secciones": ["/politica", "/economia", "/peru", "/deportes"], "paginacion": "/{page}/"},
    {"nombre": "La República", "url_base": "https://larepublica.pe", "tipo": "Nacional", "secciones": ["/politica", "/economia", "/sociedad"], "paginacion": "/{page}/"},
    {"nombre": "Perú21", "url_base": "https://peru21.pe", "tipo": "Nacional", "secciones": ["/politica", "/economia", "/peru"], "paginacion": "/{page}/"},
    {"nombre": "Gestión", "url_base": "https://gestion.pe", "tipo": "Nacional", "secciones": ["/economia", "/finanzas", "/peru"], "paginacion": "/{page}/"},
    {"nombre": "Correo", "url_base": "https://diariocorreo.pe", "tipo": "Nacional", "secciones": ["/politica", "/peru", "/edicion/puno", "/edicion/arequipa"], "paginacion": "/{page}/"},
    {"nombre": "Trome", "url_base": "https://trome.pe", "tipo": "Nacional", "secciones": ["/actualidad", "/deportes", "/espectaculos"], "paginacion": "/{page}/"},
    {"nombre": "Ojo", "url_base": "https://ojo.pe", "tipo": "Nacional", "secciones": ["/actualidad", "/policial", "/ojo-show"], "paginacion": "/{page}/"},
    {"nombre": "Expreso", "url_base": "https://expreso.com.pe", "tipo": "Nacional", "secciones": ["/politica", "/economia", "/actualidad"], "paginacion": "/page/{page}/"},
    {"nombre": "El Peruano", "url_base": "https://elperuano.pe", "tipo": "Nacional", "secciones": ["/noticias"], "paginacion": "?page={page}"},
    
    # REGIONALES SUR
    {"nombre": "Los Andes", "url_base": "https://losandes.com.pe", "tipo": "Regional", "secciones": ["/category/politica", "/category/regional", "/category/sociedad"], "paginacion": "/page/{page}/"},
    {"nombre": "Sin Fronteras", "url_base": "https://diariosinfronteras.pe", "tipo": "Regional", "secciones": ["/category/puno", "/category/arequipa", "/category/tacna"], "paginacion": "/page/{page}/"},
    {"nombre": "El Pueblo", "url_base": "https://elpueblo.com.pe", "tipo": "Regional", "secciones": ["/category/locales", "/category/regionales"], "paginacion": "/page/{page}/"},
]

# ====================================================
# FUNCIONES
# ====================================================
def get_headers():
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
    }

def inicializar_base_datos():
    """Asegura que los medios existan en la DB"""
    print("[*] Verificando medios en la base de datos...")
    for medio in MEDIOS_CONFIG:
        try:
            # Verificar si existe
            res = supabase.table('medios').select('id').eq('nombre', medio['nombre']).execute()
            if not res.data:
                print(f"[+] Creando medio: {medio['nombre']}")
                supabase.table('medios').insert({
                    "nombre": medio['nombre'],
                    "url_base": medio['url_base'],
                    "tipo": medio['tipo'],
                    "activo": True
                }).execute()
        except Exception as e:
            print(f"[ERROR] Al inicializar {medio['nombre']}: {e}")

def obtener_categoria_id(nombre_categoria):
    try:
        # Mapeo simple de categorías comunes
        categorias_map = {
            'politica': 'Política', 'política': 'Política',
            'economia': 'Economía', 'economía': 'Economía', 'finanzas': 'Economía',
            'deportes': 'Deportes', 'futbol': 'Deportes',
            'peru': 'Locales', 'perú': 'Locales', 'sociedad': 'Sociedad', 'actualidad': 'Sociedad',
            'mundo': 'Internacionales', 'internacional': 'Internacionales',
            'espectaculos': 'Espectáculos', 'cine': 'Espectáculos', 'farándula': 'Espectáculos',
            'tecnologia': 'Tecnología', 'ciencia': 'Ciencia',
            'puno': 'Regiones', 'arequipa': 'Regiones', 'tacna': 'Regiones', 'regional': 'Regiones'
        }
        
        nombre_normalizado = nombre_categoria.lower().strip()
        nombre_db = categorias_map.get(nombre_normalizado, 'General')
        
        # Buscar ID en DB
        res = supabase.table('categorias').select('id').ilike('nombre', nombre_db).limit(1).execute()
        if res.data:
            return res.data[0]['id']
        
        # Si no encuentra, buscar 'General' o 'Otras'
        res = supabase.table('categorias').select('id').ilike('nombre', 'General').limit(1).execute()
        if res.data: return res.data[0]['id']
        
        return None
    except:
        return None

def extraer_fecha_de_url(url):
    # Patrones comunes: /2025/11/24/, /2025-11-24/, /24-11-2025/
    match = re.search(r'/(\d{4})/(\d{2})/(\d{2})/', url)
    if match:
        return datetime(int(match.group(1)), int(match.group(2)), int(match.group(3)))
    
    match = re.search(r'/(\d{4})-(\d{2})-(\d{2})', url)
    if match:
        return datetime(int(match.group(1)), int(match.group(2)), int(match.group(3)))
        
    return None

def extraer_contenido(soup, url, medio_nombre):
    # Título
    titulo = None
    for selector in ['h1', '.article-title', '.title', 'meta[property="og:title"]', '.entry-title']:
        if 'meta' in selector:
            elem = soup.select_one(selector)
            if elem: titulo = elem.get('content')
        else:
            elem = soup.select_one(selector)
            if elem: titulo = elem.get_text(strip=True)
        if titulo and len(titulo) > 5: break
    
    if not titulo: return None

    # Imagen
    imagen = None
    banned_terms = ['logo', 'icon', 'favicon', 'default', 'placeholder', 'avatar', 'user', 'profile', 'facebook', 'twitter']
    
    # 1. Buscar en JSON-LD (A veces tiene la imagen de mayor resolución)
    try:
        scripts = soup.find_all('script', type='application/ld+json')
        for script in scripts:
            if script.string:
                data = json.loads(script.string)
                if isinstance(data, list): data = data[0]
                if 'image' in data:
                    if isinstance(data['image'], list): img_candidate = data['image'][0]
                    elif isinstance(data['image'], dict): img_candidate = data['image'].get('url')
                    else: img_candidate = data['image']
                    
                    if img_candidate and isinstance(img_candidate, str) and img_candidate.startswith('http'):
                        if not any(term in img_candidate.lower() for term in banned_terms):
                            imagen = img_candidate
                            break
    except: pass

    # 2. Si no hay JSON-LD, buscar en Meta Tags
    if not imagen:
        for selector in ['meta[property="og:image"]', 'meta[name="twitter:image"]']:
            elem = soup.select_one(selector)
            if elem:
                img_url = elem.get('content')
                if img_url and img_url.startswith('http'):
                    if not any(term in img_url.lower() for term in banned_terms):
                        imagen = img_url
                        break
    
    # 3. Buscar imagen principal del artículo
    if not imagen:
        for selector in ['article img', 'figure img', '.story-content img', '.entry-content img']:
            imgs = soup.select(selector)
            for img in imgs:
                img_url = img.get('src') or img.get('data-src')
                # Filtrar imágenes pequeñas o iconos por nombre
                if img_url and img_url.startswith('http'):
                    if any(term in img_url.lower() for term in banned_terms): continue
                    # Aceptar la primera imagen válida dentro del artículo
                    imagen = img_url
                    break
            if imagen: break
    
    if not imagen:
        imagen = "https://via.placeholder.com/800x400?text=Sin+Imagen"

    # Contenido
    contenido_html = ""
    contenido_texto = ""
    
    article = soup.find('article') or soup.find('div', {'class': 'article-body'}) or soup.find('div', {'class': 'entry-content'}) or soup.find('body')
    
    if article:
        # Limpiar scripts y estilos
        for script in article(["script", "style", "iframe", "form", "button"]):
            script.decompose()
            
        # Extraer HTML limpio (preservando p, h2, h3, ul, li, img, figure)
        # Simplificación: tomar el innerHTML del contenedor principal
        contenido_html = str(article)
        
        # Extraer texto plano
        parrafos = article.find_all(['p', 'h2', 'h3'])
        texto_list = [p.get_text(strip=True) for p in parrafos if len(p.get_text(strip=True)) > 20]
        contenido_texto = "\n\n".join(texto_list)
    
    if len(contenido_texto) < 50: return None

    # Resumen
    resumen = contenido_texto[:200] + "..."
    meta_desc = soup.find('meta', property='og:description') or soup.find('meta', attrs={'name': 'description'})
    if meta_desc:
        resumen = meta_desc.get('content')

    # Fecha
    fecha = datetime.now()
    # Intentar sacar fecha de JSON-LD
    try:
        scripts = soup.find_all('script', type='application/ld+json')
        for script in scripts:
            if script.string:
                data = json.loads(script.string)
                if isinstance(data, list): data = data[0]
                if 'datePublished' in data:
                    fecha_str = data['datePublished']
                    # Truncar zona horaria si es complejo
                    if 'T' in fecha_str:
                        fecha_str = fecha_str.split('T')[0]
                    fecha = datetime.strptime(fecha_str, '%Y-%m-%d')
                    break
    except: pass
    
    # Si no, intentar de URL
    fecha_url = extraer_fecha_de_url(url)
    if fecha_url:
        fecha = fecha_url

    return {
        "titulo": titulo,
        "contenido_completo": contenido_html, # Ahora guardamos HTML
        "texto_plano": contenido_texto,
        "resumen": resumen,
        "fecha_publicacion": fecha.isoformat(),
        "imagen_principal_url": imagen,
        "url_original": url,
        "medio_comunicacion": medio_nombre,
        "estado": "activa",
        "calidad_scraping": 100
    }

def procesar_medio(medio_config):
    print(f"\n--- Procesando {medio_config['nombre']} ---")
    
    # Obtener ID del medio de la DB
    try:
        res = supabase.table('medios').select('id').eq('nombre', medio_config['nombre']).single().execute()
        medio_id = res.data['id']
    except:
        print(f"[ERROR] No se encontró ID para {medio_config['nombre']}")
        return

    urls_procesadas = 0
    consecutive_old_dates = 0
    
    for seccion_path in medio_config['secciones']:
        if check_stop(): return
        consecutive_old_dates = 0 # Reset por sección
        
        for page in range(1, MAX_PAGES + 1):
            if check_stop(): return
            if consecutive_old_dates >= 3:
                print(f"[*] Deteniendo sección {seccion_path} por fechas antiguas.")
                break
                
            # Construir URL con paginación
            if page == 1:
                full_url = medio_config['url_base'] + seccion_path
            else:
                pag_pattern = medio_config.get('paginacion', '/page/{page}/')
                # Manejo especial para patrones
                if pag_pattern.startswith('?'):
                    full_url = medio_config['url_base'] + seccion_path + pag_pattern.format(page=page)
                else:
                    # Asumimos que se añade al final
                    if seccion_path.endswith('/'):
                        full_url = medio_config['url_base'] + seccion_path + pag_pattern.format(page=page).strip('/')
                    else:
                        full_url = medio_config['url_base'] + seccion_path + pag_pattern.format(page=page)
            
            if "http" in seccion_path and page == 1: full_url = seccion_path
            
            try:
                print(f"[*] Escaneando: {full_url}")
                resp = requests.get(full_url, headers=get_headers(), timeout=10)
                if resp.status_code != 200:
                    print(f"[!] Error {resp.status_code} en {full_url}")
                    break # Fin de paginación
                
                soup = BeautifulSoup(resp.text, "html.parser")
                enlaces = soup.find_all('a', href=True)
                
                if not enlaces: break
                
                nuevos_enlaces_en_pagina = 0
                
                for enlace in enlaces:
                    if check_stop(): return
                    url = enlace['href']
                    if url.startswith('/'): url = medio_config['url_base'] + url
                    
                    # Validar dominio
                    if medio_config['url_base'].replace('https://', '').replace('http://', '') not in url: continue
                    
                    # Evitar URLs no noticiosas
                    if any(x in url for x in ['/autor/', '/tag/', '/archivo/', '/login', '/registro', '/suscriptor']): continue

                    # FILTRO RÁPIDO POR URL (si tiene fecha)
                    fecha_url = extraer_fecha_de_url(url)
                    if fecha_url:
                        if fecha_url.date() < START_DATE.date():
                            consecutive_old_dates += 1
                            # print(f"[SKIP] Fecha antigua: {fecha_url.date()}")
                            continue
                        if fecha_url.date() > END_DATE.date():
                            # print(f"[SKIP] Fecha futura/fuera rango: {fecha_url.date()}")
                            continue
                        consecutive_old_dates = 0 # Reset si encontramos una válida

                    try:
                        # VERIFICAR DUPLICADOS (No eliminar, solo saltar)
                        res_exist = supabase.table('noticias').select('id').eq('url_original', url).execute()
                        if res_exist.data:
                            # print(f"[SKIP] Ya existe: {url}")
                            continue

                        # Si no existe, procedemos a extraer
                        # resp_art = requests.get(url, headers=get_headers(), timeout=10) ...

                        resp_art = requests.get(url, headers=get_headers(), timeout=10)
                        soup_art = BeautifulSoup(resp_art.text, "html.parser")
                        
                        data = extraer_contenido(soup_art, url, medio_config['nombre'])
                        if data:
                            # Validar fecha extraída del contenido
                            fecha_art = datetime.fromisoformat(data['fecha_publicacion'])
                            if fecha_art.date() < START_DATE.date():
                                consecutive_old_dates += 1
                                continue
                            if fecha_art.date() > END_DATE.date():
                                continue
                            
                            consecutive_old_dates = 0 # Reset
                            
                            data['medio_id'] = medio_id
                            
                            # Categoría
                            cat_slug = 'general'
                            for s in ['politica', 'economia', 'deportes', 'espectaculos', 'puno', 'arequipa', 'peru', 'mundo', 'tecnologia']:
                                if s in url.lower():
                                    cat_slug = s
                                    break
                            
                            display_map = {
                                'politica': 'Política',
                                'economia': 'Economía',
                                'espectaculos': 'Espectáculos',
                                'deportes': 'Deportes',
                                'puno': 'Regionales',
                                'arequipa': 'Regionales',
                                'peru': 'Locales',
                                'mundo': 'Mundo',
                                'tecnologia': 'Tecnología'
                            }
                            
                            cat_id = obtener_categoria_id(cat_slug)
                            if cat_id:
                                data['categoria_id'] = cat_id
                            
                            data['categoria_principal'] = display_map.get(cat_slug, cat_slug.capitalize())
                            
                            supabase.table('noticias').insert(data).execute()
                            print(f"[NUEVA] {data['titulo'][:50]}...")
                            urls_procesadas += 1
                            nuevos_enlaces_en_pagina += 1
                            time.sleep(0.05) # Ultrarrápido
                    except Exception as e:
                        # print(f"[ERROR] Procesando noticia: {e}")
                        pass
                
                if nuevos_enlaces_en_pagina == 0 and consecutive_old_dates > 10:
                    print("[*] No se encontraron noticias relevantes en esta página y hay muchas antiguas.")
                    break

            except Exception as e:
                print(f"[ERROR] Sección {seccion_path}: {e}")
                break

def update_status(progress, message, status="running"):
    try:
        with open(STATUS_FILE, 'w') as f:
            json.dump({
                "progress": progress,
                "message": message,
                "status": status,
                "timestamp": datetime.now().isoformat()
            }, f)
    except Exception as e:
        print(f"[ERROR] Actualizando estado: {e}")

def check_stop():
    if os.path.exists(STOP_FLAG):
        print("[!] Detención solicitada por el usuario.")
        update_status(0, "Detenido por el usuario", "stopped")
        try:
            os.remove(STOP_FLAG)
        except: pass
        return True
    return False

if __name__ == "__main__":
    # Limpiar flag anterior
    if os.path.exists(STOP_FLAG):
        try:
            os.remove(STOP_FLAG)
        except: pass
        
    update_status(0, "Iniciando scraper...", "running")
    
    inicializar_base_datos()
    
    if check_stop(): exit()
    
    from concurrent.futures import ThreadPoolExecutor
    
    print(f"[*] Procesando {len(MEDIOS_CONFIG)} medios en PARALELO...")
    update_status(5, "Iniciando hilos de procesamiento...", "running")
    
    total_medios = len(MEDIOS_CONFIG)
    medios_completados = 0
    
    def procesar_wrapper(medio):
        if check_stop(): return
        procesar_medio(medio)
        
    # No podemos usar map simple si queremos trackear progreso granular fácilmente sin complejidad
    # Usaremos submit y as_completed
    from concurrent.futures import as_completed
    
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = {executor.submit(procesar_wrapper, medio): medio for medio in MEDIOS_CONFIG}
        
        for future in as_completed(futures):
            if check_stop(): 
                executor.shutdown(wait=False, cancel_futures=True)
                break
                
            medios_completados += 1
            progress = 5 + int((medios_completados / total_medios) * 90) # 5% a 95%
            medio_nombre = futures[future]['nombre']
            update_status(progress, f"Completado: {medio_nombre}", "running")
            
    if not check_stop():
        update_status(100, "Finalizado correctamente", "completed")
        print("[*] Scraper finalizado.")
