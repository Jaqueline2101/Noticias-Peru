import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';
import { ScraperService } from '../../services/scraper.service';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="admin-container">
      <div class="sidebar">
        <div class="sidebar-header">
          <h2>Panel Admin</h2>
          <p>Portal Noticias Perú</p>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/admin" class="active">Dashboard</a>
          <a routerLink="/">Ver Portal</a>
        </nav>
        <div class="sidebar-footer">
          <button (click)="logout()">Cerrar Sesión</button>
        </div>
      </div>

      <main class="main-content">
        <header class="top-header">
          <h1>Dashboard General</h1>
          <div class="actions">
            <button class="btn-scraper" (click)="runScraper()" *ngIf="!scraping">
              <span>🔄 Extraer Noticias de Hoy</span>
            </button>
            
            <div class="scraper-progress" *ngIf="scraping">
                <div class="progress-info">
                    <span>⏳ {{ scraperMessage }}</span>
                    <span class="percentage">{{ scraperProgress }}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" [style.width.%]="scraperProgress"></div>
                </div>
                <button class="btn-stop" (click)="stopScraper()">⛔ Detener</button>
            </div>
            <button class="btn-report" (click)="downloadReport()">
              📥 Descargar Reporte
            </button>
          </div>
        </header>

        <div class="stats-grid">
          <div class="stat-card">
            <h3>Total Noticias</h3>
            <p class="stat-value">{{ totalNoticias }}</p>
          </div>
          <div class="stat-card">
            <h3>Noticias Premium</h3>
            <p class="stat-value">{{ totalPremium }}</p>
          </div>
          <div class="stat-card">
            <h3>Vistas Totales</h3>
            <p class="stat-value">{{ totalVistas }}</p>
          </div>
          <div class="stat-card">
            <h3>Medios Activos</h3>
            <p class="stat-value">{{ totalMedios }}</p>
          </div>
        </div>

        <div class="charts-grid">
          <div class="chart-card">
            <h3>Noticias por Categoría</h3>
            <canvas #categoryChart></canvas>
          </div>
          <div class="chart-card">
            <h3>Noticias por Medio</h3>
            <canvas #mediaChart></canvas>
          </div>
          <div class="chart-card">
            <h3>Tendencia (Últimos 7 días)</h3>
            <canvas #trendChart></canvas>
          </div>
          <div class="chart-card">
            <h3>Premium vs Gratis</h3>
            <canvas #premiumChart></canvas>
          </div>
          <div class="chart-card full-width">
            <h3>Top 5 Autores</h3>
            <canvas #authorChart></canvas>
          </div>
          <div class="chart-card">
            <h3>Noticias por Hora</h3>
            <canvas #hourChart></canvas>
          </div>
          <div class="chart-card full-width">
            <h3>Palabras Clave</h3>
            <canvas #keywordChart></canvas>
          </div>
        </div>

        <div class="recent-activity">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3>Reporte de Noticias Recientes</h3>
                <button class="btn-report" (click)="downloadReport()" [disabled]="exporting">
                    <span *ngIf="!exporting">📥 Descargar Reporte</span>
                    <span *ngIf="exporting">⏳ Generando...</span>
                </button>
            </div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Medio</th>
                        <th>Categoría</th>
                        <th>Fecha</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let news of recentNews">
                        <td>{{ news.titulo }}</td>
                        <td>{{ news.medio_comunicacion }}</td>
                        <td>{{ news.categoria_principal }}</td>
                        <td>{{ news.fecha_publicacion | date:'dd/MM/yyyy HH:mm' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>

      </main>
    </div>
  `,
  styles: [`
    .admin-container {
      display: flex;
      min-height: 100vh;
      background: #f4f6f8;
      font-family: 'Roboto', sans-serif;
    }
    .sidebar {
      width: 250px;
      background: #1a1a1a;
      color: white;
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
    }
    .sidebar-header h2 {
      color: #cc0000;
      margin: 0;
    }
    .sidebar-nav {
      margin-top: 3rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .sidebar-nav a {
      color: #ccc;
      text-decoration: none;
      padding: 0.8rem;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .sidebar-nav a:hover, .sidebar-nav a.active {
      background: #333;
      color: white;
    }
    .sidebar-footer {
      margin-top: auto;
    }
    .sidebar-footer button {
      background: none;
      border: 1px solid #444;
      color: #aaa;
      padding: 0.5rem 1rem;
      width: 100%;
      cursor: pointer;
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }
    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .btn-report {
      background: #333;
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s;
    }
    .btn-report:hover {
      background: #555;
    }
    .btn-scraper {
      background: #cc0000;
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s;
    }
    .btn-scraper:hover {
      background: #aa0000;
    }
    .btn-scraper:disabled {
      background: #ffcccc;
      cursor: not-allowed;
    }
    
    .scraper-progress {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 300px;
    }
    .progress-info {
        display: flex;
        justify-content: space-between;
        font-size: 0.85rem;
        color: #666;
    }
    .percentage {
        font-weight: bold;
        color: #333;
    }
    .progress-bar-container {
        width: 100%;
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
    }
    .progress-bar {
        height: 100%;
        background: #cc0000;
        transition: width 0.3s ease;
    }
    .btn-stop {
        background: #333;
        color: white;
        border: none;
        padding: 0.4rem 1rem;
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
        align-self: flex-end;
    }
    .btn-stop:hover {
        background: #555;
    }
    .actions {
      display: flex;
      gap: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .stat-card h3 {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }
    .stat-value {
      font-size: 2rem;
      font-weight: bold;
      color: #333;
      margin: 0.5rem 0 0 0;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }
    .chart-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
      height: 400px;
    }
    .chart-card.full-width {
      grid-column: 1 / -1;
    }

    .recent-activity {
        background: white;
        padding: 1.5rem;
        border-radius: 8px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }
    .data-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 1rem;
    }
    .data-table th, .data-table td {
        text-align: left;
        padding: 1rem;
        border-bottom: 1px solid #eee;
    }
    .data-table th {
        font-weight: 600;
        color: #666;
    }
  `]
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  @ViewChild('mediaChart') mediaChartRef!: ElementRef;
  @ViewChild('trendChart') trendChartRef!: ElementRef;
  @ViewChild('premiumChart') premiumChartRef!: ElementRef;
  @ViewChild('authorChart') authorChartRef!: ElementRef;
  @ViewChild('hourChart') hourChartRef!: ElementRef;
  @ViewChild('keywordChart') keywordChartRef!: ElementRef;

  totalNoticias = 0;
  totalPremium = 0;
  totalVistas = 0;
  totalMedios = 0;
  recentNews: any[] = [];

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private scraperService: ScraperService,
    private router: Router
  ) { }

  ngOnInit() {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadStats();
  }

  ngAfterViewInit() {
    if (this.authService.isAdmin()) {
      this.loadCharts();
    }
  }

  async loadStats() {
    const stats = await this.supabaseService.getAdminStats();
    this.totalNoticias = stats.totalNoticias;
    this.totalPremium = stats.totalPremium;
    this.totalMedios = stats.totalMedios;
    this.recentNews = stats.recentNews;
    this.totalVistas = Math.floor(Math.random() * 50000) + 10000;
  }

  async loadCharts() {
    const data = await this.supabaseService.getChartData();

    // 1. Categorías
    new Chart(this.categoryChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: data.categories.labels,
        datasets: [{
          data: data.categories.values,
          backgroundColor: ['#cc0000', '#333', '#f0ad4e', '#5bc0de', '#5cb85c', '#999']
        }]
      }
    });

    // 2. Medios
    new Chart(this.mediaChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.media.labels,
        datasets: [{
          label: 'Noticias por Medio',
          data: data.media.values,
          backgroundColor: '#cc0000'
        }]
      }
    });

    // 3. Tendencia
    new Chart(this.trendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: data.trend.labels,
        datasets: [{
          label: 'Noticias Publicadas (Últimos 7 días)',
          data: data.trend.values,
          borderColor: '#3b82f6',
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        }]
      }
    });

    // 4. Premium vs Gratis
    new Chart(this.premiumChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels: data.premium.labels,
        datasets: [{
          data: data.premium.values,
          backgroundColor: ['#fbbf24', '#9ca3af']
        }]
      }
    });

    // 5. Top Autores
    new Chart(this.authorChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.authors.labels,
        datasets: [{
          label: 'Top 5 Autores',
          data: data.authors.values,
          backgroundColor: '#10b981',
          indexAxis: 'y'
        }]
      }
    });

    // 6. Hora de Publicación
    new Chart(this.hourChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.hours.labels,
        datasets: [{
          label: 'Noticias por Hora',
          data: data.hours.values,
          backgroundColor: '#8b5cf6'
        }]
      }
    });

    // 7. Palabras Clave
    new Chart(this.keywordChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.keywords.labels,
        datasets: [{
          label: 'Palabras más usadas',
          data: data.keywords.values,
          backgroundColor: '#ec4899'
        }]
      },
      options: {
        indexAxis: 'y'
      }
    });
  }

  exporting = false;

  async downloadReport() {
    this.exporting = true;
    try {
      const allNews = await this.supabaseService.getAllNews();

      const data = allNews.map((n: any) => ({
        Título: n.titulo,
        Medio: n.medio_comunicacion,
        Categoría: n.categoria_principal,
        Fecha: new Date(n.fecha_publicacion).toLocaleString()
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);

      // Auto-width columns
      const colWidths = [
        { wch: 50 }, // Título
        { wch: 20 }, // Medio
        { wch: 15 }, // Categoría
        { wch: 20 }  // Fecha
      ];
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Noticias');

      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });

      saveAs(dataBlob, `reporte_noticias_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Hubo un error al generar el reporte.');
    } finally {
      this.exporting = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  scraping = false;
  scraperProgress = 0;
  scraperMessage = 'Iniciando...';
  private pollInterval: any;

  runScraper() {
    if (confirm('¿Estás seguro de iniciar la extracción de noticias de hoy? Esto puede tomar unos minutos.')) {
      this.scraping = true;
      this.scraperProgress = 0;
      this.scraperMessage = 'Iniciando...';

      this.scraperService.runScraper('hoy').subscribe({
        next: (res) => {
          // El scraper inició en segundo plano
          this.startPolling();
        },
        error: (err) => {
          console.error('Error scraper:', err);
          alert('Error al iniciar el scraper: ' + (err.error?.message || err.message));
          this.scraping = false;
        }
      });
    }
  }

  startPolling() {
    this.pollInterval = setInterval(() => {
      this.scraperService.getScraperStatus().subscribe({
        next: (status) => {
          this.scraperProgress = status.progress;
          this.scraperMessage = status.message;

          if (status.status === 'completed' || status.status === 'stopped' || status.status === 'error') {
            this.stopPolling();
            this.scraping = false;
            this.loadStats(); // Recargar datos
            if (status.status === 'completed') alert('Scraper finalizado correctamente.');
            if (status.status === 'stopped') alert('Scraper detenido por el usuario.');
          }
        },
        error: () => {
          // Si falla el polling, no detenemos, solo ignoramos este tick
        }
      });
    }, 2000); // Consultar cada 2 segundos
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  stopScraper() {
    if (confirm('¿Seguro que deseas detener el proceso?')) {
      this.scraperService.stopScraper().subscribe(() => {
        this.scraperMessage = 'Deteniendo...';
      });
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }
}
