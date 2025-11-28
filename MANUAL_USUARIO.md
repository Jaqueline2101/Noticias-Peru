# 📘 Manual de Usuario - Portal de Noticias Perú

Bienvenido al **Portal de Noticias Perú**. Este sistema te permite leer noticias actualizadas de los principales medios del país en un solo lugar, con funciones avanzadas de búsqueda y filtrado.

## 1. Acceso al Portal

1.  Abre tu navegador web (Chrome, Firefox, Edge).
2.  Ingresa a la dirección del portal (por defecto: `http://localhost:4200`).
3.  Verás la **Página de Inicio** con las noticias más recientes.

## 2. Navegación y Lectura

### Página Principal
- **Noticias Destacadas**: Las noticias más importantes aparecen en la parte superior.
- **Grid de Noticias**: Debajo encontrarás todas las noticias ordenadas por fecha (las más nuevas primero).
- **Tarjetas**: Cada tarjeta muestra el título, una imagen, el medio de origen y la fecha.

### Leer una Noticia
1.  Haz clic en el título o la imagen de cualquier tarjeta.
2.  Se abrirá la **Vista Detallada** con el contenido completo, autor y fecha.
3.  Si la noticia es original de otro medio, verás un enlace para "Ver fuente original".

### Filtrar Noticias
En la barra lateral o menú superior puedes filtrar por:
- **Categoría**: Política, Economía, Deportes, Espectáculos, etc.
- **Medio**: El Comercio, La República, RPP, etc.
- **Búsqueda**: Usa la barra de búsqueda para encontrar temas específicos (ej: "Congreso", "Fútbol").

## 3. Suscripciones (Premium)

Algunas noticias son exclusivas para usuarios Premium.
1.  Si intentas leer una noticia Premium sin suscripción, verás parte del contenido borroso.
2.  Haz clic en **"Suscribirse"**.
3.  Elige un plan (Mensual o Anual).
4.  Completa el pago (simulado).
5.  ¡Listo! Ahora tienes acceso ilimitado.

## 4. Panel de Administración (Solo Administradores)

Si tienes cuenta de administrador, puedes acceder al Dashboard para gestionar el contenido.

### Ingreso
1.  Ve a `/login`.
2.  Ingresa tus credenciales de administrador.
3.  Serás redirigido al **Panel Admin**.

### Funciones del Dashboard
- **Estadísticas**: Verás gráficos de noticias por categoría, medio, tendencias, etc.
- **Extraer Noticias (Scraper)**:
    1.  Haz clic en el botón rojo **"🔄 Extraer Noticias de Hoy"**.
    2.  Verás una **barra de progreso** que indica el avance.
    3.  Si necesitas detenerlo, presiona **"⛔ Detener"**.
    4.  Las noticias nuevas aparecerán automáticamente en el portal.
- **Reportes**:
    1.  Haz clic en **"📥 Descargar Reporte"**.
    2.  Se descargará un archivo Excel con el listado de noticias recientes.

## 5. Solución de Problemas Comunes

- **No cargan las noticias**: Verifica tu conexión a internet y recarga la página.
- **El scraper no avanza**: Puede que la conexión a internet sea lenta o un medio esté bloqueando el acceso. Intenta detenerlo y ejecutarlo de nuevo más tarde.
- **Imágenes rotas**: Algunas veces los medios originales borran o bloquean sus imágenes. El sistema intentará poner una imagen por defecto.
