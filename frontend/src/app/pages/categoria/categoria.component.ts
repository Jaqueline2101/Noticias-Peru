import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService, NoticiaViewModel } from '../../services/supabase.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="categoria-container">
      <div class="container">
        <div class="categoria-header">
          <h1>{{ categoria | titlecase }}</h1>
          <a routerLink="/" class="back-link">← Volver al inicio</a>
        </div>

        <!-- Filters removed as requested -->

        <div *ngIf="loading" class="loading">
          <p>Cargando noticias...</p>
        </div>

        <div *ngIf="error" class="error">
          <p>{{ error }}</p>
        </div>

        <div class="noticias-grid" *ngIf="!loading && !error">
          <article *ngFor="let noticia of noticias" class="noticia-card" [routerLink]="['/noticia', noticia.id]">
            <div class="noticia-image">
              <img [src]="noticia.imagen_url" [alt]="noticia.titulo" loading="lazy" referrerpolicy="no-referrer" (error)="handleImageError($event)">
            </div>
            <div class="noticia-content">
              <div class="card-top-row">
                <span class="categoria-badge">{{ noticia.categoria }}</span>
                <span class="badge-premium" *ngIf="noticia.es_premium">Premium</span>
              </div>
              <h3>{{ noticia.titulo }}</h3>
              <p *ngIf="noticia.bajada" class="bajada">{{ noticia.bajada }}</p>
              <div class="noticia-meta">
                <span class="autor">{{ noticia.autor }}</span>
                <span class="fecha">{{ formatFecha(noticia.fecha_publicacion) }}</span>
              </div>
            </div>
          </article>
        </div>

        <div *ngIf="noticias.length === 0 && !loading" class="no-noticias">
          <p>No hay noticias en esta categoría</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .categoria-container {
      min-height: calc(100vh - 200px);
      padding: 2rem 0;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .categoria-header {
      margin-bottom: 2rem;
    }
    .categoria-header h1 {
      font-size: 2.5rem;
      color: #2d3748;
      margin-bottom: 1rem;
    }
    .back-link {
      display: inline-block;
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s;
    }
    .back-link:hover {
      color: #9b2c2c;
    }
    .filters-bar {
      background: #fff7f2;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      border: 1px solid #e2d6cf;
      margin-bottom: 1.5rem;
    }
    .filters-row {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      justify-content: flex-start;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.85rem;
    }
    .filter-group label {
      color: #5b3a29;
      font-weight: 500;
    }
    .filter-group input[type='date'] {
      padding: 0.35rem 0.6rem;
      border-radius: 8px;
      border: 1px solid #e2d6cf;
      font-size: 0.85rem;
      background: #fffdfa;
    }
    .chip-group {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .chip {
      padding: 0.25rem 0.7rem;
      border-radius: 999px;
      border: 1px solid #d5b59b;
      background: #fffaf5;
      color: #7b341e;
      font-size: 0.75rem;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }
    .chip.active {
      background: #9b2c2c;
      color: #fff7ed;
      border-color: #9b2c2c;
    }
    .filter-summary {
      margin-top: 0.75rem;
      font-size: 0.85rem;
      color: #7c6f64;
    }
    .noticias-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .noticia-card {
      background: #fffaf5;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(60, 32, 20, 0.1);
      transition: transform 0.3s, box-shadow 0.3s;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .noticia-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.15);
    }
    .noticia-image {
      width: 100%;
      height: 180px;
      overflow: hidden;
      background-color: #e2e8f0;
    }
    .noticia-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s;
    }
    .noticia-card:hover .noticia-image img {
      transform: scale(1.05);
    }
    .noticia-content {
      padding: 1.25rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .card-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .categoria-badge {
      background: #9b2c2c;
      color: #fff7ed;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-premium {
      font-size: 0.65rem;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      background: #fef3c7;
      color: #9b2c2c;
      font-weight: 700;
      text-transform: uppercase;
      border: 1px solid #fcd34d;
    }
    .noticia-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      color: #1a1a1a;
      line-height: 1.3;
      font-weight: 700;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .bajada {
      color: #666;
      font-size: 0.85rem;
      margin: 0.5rem 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex: 1;
    }
    .noticia-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #888;
      margin-top: 1rem;
      padding-top: 0.75rem;
      border-top: 1px solid #eee;
    }
    .loading, .error, .no-noticias {
      text-align: center;
      padding: 3rem;
      color: #7c6f64;
    }
    @media (max-width: 768px) {
      .noticias-grid {
        grid-template-columns: 1fr;
      }
      .categoria-header h1 {
        font-size: 1.8rem;
      }
    }
  `]
})
export class CategoriaComponent implements OnInit {
  categoria: string = '';
  noticias: NoticiaViewModel[] = [];
  loading: boolean = true;
  error: string | null = null;

  filtroDesde: string = '';
  filtroHasta: string = '';
  tipoSeleccionado: 'todos' | 'gratis' | 'premium' = 'todos';
  filtroResumen: string = '';

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) { }

  ngOnInit() {
    // Fechas por defecto eliminadas
    this.filtroDesde = '';
    this.filtroHasta = '';

    // Suscribirse a cambios en los parámetros de la URL
    this.route.paramMap.subscribe(params => {
      this.categoria = params.get('id') || '';
      console.log('Categoria params:', this.categoria); // DEBUG
      if (this.categoria) {
        this.cargarNoticias();
      }
    });
  }

  async cargarNoticias() {
    if (!this.categoria) return;

    try {
      this.loading = true;
      this.error = null;

      this.noticias = await this.supabaseService.getNoticiasFiltradas({
        categoria: this.categoria,
        page: 1,
        limit: 50,
        // Filtros eliminados
      });

    } catch (err: any) {
      this.error = 'Error al cargar las noticias.';
      console.error('Error:', err);
    } finally {
      this.loading = false;
    }
  }

  formatFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Métodos de filtro eliminados

  handleImageError(event: any) {
    // Si falla la carga (incluso con proxy), usar una imagen de respaldo genérica (periódico/noticias)
    // Evitamos la máquina de escribir
    event.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60';
  }
}

