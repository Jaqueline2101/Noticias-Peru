import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface NoticiaDto {
  id: number;
  uuid?: string;
  titulo: string;
  subtitulo?: string | null;
  resumen?: string | null;
  contenido?: string; // Legacy
  contenido_completo?: string | null; // New schema
  texto_plano?: string | null; // New schema
  autor?: string | null;
  autores?: any | null; // JSONB
  url?: string; // Legacy
  url_original?: string; // New schema
  imagen_principal?: string | null; // Legacy
  imagen_principal_url?: string | null; // New schema
  fecha_publicacion: string;
  categoria_principal?: string | null;
  seccion?: string | null;
  medio_comunicacion: string;
  es_premium?: boolean | null;
}

export interface NoticiaViewModel {
  id: number;
  titulo: string;
  bajada?: string;
  contenido: string;
  imagen_url: string;
  fecha_publicacion: string;
  categoria: string;
  autor: string;
  url: string;
  es_premium: boolean;
  medio: string;
}

export interface FiltroNoticias {
  page?: number;
  limit?: number;
  categoria?: string;
  desde?: string; // ISO date
  hasta?: string; // ISO date
  soloPremium?: boolean;
  soloGratis?: boolean;
  termino?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    console.log('Supabase Config:', environment.supabaseUrl);
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async getRecentNews(limit: number = 5) {
    const { data, error } = await this.supabase
      .from('noticias')
      .select('*')
      .order('fecha_publicacion', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  async getAllNews() {
    const { data, error } = await this.supabase
      .from('noticias')
      .select('*')
      .order('fecha_publicacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getNewsCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('noticias')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error contando noticias:', error);
      return 0;
    }

    return count || 0;
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  private mapNoticia(dto: NoticiaDto): NoticiaViewModel {
    // Prioritize new schema fields
    let imageUrl = dto.imagen_principal_url || dto.imagen_principal;

    // Usar la URL original directamente como pidió el usuario
    // El frontend usa referrerpolicy="no-referrer" para intentar evitar bloqueos
    if (!imageUrl || imageUrl === 'https://via.placeholder.com/800x400?text=Sin+Imagen') {
      imageUrl = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60';
    }

    return {
      id: dto.id,
      titulo: dto.titulo,
      bajada: dto.resumen || dto.subtitulo || undefined,
      contenido: dto.contenido_completo || dto.texto_plano || dto.contenido || '',
      imagen_url: imageUrl,
      fecha_publicacion: dto.fecha_publicacion,
      categoria: dto.categoria_principal || dto.seccion || 'General',
      autor: dto.autor || dto.medio_comunicacion || 'Redacción',
      url: dto.url_original || dto.url || '#',
      es_premium: !!dto.es_premium,
      medio: dto.medio_comunicacion,
    };
  }

  // Obtener noticias con paginación básica
  async getNoticias(page: number = 1, limit: number = 10, categoria?: string): Promise<NoticiaViewModel[]> {
    let query = this.supabase
      .from('noticias')
      .select(
        'id, titulo, resumen, subtitulo, contenido_completo, texto_plano, imagen_principal_url, fecha_publicacion, categoria_principal, seccion, autor, autores, url_original, medio_comunicacion, es_premium'
      )
      .order('fecha_publicacion', { ascending: false })
      .order('id', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (categoria) {
      query = query.eq('categoria_principal', categoria);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo noticias:', error);
      throw error;
    }

    return (data as NoticiaDto[]).map((n) => this.mapNoticia(n));
  }

  // Obtener noticias con filtros avanzados
  async getNoticiasFiltradas(filtro: FiltroNoticias): Promise<NoticiaViewModel[]> {
    const page = filtro.page ?? 1;
    const limit = filtro.limit ?? 12;

    let query = this.supabase
      .from('noticias')
      .select(
        'id, titulo, resumen, subtitulo, contenido_completo, texto_plano, imagen_principal_url, fecha_publicacion, categoria_principal, seccion, autor, autores, url_original, medio_comunicacion, es_premium'
      )
      .order('fecha_publicacion', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (filtro.categoria) {
      console.log('Filtrando por categoría (input):', filtro.categoria); // DEBUG

      // Normalización de categorías comunes para manejar falta de tildes
      const catMap: { [key: string]: string } = {
        'economia': 'Economía',
        'economía': 'Economía',
        'politica': 'Política',
        'política': 'Política',
        'espectaculos': 'Espectáculos',
        'espectáculos': 'Espectáculos',
        'peru': 'Locales',
        'locales': 'Locales',
        'puno': 'Regionales',
        'arequipa': 'Regionales',
        'regionales': 'Regionales',
        'deportes': 'Deportes',
        'mundo': 'Mundo',
        'tecnologia': 'Tecnología',
        'tecnología': 'Tecnología'
      };

      const normalizedCat = filtro.categoria.toLowerCase();
      const dbCat = catMap[normalizedCat] || filtro.categoria;

      console.log('Filtrando por categoría (db):', dbCat); // DEBUG

      // Usar ilike para búsqueda insensible a mayúsculas/minúsculas
      query = query.ilike('categoria_principal', dbCat);
    }

    if (filtro.desde) {
      query = query.gte('fecha_publicacion', filtro.desde);
    }

    if (filtro.hasta) {
      query = query.lte('fecha_publicacion', filtro.hasta);
    }

    if (filtro.soloPremium) {
      query = query.eq('es_premium', true);
    } else if (filtro.soloGratis) {
      query = query.or('es_premium.is.null,es_premium.eq.false');
    }

    if (filtro.termino) {
      const term = filtro.termino.trim();
      if (term) {
        // Búsqueda más amplia en múltiples campos
        query = query.or(`titulo.ilike.%${term}%,resumen.ilike.%${term}%,subtitulo.ilike.%${term}%,contenido_completo.ilike.%${term}%,texto_plano.ilike.%${term}%,categoria_principal.ilike.%${term}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo noticias filtradas:', error);
      throw error;
    }

    return (data as NoticiaDto[]).map((n) => this.mapNoticia(n));
  }

  // Obtener una noticia por ID
  async getNoticiaById(id: string | number): Promise<NoticiaViewModel> {
    const { data, error } = await this.supabase
      .from('noticias')
      .select(
        'id, titulo, resumen, subtitulo, contenido_completo, texto_plano, imagen_principal_url, fecha_publicacion, categoria_principal, seccion, autor, autores, url_original, medio_comunicacion, es_premium'
      )
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error obteniendo noticia:', error);
      throw error;
    }

    return this.mapNoticia(data as NoticiaDto);
  }

  // Obtener noticias por categoría (helper)
  async getNoticiasByCategoria(categoria: string, page: number = 1, limit: number = 10): Promise<NoticiaViewModel[]> {
    return this.getNoticiasFiltradas({ categoria, page, limit });
  }

  // Obtener categorías disponibles
  async getCategorias(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('noticias')
      .select('categoria_principal')
      .not('categoria_principal', 'is', null)
      .order('categoria_principal', { ascending: true });

    if (error) {
      console.error('Error obteniendo categorías:', error);
      throw error;
    }

    const categoriasUnicas = [
      ...new Set((data as { categoria_principal: string }[]).map((item) => item.categoria_principal)),
    ];
    return categoriasUnicas;
  }

  // Buscar noticias para el chatbot (Optimizado)
  async searchNews(query: string): Promise<NoticiaViewModel[]> {
    // Intentamos usar Full Text Search en el título para mayor velocidad
    const { data, error } = await this.supabase
      .from('noticias')
      .select('*')
      .textSearch('titulo', query, { type: 'websearch', config: 'spanish' })
      .limit(5);

    if (error || !data || data.length === 0) {
      // Fallback: Si no hay resultados con FTS, intentamos ilike (más lento pero más flexible)
      // o si hubo error (ej: columna no indexada)
      const { data: dataFallback, error: errorFallback } = await this.supabase
        .from('noticias')
        .select('*')
        .or(`titulo.ilike.%${query}%,resumen.ilike.%${query}%,subtitulo.ilike.%${query}%,contenido_completo.ilike.%${query}%,texto_plano.ilike.%${query}%`)
        .limit(5);

      if (errorFallback) {
        console.error('Error searching news (fallback):', errorFallback);
        return [];
      }
      return (dataFallback || []).map(dto => this.mapNoticia(dto));
    }

    return (data || []).map(dto => this.mapNoticia(dto));
  }

  // Buscar noticias
  async buscarNoticias(termino: string, page: number = 1, limit: number = 10): Promise<NoticiaViewModel[]> {
    return this.getNoticiasFiltradas({ termino, page, limit });
  }
  // Obtener estadísticas para el dashboard
  async getAdminStats() {
    const { count: totalNoticias } = await this.supabase.from('noticias').select('*', { count: 'exact', head: true });
    const { count: totalPremium } = await this.supabase.from('noticias').select('*', { count: 'exact', head: true }).eq('es_premium', true);
    const { count: totalMedios } = await this.supabase.from('medios').select('*', { count: 'exact', head: true });

    const { data: recentNews } = await this.supabase
      .from('noticias')
      .select('titulo, medio_comunicacion, categoria_principal, fecha_publicacion')
      .order('fecha_publicacion', { ascending: false })
      .limit(5);

    return {
      totalNoticias: totalNoticias || 0,
      totalPremium: totalPremium || 0,
      totalMedios: totalMedios || 0,
      recentNews: recentNews || []
    };
  }

  async getChartData() {
    // Agregación simple (en producción usaría RPC o vistas)
    // 1. Categorías
    const { data: cats } = await this.supabase.from('noticias').select('categoria_principal');
    const catCounts: { [key: string]: number } = {};
    cats?.forEach((c: any) => {
      const cat = c.categoria_principal || 'Otros';
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    // 2. Medios
    const { data: meds } = await this.supabase.from('noticias').select('medio_comunicacion');
    const medCounts: { [key: string]: number } = {};
    meds?.forEach((m: any) => {
      const med = m.medio_comunicacion || 'Desconocido';
      medCounts[med] = (medCounts[med] || 0) + 1;
    });

    // 3. Tendencia (Últimos 7 días)
    const { data: fechs } = await this.supabase
      .from('noticias')
      .select('fecha_publicacion')
      .order('fecha_publicacion', { ascending: true });

    const dateCounts: { [key: string]: number } = {};
    const hourCounts: number[] = new Array(24).fill(0); // 0-23 horas

    fechs?.forEach((f: any) => {
      if (!f.fecha_publicacion) return;
      const dateObj = new Date(f.fecha_publicacion);
      const date = f.fecha_publicacion.split('T')[0];
      dateCounts[date] = (dateCounts[date] || 0) + 1;

      // Hora (ajustar a local si es necesario, aquí usamos UTC/ISO directo)
      const hour = dateObj.getHours();
      hourCounts[hour]++;
    });
    // Tomar los últimos 7 días con datos
    const sortedDates = Object.keys(dateCounts).sort().slice(-7);
    const trendValues = sortedDates.map(d => dateCounts[d]);

    // 4. Premium vs Gratis
    const { data: prems } = await this.supabase.from('noticias').select('es_premium');
    let premiumCount = 0;
    let freeCount = 0;
    prems?.forEach((p: any) => {
      if (p.es_premium) premiumCount++;
      else freeCount++;
    });

    // 5. Top Autores
    const { data: authors } = await this.supabase.from('noticias').select('autor').limit(1000);
    const authorCounts: { [key: string]: number } = {};
    authors?.forEach((a: any) => {
      const auth = a.autor || 'Redacción';
      if (auth.length > 20) return; // Filtrar nombres muy largos o basura
      authorCounts[auth] = (authorCounts[auth] || 0) + 1;
    });
    // Top 5 autores
    const topAuthors = Object.entries(authorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    // 6. Palabras Clave (Análisis simple de títulos)
    const { data: titles } = await this.supabase.from('noticias').select('titulo').limit(500);
    const wordCounts: { [key: string]: number } = {};
    const stopWords = ['de', 'la', 'el', 'en', 'y', 'a', 'los', 'del', 'las', 'un', 'una', 'por', 'para', 'con', 'se', 'su', 'al', 'lo', 'como', 'más', 'pero', 'sus', 'le', 'ya', 'o', 'fue', 'este', 'ha', 'sí', 'porque', 'esta', 'son', 'entre', 'está', 'cuando', 'muy', 'sin', 'sobre', 'también', 'me', 'hasta', 'hay', 'donde', 'quien', 'desde', 'todo', 'nos', 'durante', 'todos', 'uno', 'les', 'ni', 'contra', 'otros', 'ese', 'eso', 'ante', 'ellos', 'e', 'esto', 'mí', 'antes', 'algunos', 'qué', 'unos', 'yo', 'otro', 'otras', 'otra', 'él', 'tanto', 'esa', 'estos', 'mucho', 'quienes', 'nada', 'muchos', 'cual', 'poco', 'ella', 'estar', 'estas', 'algunas', 'algo', 'nosotros', 'mi', 'mis', 'tú', 'te', 'ti', 'tu', 'tus', 'ellas', 'nosotras', 'vosotros', 'vosotras', 'os', 'mío', 'mía', 'míos', 'mías', 'tuyo', 'tuya', 'tuyos', 'tuyas', 'suyo', 'suya', 'suyos', 'suyas', 'nuestro', 'nuestra', 'nuestros', 'nuestras', 'vuestro', 'vuestra', 'vuestros', 'vuestras', 'esos', 'esas', 'estoy', 'estás', 'está', 'estamos', 'estáis', 'están', 'esté', 'estés', 'estemos', 'estéis', 'estén', 'estaré', 'estarás', 'estará', 'estaremos', 'estaréis', 'estarán', 'estaría', 'estarías', 'estaríamos', 'estaríais', 'estarían', 'estaba', 'estabas', 'estábamos', 'estabais', 'estaban', 'estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis', 'estuvieron', 'estuviera', 'estuvieras', 'estuviéramos', 'estuvierais', 'estuvieran', 'estuviese', 'estuvieses', 'estuviésemos', 'estuvieseis', 'estuviesen', 'estando', 'estado', 'estada', 'estados', 'estadas', 'estad', 'he', 'has', 'ha', 'hemos', 'habéis', 'han', 'haya', 'hayas', 'hayamos', 'hayáis', 'hayan', 'habré', 'habrás', 'habrá', 'habremos', 'habréis', 'habrán', 'habría', 'habrías', 'habríamos', 'habríais', 'habrían', 'había', 'habías', 'habíamos', 'habíais', 'habían', 'hube', 'hubiste', 'hubo', 'hubimos', 'hubisteis', 'hubieron', 'hubiera', 'hubieras', 'hubiéramos', 'hubierais', 'hubieran', 'hubiese', 'hubieses', 'hubiésemos', 'hubieseis', 'hubiesen', 'habiendo', 'habido', 'habida', 'habidos', 'habidas', 'soy', 'eres', 'es', 'somos', 'sois', 'son', 'sea', 'seas', 'seamos', 'seáis', 'sean', 'seré', 'serás', 'será', 'seremos', 'seréis', 'serán', 'sería', 'serías', 'seríamos', 'seríais', 'serían', 'era', 'eras', 'éramos', 'erais', 'eran', 'fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron', 'fuera', 'fueras', 'fuéramos', 'fuerais', 'fueran', 'fuese', 'fueses', 'fuésemos', 'fueseis', 'fuesen', 'sintiendo', 'sentido', 'sentida', 'sentidos', 'sentidas', 'siente', 'sentid', 'tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen', 'tenga', 'tengas', 'tengamos', 'tengáis', 'tengan', 'tendré', 'tendrás', 'tendrá', 'tendremos', 'tendréis', 'tendrán', 'tendría', 'tendrías', 'tendríamos', 'tendríais', 'tendrían', 'tenía', 'tenías', 'teníamos', 'teníais', 'tenían', 'tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron', 'tuviera', 'tuvieras', 'tuviéramos', 'tuvierais', 'tuvieran', 'tuviese', 'tuvieses', 'tuviésemos', 'tuvieseis', 'tuviesen', 'teniendo', 'tenido', 'tenida', 'tenidos', 'tenidas', 'tened'];

    titles?.forEach((t: any) => {
      const words = t.titulo.toLowerCase().split(/\W+/);
      words.forEach((w: string) => {
        if (w.length > 3 && !stopWords.includes(w)) {
          wordCounts[w] = (wordCounts[w] || 0) + 1;
        }
      });
    });
    const topKeywords = Object.entries(wordCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    return {
      categories: {
        labels: Object.keys(catCounts),
        values: Object.values(catCounts)
      },
      media: {
        labels: Object.keys(medCounts),
        values: Object.values(medCounts)
      },
      trend: {
        labels: sortedDates,
        values: trendValues
      },
      premium: {
        labels: ['Premium', 'Gratuito'],
        values: [premiumCount, freeCount]
      },
      authors: {
        labels: topAuthors.map(([name]) => name),
        values: topAuthors.map(([, count]) => count)
      },
      hours: {
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        values: hourCounts
      },
      keywords: {
        labels: topKeywords.map(([word]) => word),
        values: topKeywords.map(([, count]) => count)
      }
    };
  }
}
