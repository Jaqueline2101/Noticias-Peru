import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SupabaseService, NoticiaViewModel } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-noticia-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="noticia-detail-container">
      <div class="container">
        <div class="layout-grid">
          <!-- Main Content -->
          <main class="main-content">
            <article *ngIf="noticia && !loading" class="article-card">
              <header class="article-header">
                <div class="meta-top">
                  <span class="categoria-badge">{{ noticia.categoria | uppercase }}</span>
                  <span class="date">{{ formatFecha(noticia.fecha_publicacion) }}</span>
                </div>
                <h1 class="article-title">{{ noticia.titulo }}</h1>
                <p *ngIf="noticia.bajada" class="article-subtitle">{{ noticia.bajada }}</p>
                <div class="author-line">
                  <span class="by">Por</span> <span class="author-name">{{ noticia.autor }}</span>
                </div>
              </header>

              <div class="article-image-container">
                <img [src]="noticia.imagen_url || 'assets/placeholder.jpg'" [alt]="noticia.titulo" (error)="handleImageError($event)">
              </div>

              <!-- Content Block -->
              <div class="content-wrapper">
                <!-- Blur content if NOT logged in OR (Premium AND NOT Premium User) -->
                <div class="article-body" [class.blurred]="!isLoggedIn || (noticia.es_premium && !puedeVerPremium)">
                  <div [innerHTML]="formatContenido(noticia.contenido)"></div>
                </div>

                <!-- Overlay for Unauthenticated Users -->
                <div class="access-overlay" *ngIf="!isLoggedIn">
                  <div class="overlay-card">
                    <h2>Contenido Restringido</h2>
                    <p>Debes iniciar sesión para leer esta noticia.</p>
                    <!-- We can trigger the header modal via a service or just redirect to home/login, 
                         but since the modal is in header, maybe just a message is enough or a button that says "Ingresa arriba" -->
                    <p class="hint">Haz clic en "INGRESAR" en la parte superior.</p>
                  </div>
                </div>

                <!-- Overlay for Premium Content (Logged in but Free User) -->
                <div class="access-overlay" *ngIf="isLoggedIn && noticia.es_premium && !puedeVerPremium">
                  <div class="overlay-card premium-card">
                    <h2>Contenido Exclusivo</h2>
                    <p>Esta noticia es para suscriptores premium.</p>
                    <p class="hint">Mejora tu plan para acceder.</p>
                  </div>
                </div>
              </div>

              <footer class="article-footer" *ngIf="isLoggedIn && (!noticia.es_premium || puedeVerPremium)">
                <div class="source-box">
                  <p>Lee la noticia completa en su fuente original:</p>
                  <a [href]="noticia.url" target="_blank" class="btn-source">
                    Ver en {{ noticia.medio || 'Fuente Original' }} <span class="icon">↗</span>
                  </a>
                </div>
              </footer>
            </article>

            <div *ngIf="loading" class="loading-state">
              <div class="spinner"></div>
              <p>Cargando noticia...</p>
            </div>
          </main>

          <!-- Sidebar -->
          <aside class="sidebar">
            <div class="sidebar-widget">
              <h3 class="widget-title">Publicidad</h3>
              <div class="ad-widget">
                <img src="https://placehold.co/300x250/EEE/31343C?text=Publicidad" alt="Publicidad">
              </div>
            </div>

            <div class="sidebar-widget">
              <h3 class="widget-title">Te puede interesar</h3>
              <div class="related-news">
                <!-- Placeholder for related news logic -->
                <div class="related-item">
                  <span class="tag">ECONOMÍA</span>
                  <a href="#">El impacto del dólar en las importaciones peruanas</a>
                </div>
                <div class="related-item">
                  <span class="tag">POLÍTICA</span>
                  <a href="#">Debate en el congreso sobre nuevas leyes</a>
                </div>
                <div class="related-item">
                  <span class="tag">DEPORTES</span>
                  <a href="#">La selección peruana anuncia convocados</a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .noticia-detail-container {
      background-color: #f8f9fa;
      min-height: 100vh;
      padding: 2rem 0 4rem;
      font-family: 'Georgia', serif;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .layout-grid {
      display: grid;
      grid-template-columns: 1fr 300px;
      gap: 2.5rem;
    }
    
    /* Main Content */
    .article-card {
      background: white;
      padding: 2.5rem;
      border-radius: 2px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .meta-top {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      font-family: 'Roboto', sans-serif;
    }
    .categoria-badge {
      background: #cc0000;
      color: white;
      padding: 0.2rem 0.6rem;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      border-radius: 2px;
    }
    .date {
      color: #666;
      font-size: 0.85rem;
    }
    .article-title {
      font-size: 2.5rem;
      line-height: 1.2;
      color: #1a1a1a;
      margin: 0 0 1rem;
      font-weight: 700;
      font-family: 'Roboto', sans-serif;
    }
    .article-subtitle {
      font-size: 1.2rem;
      color: #555;
      line-height: 1.5;
      margin-bottom: 1.5rem;
      font-style: italic;
    }
    .author-line {
      font-family: 'Roboto', sans-serif;
      font-size: 0.9rem;
      color: #444;
      border-bottom: 1px solid #eee;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .author-name {
      font-weight: 700;
      color: #cc0000;
    }

    .article-image-container {
      margin-bottom: 2rem;
      background: #f0f0f0;
    }
    .article-image-container img {
      width: 100%;
      height: auto;
      display: block;
    }

    .content-wrapper {
      position: relative;
    }

    .article-body {
      font-size: 1.15rem;
      line-height: 1.8;
      color: #2c2c2c;
    }
    ::ng-deep .article-body p {
      margin-bottom: 1.5rem;
    }
    ::ng-deep .article-body h2 {
      font-family: 'Roboto', sans-serif;
      font-size: 1.5rem;
      margin-top: 2rem;
      margin-bottom: 1rem;
    }

    /* Footer / Source */
    .article-footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #eee;
    }
    .source-box {
      background: #f9f9f9;
      padding: 1.5rem;
      border-left: 4px solid #cc0000;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
    .source-box p {
      margin: 0;
      font-family: 'Roboto', sans-serif;
      font-weight: 500;
    }
    .btn-source {
      background: #cc0000;
      color: white;
      padding: 0.6rem 1.5rem;
      text-decoration: none;
      font-family: 'Roboto', sans-serif;
      font-weight: 700;
      border-radius: 4px;
      transition: background 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-source:hover {
      background: #990000;
    }

    /* Sidebar */
    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .sidebar-widget {
      background: white;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .widget-title {
      font-family: 'Roboto', sans-serif;
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      border-bottom: 2px solid #cc0000;
      padding-bottom: 0.5rem;
      margin: 0 0 1rem;
    }
    .ad-widget img {
      width: 100%;
      height: auto;
    }
    .related-item {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #f0f0f0;
    }
    .related-item:last-child {
      border-bottom: none;
    }
    .related-item .tag {
      display: block;
      font-size: 0.7rem;
      color: #cc0000;
      font-weight: 700;
      margin-bottom: 0.3rem;
      font-family: 'Roboto', sans-serif;
    }
    .related-item a {
      text-decoration: none;
      color: #333;
      font-weight: 600;
      font-family: 'Roboto', sans-serif;
      line-height: 1.4;
      transition: color 0.2s;
    }
    .related-item a:hover {
      color: #cc0000;
    }

    /* Access Control Styles */
    .blurred {
      filter: blur(8px);
      user-select: none;
      pointer-events: none;
      max-height: 300px;
      overflow: hidden;
      opacity: 0.5;
    }
    .access-overlay {
      position: absolute;
      top: 50px;
      left: 0;
      right: 0;
      z-index: 10;
      text-align: center;
      display: flex;
      justify-content: center;
    }
    .overlay-card {
      background: white;
      padding: 2.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.15);
      border-radius: 8px;
      border: 1px solid #eee;
      max-width: 400px;
      width: 90%;
    }
    .premium-card {
      border-top: 4px solid #f59e0b;
    }
    .overlay-card h2 {
      margin: 0 0 1rem 0;
      color: #cc0000;
      font-family: 'Roboto', sans-serif;
      font-size: 1.5rem;
    }
    .overlay-card p {
      color: #555;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }
    .overlay-card .hint {
      font-size: 0.9rem;
      color: #888;
      font-style: italic;
    }

    @media (max-width: 768px) {
      .layout-grid {
        grid-template-columns: 1fr;
      }
      .article-title {
        font-size: 1.8rem;
      }
      .article-card {
        padding: 1.5rem;
      }
    }
  `]
})
export class NoticiaDetailComponent implements OnInit, OnDestroy {
  noticia: NoticiaViewModel | null = null;
  loading = true;
  error: string | null = null;
  currentUser: any = null;
  private authSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private supabaseService: SupabaseService,
    private auth: AuthService
  ) { }

  async ngOnInit() {
    // Subscribe to auth state changes
    this.authSubscription = this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      if (id) {
        await this.cargarNoticia(id);
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async cargarNoticia(id: string) {
    this.loading = true;
    this.error = null;
    try {
      this.noticia = await this.supabaseService.getNoticiaById(id);
    } catch (err) {
      this.error = 'No se pudo cargar la noticia.';
      console.error(err);
    } finally {
      this.loading = false;
    }
  }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  formatContenido(contenido: string): string {
    if (!contenido) return '';
    return contenido.replace(/\\n/g, '<br>');
  }

  get isLoggedIn(): boolean {
    return !!this.currentUser;
  }

  get puedeVerPremium(): boolean {
    return this.currentUser?.role === 'premium' || this.currentUser?.role === 'admin';
  }

  handleImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60';
  }
}
