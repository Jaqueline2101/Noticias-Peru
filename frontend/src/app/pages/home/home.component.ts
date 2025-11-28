import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupabaseService, NoticiaViewModel } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="home-container">
      <div class="container">
        <section class="noticias-section">
          <div class="section-header">
            <h2>Últimas Noticias</h2>
          </div>
          
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
                <div class="card-actions" *ngIf="isLoggedIn">
                  <a [href]="noticia.url" target="_blank" (click)="$event.stopPropagation()" class="btn-ver-mas">Ver más en fuente original</a>
                </div>
              </div>
            </article>
          </div>

          <div *ngIf="noticias.length === 0 && !loading" class="no-noticias">
            <p>No hay noticias disponibles</p>
          </div>
          <div class="footer-stats" *ngIf="totalNoticias > 0">
            <p class="news-count">Total de noticias: {{ totalNoticias }}</p>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: calc(100vh - 200px);
      padding-bottom: 4rem; /* Ensure bottom space */
    }
    /* ... */
    .footer-stats {
      text-align: center;
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 2px solid #eee;
      background: #f9f9f9;
      padding-bottom: 2rem;
      border-radius: 8px;
    }
    .news-count {
      color: #333;
      font-size: 1.2rem;
      font-weight: 700;
    }
    .container {
      max-width: 1400px; /* Wider container for 4 cols */
      margin: 0 auto;
      padding: 2rem 1rem;
    }
    .hero {
      text-align: center;
      padding: 3rem 2rem;
      background: radial-gradient(circle at center, #fde9d0, #4a2511);
      color: #fdf7f2;
      border-radius: 18px;
      margin-bottom: 3rem;
      box-shadow: 0 10px 30px rgba(60, 32, 20, 0.5);
    }
    .hero-text h1 {
      font-size: 3rem;
      margin: 0 0 1rem 0;
      color: #fff7ed;
    }
    .hero-text p {
      font-size: 1.2rem;
      opacity: 0.92;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .noticias-section {
      margin-top: 1.5rem;
    }
    .section-header {
      margin-bottom: 2rem;
      text-align: center;
    }
    .section-header h2 {
      font-size: 2.2rem;
      color: #3b2f2a;
      position: relative;
      display: inline-block;
    }
    .section-header h2::after {
      content: '';
      display: block;
      width: 60px;
      height: 4px;
      background: #cc0000;
      margin: 0.5rem auto 0;
      border-radius: 2px;
    }
    .footer-stats {
      text-align: center;
      margin-top: 4rem;
      padding-top: 2rem;
      border-top: 2px solid #eee;
      background: #f9f9f9;
      padding-bottom: 2rem;
      border-radius: 8px;
    }
    .news-count {
      color: #333;
      font-size: 1.2rem;
      font-weight: 700;
    }

    .noticias-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr); /* 4 Columns */
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
    .card-actions {
      margin-top: 0.75rem;
      text-align: center;
    }
    .btn-ver-mas {
      display: inline-block;
      width: 100%;
      background: transparent;
      color: #cc0000;
      padding: 0.4rem;
      border: 1px solid #cc0000;
      border-radius: 4px;
      text-decoration: none;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .btn-ver-mas:hover {
      background: #cc0000;
      color: white;
    }
    .no-noticias {
      text-align: center;
      padding: 4rem;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      color: #7c6f64;
    }
    .loading, .error {
      text-align: center;
      padding: 3rem;
      color: #7c6f64;
    }
    
    /* Responsive Grid */
    @media (max-width: 1200px) {
      .noticias-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    @media (max-width: 900px) {
      .noticias-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    @media (max-width: 600px) {
      .noticias-grid {
        grid-template-columns: 1fr;
      }
      .hero-text h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  noticias: NoticiaViewModel[] = [];
  totalNoticias: number = 0;
  loading: boolean = true;
  error: string | null = null;

  filtroCategoria: string = '';
  filtroDesde: string = '';
  filtroHasta: string = '';

  categorias: string[] = [];

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) { }

  async ngOnInit() {
    // Establecer fechas por defecto (rango octubre - 20 noviembre 2025)
    // No establecer filtros de fecha por defecto para mostrar todo lo que haya
    this.filtroDesde = '';
    this.filtroHasta = '';

    await this.cargarCategorias();
    this.totalNoticias = await this.supabaseService.getNewsCount();
    await this.cargarNoticiasConFiltros();
  }

  async cargarCategorias() {
    try {
      this.categorias = await this.supabaseService.getCategorias();
    } catch (err) {
      console.error('Error obteniendo categorías', err);
    }
  }

  async cargarNoticiasConFiltros() {
    try {
      this.loading = true;
      this.error = null;

      // Lógica de límite según suscripción
      // Si es premium: mostrar TODAS (o un número muy alto)
      // Si es gratis: mostrar solo 20
      const isPremium = this.authService.isPremium();
      const limit = isPremium ? (this.totalNoticias > 0 ? this.totalNoticias : 10000) : 20;

      this.noticias = await this.supabaseService.getNoticiasFiltradas({
        page: 1,
        limit: limit,
        categoria: this.filtroCategoria || undefined,
        desde: this.filtroDesde || undefined,
        hasta: this.filtroHasta || undefined,
      });

    } catch (err: any) {
      this.error = 'Error al cargar las noticias. Verifica tu conexión a Supabase.';
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

  handleImageError(event: any) {
    // Si falla la carga (incluso con proxy), usar una imagen de respaldo genérica (periódico/noticias)
    // Evitamos la máquina de escribir
    event.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=60';
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }
}


