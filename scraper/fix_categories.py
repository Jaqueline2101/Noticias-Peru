import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = "https://dyjcskzwgztfzrafefxa.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5amNza3p3Z3p0ZnpyYWZlZnhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTI2ODIsImV4cCI6MjA3OTQ4ODY4Mn0.h24P81bLHQaRDOvSwsRT6c9GiYzfpYcSe6D4xmzLpdc"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

updates = {
    'Politica': 'Política',
    'Economia': 'Economía',
    'Espectaculos': 'Espectáculos',
    'Peru': 'Locales'
}

for old, new in updates.items():
    print(f"Updating {old} -> {new}...")
    supabase.table('noticias').update({'categoria_principal': new}).eq('categoria_principal', old).execute()

print("Done.")
