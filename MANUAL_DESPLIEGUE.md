# 🛠️ Manual de Despliegue - Portal de Noticias Perú

Este documento detalla los pasos técnicos para instalar, configurar y ejecutar el proyecto en un entorno local o servidor.

## Requisitos Previos

- **Node.js**: v18 o superior.
- **Python**: v3.10 o superior.
- **Git**: Para clonar el repositorio.
- **Cuenta en Supabase**: Base de datos y autenticación.

## 1. Clonar el Repositorio

```bash
git clone https://github.com/Jaqueline2101/Noticias-Peru.git
cd Noticias-Peru
```

## 2. Configuración del Backend (Scraper)

El backend se encarga de la extracción de noticias y sirve la API de control.

1.  **Navegar a la carpeta**:
    ```powershell
    cd scraper
    ```

2.  **Crear entorno virtual**:
    ```powershell
    python -m venv venv
    ```

3.  **Activar entorno virtual**:
    ```powershell
    # Windows
    .\venv\Scripts\Activate
    ```

4.  **Instalar dependencias**:
    ```powershell
    pip install -r requirements.txt
    ```

5.  **Configurar variables de entorno**:
    - Crea un archivo `.env` en la carpeta `scraper`.
    - Agrega tus credenciales de Supabase:
      ```env
      SUPABASE_URL=tu_url_de_supabase
      SUPABASE_KEY=tu_api_key_de_supabase
      ```

6.  **Ejecutar el servidor API**:
    ```powershell
    python api_server.py
    ```
    *El servidor correrá en `http://localhost:5000`.*

## 3. Configuración del Frontend (Angular)

La interfaz de usuario está construida con Angular 17.

1.  **Navegar a la carpeta**:
    ```powershell
    cd frontend
    ```

2.  **Instalar dependencias**:
    ```powershell
    npm install
    ```

3.  **Configurar entorno**:
    - Verifica `src/environments/environment.ts`.
    - Asegúrate de que `supabaseUrl` y `supabaseKey` coincidan con tu proyecto.

4.  **Ejecutar servidor de desarrollo**:
    ```powershell
    npm start
    ```
    *La aplicación estará disponible en `http://localhost:4200`.*

## 4. Base de Datos (Supabase)

El proyecto requiere las siguientes tablas en Supabase:

- `noticias`: Almacena los artículos extraídos.
- `medios`: Lista de diarios configurados.
- `categorias`: Categorías de noticias.
- `suscripciones`: Usuarios suscritos.

*(El script `fix_database.sql` en la raíz contiene las definiciones necesarias si necesitas recrearlas).*

## 5. Comandos Útiles

- **Ejecutar Scraper manualmente**:
  ```powershell
  cd scraper
  python scraper_noticieros_2025.py --hoy
  ```

- **Generar build de producción (Frontend)**:
  ```powershell
  cd frontend
  npm run build
  ```
  *Los archivos generados estarán en `frontend/dist/portal-noticias-peru`.*
