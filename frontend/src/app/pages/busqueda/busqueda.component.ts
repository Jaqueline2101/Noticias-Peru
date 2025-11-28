import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService, NoticiaViewModel } from '../../services/supabase.service';

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <h2>Resultados de búsqueda: "{{ termino }}"</h2>
      
      <div *ngIf="loading" class="loading">Buscando...</div>
      
      <div *ngIf="!loading && noticias.length === 0" class="no-results">
        No se encontraron noticias para tu búsqueda.
      </div>

      <div class="noticias-grid" *ngIf="!loading && noticias.length > 0">
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
              <span class="fecha">{{ noticia.fecha_publicacion | date }}</span>
            </div>
          </div>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
    .noticias-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
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
    .loading, .no-results { text-align: center; padding: 3rem; color: #666; }
  `]
})
export class BusquedaComponent implements OnInit {
  termino: string = '';
  noticias: NoticiaViewModel[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.termino = params['q'] || '';
      if (this.termino) {
        this.buscar();
      }
    });
  }

  async buscar() {
    this.loading = true;
    try {
      this.noticias = await this.supabaseService.buscarNoticias(this.termino);
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }

  handleImageError(event: any) {
    // Si falla la carga (incluso con proxy), usar una imagen de respaldo genérica (periódico/noticias)
    // Evitamos la máquina de escribir
    event.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60';
  }
}
