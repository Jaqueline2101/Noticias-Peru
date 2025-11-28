import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <p>&copy; 2024 Portal de Noticias Perú. Todos los derechos reservados.</p>
          <p>Fuente: RPP Noticias</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #2d3748;
      color: white;
      padding: 2rem 0;
      margin-top: 4rem;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }
    .footer-content {
      text-align: center;
    }
    .footer-content p {
      margin: 0.5rem 0;
    }
  `]
})
export class FooterComponent {}


