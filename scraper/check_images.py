import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = "https://dyjcskzwgztfzrafefxa.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5amNza3p3Z3p0ZnpyYWZlZnhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTI2ODIsImV4cCI6MjA3OTQ4ODY4Mn0.h24P81bLHQaRDOvSwsRT6c9GiYzfpYcSe6D4xmzLpdc"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

response = supabase.table('noticias').select('titulo, imagen_principal_url, medio_comunicacion').order('fecha_publicacion', desc=True).limit(10).execute()

print(f"{'MEDIO':<20} | {'TITULO':<40} | {'IMAGEN URL'}")
print("-" * 100)
for noticia in response.data:
    titulo = (noticia['titulo'][:37] + '...') if len(noticia['titulo']) > 37 else noticia['titulo']
    print(f"{noticia['medio_comunicacion']:<20} | {titulo:<40} | {noticia['imagen_principal_url']}")
