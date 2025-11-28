# Portal de Noticias Perú

Portal de noticias del Perú con scraping automático de RPP y frontend en Angular.

## 🚀 Estructura del Proyecto

```
portal-noticias-peru/
├── scraper/          # Scraper de noticias (Python)
├── frontend/         # Frontend Angular
└── backend/          # Backend (futuro)
```

## 📋 Requisitos Previos

- Python 3.11+
- Node.js 18+
- Angular CLI 17+
- Cuenta de Supabase

## 🔧 Configuración

### 1. Supabase ya está configurado ✅

- **URL**: `https://unitbhhizdvtvsmplhon.supabase.co`
- **API Key**: Configurada en el código

### 2. Crear tabla en Supabase

Crea una tabla `noticias` con la siguiente estructura:

```sql
CREATE TABLE noticias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  volanta TEXT,
  bajada TEXT,
  contenido TEXT NOT NULL,
  autor TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  url_original TEXT,
  imagen_url TEXT NOT NULL,
  fecha_publicacion TIMESTAMP NOT NULL,
  categoria TEXT NOT NULL,
  medio_comunicacion TEXT NOT NULL,
  medio TEXT,
  idioma TEXT DEFAULT 'es',
  estado TEXT DEFAULT 'activa',
  fecha_scraping TIMESTAMP DEFAULT NOW(),
  pais TEXT DEFAULT 'Perú',
  tipo_contenido TEXT DEFAULT 'noticia',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Configurar Scraper

1. Navega a la carpeta `scraper`:
```bash
cd scraper
```

2. Crea un entorno virtual:
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
# o
source venv/bin/activate  # Linux/Mac
```

3. Instala dependencias:
```bash
pip install -r requirements.txt
```

4. Las credenciales ya están configuradas en el código, no necesitas .env

5. Prueba la conexión:
```bash
python test_supabase_client.py
```

6. Ejecuta el scraper de 2025 (12 noticieros):
```bash
python scraper_noticieros_2025.py
```

Este scraper obtiene noticias de:
- RPP, El Comercio, La República, Gestión, Perú21, Correo, Expreso, Ojo, Exitosa, Andina, El Peruano, y más

### 4. Configurar Frontend Angular

1. Navega a la carpeta `frontend`:
```bash
cd frontend
```

2. Instala dependencias:
```bash
npm install
```

3. Las credenciales ya están configuradas en `src/environments/environment.ts`

4. Ejecuta el servidor de desarrollo:
```bash
npm start
```

5. Abre tu navegador en `http://localhost:4200`

## 📝 Notas Importantes

### Seguridad

- **NUNCA** subas el archivo `.env` al repositorio
- Usa la **Anon Key** en el frontend (pública pero con RLS)
- Usa la **Service Role Key** solo en el backend/scraper (privada)

### Row Level Security (RLS)

En Supabase, configura las políticas RLS para la tabla `noticias`:

```sql
-- Permitir lectura pública
CREATE POLICY "Permitir lectura pública" ON noticias
FOR SELECT USING (true);

-- Permitir inserción solo desde el scraper (con service role key)
-- Esto se maneja automáticamente con la service role key
```

## 🛠️ Scripts Disponibles

### Scraper
- `test_supabase_client.py` - Prueba la conexión con Supabase
- `scraper_supabase_v2.py` - Scraper principal (usa cliente oficial)
- `scraper_supabase.py` - Scraper alternativo (usa psycopg2)

### Frontend
- `npm start` - Servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm test` - Ejecutar tests

## 📚 Tecnologías Utilizadas

- **Backend/Scraper**: Python, BeautifulSoup, Supabase Client
- **Frontend**: Angular 17, TypeScript, Supabase JS
- **Base de Datos**: PostgreSQL (Supabase)

## 🐛 Solución de Problemas

### Error de conexión a Supabase

1. Verifica que las credenciales en `.env` sean correctas
2. Asegúrate de que tu proyecto de Supabase esté activo
3. Verifica las políticas RLS en Supabase
4. Prueba la conexión con `test_supabase_client.py`

### Error en el frontend

1. Verifica que `supabaseKey` esté configurado en `environment.ts`
2. Revisa la consola del navegador para errores
3. Verifica que la tabla `noticias` exista y tenga datos

## 📄 Licencia

Ver archivo LICENSE


