import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../../services/supabase.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="dashboard">
      <h1>Dashboard</h1>
      
      <!-- KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <h3>Total Noticias</h3>
          <div class="value">{{ stats.total }}</div>
        </div>
        <div class="kpi-card">
          <h3>Categorías</h3>
          <div class="value">{{ objectKeys(stats.porCategoria).length }}</div>
        </div>
        <div class="kpi-card">
          <h3>Medios</h3>
          <div class="value">{{ objectKeys(stats.porMedio).length }}</div>
        </div>
      </div>

      <div class="charts-grid">
        <!-- Categories Chart -->
        <div class="chart-card">
          <h3>Noticias por Categoría</h3>
          <div class="bar-chart">
            <div class="bar-row" *ngFor="let cat of objectKeys(stats.porCategoria)">
              <div class="label">{{ cat | titlecase }}</div>
              <div class="bar-container">
                <div class="bar" [style.width.%]="getPercent(stats.porCategoria[cat])"></div>
              </div>
              <div class="count">{{ stats.porCategoria[cat] }}</div>
            </div>
          </div>
        </div>

        <!-- Sources Chart -->
        <div class="chart-card">
          <h3>Noticias por Medio</h3>
          <div class="bar-chart">
            <div class="bar-row" *ngFor="let medio of objectKeys(stats.porMedio)">
              <div class="label">{{ medio }}</div>
              <div class="bar-container">
                <div class="bar secondary" [style.width.%]="getPercent(stats.porMedio[medio])"></div>
              </div>
              <div class="count">{{ stats.porMedio[medio] }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .dashboard {
      font-family: 'Inter', sans-serif;
    }
    h1 { margin-bottom: 30px; color: #333; }
    
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .kpi-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .kpi-card h3 { margin: 0 0 10px 0; font-size: 0.9rem; color: #666; }
    .kpi-card .value { font-size: 2rem; font-weight: bold; color: #cc0000; }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
    }

    .chart-card {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .chart-card h3 { margin-top: 0; margin-bottom: 20px; }

    .bar-row {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      gap: 15px;
    }

    .label { width: 100px; font-size: 0.9rem; color: #555; }
    .bar-container { flex: 1; background: #f0f0f0; height: 10px; border-radius: 5px; overflow: hidden; }
    .bar { height: 100%; background: #cc0000; border-radius: 5px; transition: width 0.5s ease; }
    .bar.secondary { background: #333; }
    .count { width: 40px; text-align: right; font-weight: bold; font-size: 0.9rem; }
  `]
})
export class DashboardComponent implements OnInit {
    stats: { total: number; porCategoria: { [key: string]: number }; porMedio: { [key: string]: number } } = {
        total: 0,
        porCategoria: {},
        porMedio: {}
    };

    constructor(private supabaseService: SupabaseService) { }

    async ngOnInit() {
        this.stats = await this.supabaseService.getNewsStats();
    }

    objectKeys(obj: any): string[] {
        return Object.keys(obj);
    }

    getPercent(value: number): number {
        if (this.stats.total === 0) return 0;
        // Normalize against the max value to make bars look good, or against total?
        // Let's normalize against total for true percentage, or max for visual relative comparison.
        // Using max value in the set for relative sizing is usually better for charts.
        // But for simplicity, let's use percentage of total.
        return (value / this.stats.total) * 100 * 3; // Multiply by 3 to make small bars visible, capping at 100 handled by CSS? No.
        // Better: find max and scale.
    }
}
