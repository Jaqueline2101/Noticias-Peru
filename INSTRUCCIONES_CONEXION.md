# 🔌 Instrucciones para Conectar con Supabase

## Problema Resuelto ✅

Se ha mejorado la conexión con Supabase usando el **cliente oficial de Supabase** en lugar de conexiones directas a PostgreSQL. Esto es más confiable y fácil de configurar.

## 📋 Pasos para Configurar

### 1. Obtener Credenciales de Supabase

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com)
2. Ve a **Settings > API**
3. Copia:
   - **Project URL**: `https://tu-proyecto.supabase.co`
   - **service_role key**: Para el scraper (privada, no la compartas)
   - **anon/public key**: Para el frontend (pública)

### 2. Configurar el Scraper (Python)

1. **Instala el cliente de Supabase**:
```bash
cd scraper
pip install supabase
```

2. **Crea/edita el archivo `.env`**:
```env
SUPABASE_URL=https://unitbhhizdvtvsmplhon.supabase.co
SUPABASE_KEY=tu_service_role_key_aqui
```

3. **Prueba la conexión**:
```bash
python test_supabase_client.py
```

Si funciona, verás: `[OK] CONEXION EXITOSA A SUPABASE!`

### 3. Configurar el Frontend (Angular)

1. **Edita `frontend/src/environments/environment.ts`**:
```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://unitbhhizdvtvsmplhon.supabase.co',
  supabaseKey: 'tu_anon_key_aqui'  // Usa la anon key, NO la service role
};
```

2. **Instala dependencias**:
```bash
cd frontend
npm install
```

3. **Ejecuta el frontend**:
```bash
npm start
```

## 🔍 Verificar que Funciona

### Scraper
```bash
cd scraper
python test_supabase_client.py
```

Deberías ver:
```
[OK] CONEXION EXITOSA A SUPABASE!
[OK] Tabla 'noticias' accesible
```

### Frontend
1. Abre `http://localhost:4200`
2. Deberías ver las noticias cargándose desde Supabase
3. Si hay error, revisa la consola del navegador (F12)

## ⚠️ Problemas Comunes

### Error: "Invalid API key"
- Verifica que copiaste la clave correcta
- Para el scraper usa: **service_role key**
- Para el frontend usa: **anon/public key**

### Error: "relation 'noticias' does not exist"
- Crea la tabla `noticias` en Supabase (ver README.md)
- O verifica que el nombre de la tabla sea correcto

### Error: "new row violates row-level security policy"
- Ve a Supabase Dashboard > Authentication > Policies
- Crea una política que permita lectura pública:
```sql
CREATE POLICY "Permitir lectura pública" ON noticias
FOR SELECT USING (true);
```

### El frontend no muestra noticias
1. Verifica que hay datos en la tabla `noticias`
2. Revisa la consola del navegador (F12) para errores
3. Verifica que `supabaseKey` esté correcto en `environment.ts`

## 📞 Soporte

Si sigues teniendo problemas:
1. Revisa los logs del scraper
2. Revisa la consola del navegador
3. Verifica las políticas RLS en Supabase
4. Asegúrate de que tu proyecto de Supabase esté activo


