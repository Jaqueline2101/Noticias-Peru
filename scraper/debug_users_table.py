import os
from dotenv import load_dotenv
from supabase import create_client, Client
import time

load_dotenv()

SUPABASE_URL = "https://dyjcskzwgztfzrafefxa.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5amNza3p3Z3p0ZnpyYWZlZnhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTI2ODIsImV4cCI6MjA3OTQ4ODY4Mn0.h24P81bLHQaRDOvSwsRT6c9GiYzfpYcSe6D4xmzLpdc"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("--- DIAGNOSTIC START ---")

# 1. Check if table exists by selecting
try:
    print("Attempting to SELECT from 'usuarios'...")
    res = supabase.table('usuarios').select("*").limit(1).execute()
    print(f"SELECT success. Count: {len(res.data)}")
except Exception as e:
    print(f"SELECT failed: {e}")

# 2. Try to INSERT a dummy row
try:
    print("\nAttempting to INSERT into 'usuarios'...")
    # Note: This might fail if RLS requires auth.uid() which we don't have here (we are anon).
    # But the error message will be telling.
    dummy = {
        "email": "debug@test.com",
        "nombre": "Debug",
        "role": "free"
    }
    res = supabase.table('usuarios').insert(dummy).execute()
    print("INSERT success!")
except Exception as e:
    print(f"INSERT failed: {e}")

print("\n--- DIAGNOSTIC END ---")
