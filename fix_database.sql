-- 1. Eliminar la tabla incorrecta (CUIDADO: Se borrarán los datos de esta tabla)
DROP TABLE IF EXISTS public.usuarios;

-- 2. Crear la tabla con la estructura correcta que espera la aplicación
CREATE TABLE public.usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  nombre text,
  apellido text,
  dni text,
  telefono text,
  role text DEFAULT 'free',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- 3. Deshabilitar RLS temporalmente para evitar problemas de permisos en este proyecto escolar
-- (En producción esto no se recomienda, pero facilitará que funcione ahora mismo)
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;

-- 4. Opcional: Si prefieres mantener RLS, usa estas políticas (pero asegúrate de estar logueado)
-- ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Acceso total" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);
