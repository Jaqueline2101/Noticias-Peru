import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
    selector: 'app-admin',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="logo">
          <h2>Admin Panel</h2>
        </div>
        <nav>
          <a routerLink="/admin/dashboard" routerLinkActive="active">
            <span class="icon">📊</span> Dashboard
          </a>
          <a routerLink="/admin/fuentes" routerLinkActive="active">
            <span class="icon">📰</span> Fuentes
          </a>
          <a routerLink="/" class="back-home">
            <span class="icon">🏠</span> Volver al Portal
          </a>
        </nav>
      </aside>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
    styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: #f4f6f9;
    }
    .sidebar {
      width: 250px;
      background: #1a1a1a;
      color: white;
      display: flex;
      flex-direction: column;
      padding: 20px;
    }
    .logo h2 {
      margin: 0 0 30px 0;
      color: #cc0000;
      font-size: 1.5rem;
    }
    nav {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    nav a {
      color: #aaa;
      text-decoration: none;
      padding: 12px 15px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s;
    }
    nav a:hover, nav a.active {
      background: #333;
      color: white;
    }
    nav a.active {
      background: #cc0000;
    }
    .back-home {
      margin-top: auto;
      border-top: 1px solid #333;
    }
    .content {
      flex: 1;
      padding: 30px;
      overflow-y: auto;
    }
  `]
})
export class AdminComponent { }
