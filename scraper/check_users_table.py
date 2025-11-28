import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = "https://dyjcskzwgztfzrafefxa.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5amNza3p3Z3p0ZnpyYWZlZnhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTI2ODIsImV4cCI6MjA3OTQ4ODY4Mn0.h24P81bLHQaRDOvSwsRT6c9GiYzfpYcSe6D4xmzLpdc"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Checking users table...")
try:
    # Try to insert a dummy row to see if it works or fails with column error
    # We won't actually commit if we can avoid it, or we'll delete it.
    # Actually, just fetching 1 row is safer to check existence.
    response = supabase.table('users').select("*").limit(1).execute()
    print("Table exists.")
    if response.data:
        print("Sample row:", response.data[0])
    else:
        print("Table is empty.")
        
    # Try to see columns by inserting a dummy with all expected fields
    # If a column is missing, it will error.
    try:
        dummy = {
            "email": "test_schema@check.com",
            "nombre": "Test Schema",
            "role": "free"
        }
        # We don't execute this, just printing what we WOULD do. 
        # Actually, to be sure, let's try to insert and then delete.
        print("Attempting insert test...")
        res = supabase.table('users').insert(dummy).execute()
        print("Insert successful:", res.data)
        # Cleanup
        supabase.table('users').delete().eq("email", "test_schema@check.com").execute()
    except Exception as e:
        print(f"Insert failed (schema mismatch?): {e}")

except Exception as e:
    print(f"Table check failed: {e}")
