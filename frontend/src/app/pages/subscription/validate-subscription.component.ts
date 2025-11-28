import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-validate-subscription',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="validation-container">
      <div class="card">
        <div class="icon-circle">
          <span *ngIf="success">✅</span>
          <span *ngIf="!success">⏳</span>
        </div>
        <h2>{{ statusMessage }}</h2>
        <p *ngIf="success">Tu cuenta ha sido actualizada a Premium. Disfruta de todo el contenido sin límites.</p>
        <button *ngIf="success" routerLink="/" class="btn-home">Ir al Inicio</button>
      </div>
    </div>
  `,
  styles: [`
    .validation-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      background: #f4f6f8;
      padding: 1rem;
    }
    .card {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      text-align: center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      max-width: 400px;
      width: 100%;
    }
    .icon-circle {
      width: 80px;
      height: 80px;
      background: #e6fffa;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2.5rem;
    }
    h2 {
      color: #2d3748;
      margin-bottom: 1rem;
    }
    p {
      color: #718096;
      margin-bottom: 2rem;
      line-height: 1.5;
    }
    .btn-home {
      background: #cc0000;
      color: white;
      border: none;
      padding: 0.8rem 2rem;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: background 0.2s;
    }
    .btn-home:hover {
      background: #990000;
    }
  `]
})
export class ValidateSubscriptionComponent implements OnInit {
  statusMessage = 'Validando pago...';
  success = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Simular proceso de validación
    setTimeout(() => {
      this.authService.upgradeToPremium().then(() => {
        this.success = true;
        this.statusMessage = '¡Pago Validado Exitosamente!';
      }).catch(err => {
        console.error(err);
        this.statusMessage = 'Error al validar el pago.';
      });
    }, 2000);
  }
}
