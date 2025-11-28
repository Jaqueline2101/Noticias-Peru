import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="subscription-container">
      <div class="header">
        <h1>Elige tu Plan</h1>
        <p>Accede a contenido ilimitado y exclusivo</p>
      </div>

      <div class="plans-grid">
        <!-- Plan Básico -->
        <div class="plan-card">
          <div class="plan-header">
            <h3>Básico</h3>
            <div class="price">S/ 0.00</div>
            <span class="period">/ mes</span>
          </div>
          <ul class="features">
            <li>✓ Acceso a 20 noticias diarias</li>
            <li>✓ Publicidad incluida</li>
            <li>✗ Contenido exclusivo</li>
          </ul>
          <button class="btn-plan current" disabled>Tu Plan Actual</button>
        </div>

        <!-- Plan Estándar -->
        <div class="plan-card featured">
          <div class="badge">MÁS POPULAR</div>
          <div class="plan-header">
            <h3>Estándar</h3>
            <div class="price">S/ 19.90</div>
            <span class="period">/ mes</span>
          </div>
          <ul class="features">
            <li>✓ Acceso ilimitado a noticias</li>
            <li>✓ Sin publicidad</li>
            <li>✓ Contenido exclusivo</li>
            <li>✓ Soporte prioritario</li>
          </ul>
          <button class="btn-plan primary" (click)="subscribe('standard')">Suscribirse</button>
        </div>

        <!-- Plan Premium -->
        <div class="plan-card premium">
          <div class="plan-header">
            <h3>Premium</h3>
            <div class="price">S/ 29.90</div>
            <span class="period">/ mes</span>
          </div>
          <ul class="features">
            <li>✓ Todo lo del plan Estándar</li>
            <li>✓ Acceso a hemeroteca histórica</li>
            <li>✓ Newsletter exclusivo</li>
            <li>✓ insignia de usuario Premium 👑</li>
          </ul>
          <button class="btn-plan dark" (click)="subscribe('premium')">Suscribirse</button>
        </div>
      </div>

      <!-- Mock Payment Modal -->
      <div class="modal-overlay" *ngIf="showPaymentModal" (click)="closeModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <ng-container *ngIf="!emailSent">
            <h2>Confirmar Suscripción</h2>
            <p>Estás a punto de suscribirte al plan <strong>{{ selectedPlan | titlecase }}</strong>.</p>
            
            <div class="payment-details">
              <div class="qr-container">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PortalNoticiasPremium" alt="QR de Pago">
                <p class="qr-instruction">Escanea con Yape o Plin</p>
              </div>
            </div>

            <div class="actions">
              <button class="btn-cancel" (click)="closeModal()">Cancelar</button>
              <button class="btn-confirm" (click)="processPayment()" [disabled]="processing">
                {{ processing ? 'Verificando...' : 'Ya pagué' }}
              </button>
            </div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .subscription-container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 0.5rem;
      font-family: 'Roboto', sans-serif;
      height: calc(100vh - 195px); /* Exact height minus header */
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden; /* Prevent scroll */
    }

    @media(max-width: 768px) {
      .subscription-container {
        height: calc(100vh - 180px); /* Mobile header height */
      }
    }

    .header {
      text-align: center;
      margin-bottom: 0.5rem; /* Reduced further */
    }
    .header h1 {
      font-size: 1.5rem; /* Smaller title */
      color: #333;
      margin-bottom: 0.1rem;
    }
    .header p {
      color: #666;
      font-size: 0.85rem;
      margin: 0;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 0.8rem; /* Tighter gap */
      align-items: stretch;
    }

    .plan-card {
      background: white;
      border-radius: 8px;
      padding: 1rem; /* Compact padding */
      text-align: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
      border: 1px solid #eee;
      position: relative;
      transition: transform 0.3s;
      display: flex;
      flex-direction: column;
    }
    .plan-card:hover {
      transform: translateY(-2px);
    }
    .plan-card.featured {
      border: 2px solid #cc0000;
      transform: scale(1.01);
      box-shadow: 0 4px 15px rgba(204, 0, 0, 0.1);
      z-index: 2;
    }
    .plan-card.featured:hover {
      transform: scale(1.01) translateY(-2px);
    }

    .badge {
      position: absolute;
      top: -8px;
      left: 50%;
      transform: translateX(-50%);
      background: #cc0000;
      color: white;
      padding: 0.1rem 0.6rem;
      border-radius: 12px;
      font-size: 0.65rem;
      font-weight: 700;
    }

    .plan-header {
      margin-bottom: 0.5rem;
    }
    .plan-header h3 {
      font-size: 1.1rem;
      color: #333;
      margin-bottom: 0.2rem;
    }
    .price {
      font-size: 1.5rem;
      font-weight: 800;
      color: #1a1a1a;
    }
    .period {
      color: #666;
      font-size: 0.75rem;
    }

    .features {
      list-style: none;
      padding: 0;
      margin: 0 0 1rem 0;
      text-align: left;
      flex: 1;
    }
    .features li {
      padding: 0.3rem 0; /* Very tight */
      border-bottom: 1px solid #f5f5f5;
      color: #555;
      font-size: 0.8rem;
      line-height: 1.2;
    }
    .features li:last-child {
      border-bottom: none;
    }

    .btn-plan {
      width: 100%;
      padding: 0.5rem; /* Compact button */
      border-radius: 4px;
      border: none;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s;
      font-size: 0.85rem;
    }
    .btn-plan.current {
      background: #eee;
      color: #888;
      cursor: default;
    }
    .btn-plan.primary {
      background: #cc0000;
      color: white;
    }
    .btn-plan.primary:hover {
      background: #990000;
    }
    .btn-plan.dark {
      background: #1a1a1a;
      color: white;
    }
    .btn-plan.dark:hover {
      background: #333;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      backdrop-filter: blur(5px);
    }
    .modal-content {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      width: 90%;
      max-width: 400px;
      text-align: center;
    }
    .payment-details {
      margin: 2rem 0;
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
    }
    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .qr-container img {
      border: 2px solid #eee;
      border-radius: 8px;
      padding: 10px;
      background: white;
    }
    .qr-instruction {
      font-weight: 600;
      color: #555;
      margin: 0;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .btn-cancel {
      background: transparent;
      border: 1px solid #ddd;
      padding: 0.8rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
    }
    .btn-confirm {
      background: #28a745;
      color: white;
      border: none;
      padding: 0.8rem 1.5rem;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-confirm:disabled {
      background: #9ccc65;
      cursor: not-allowed;
    }

    /* Email Simulation Styles */
    .email-sent-state {
      text-align: center;
      padding: 1rem;
    }
    .icon-mail {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    .instruction {
      color: #666;
      margin-bottom: 2rem;
    }
    .simulation-box {
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      margin-top: 1.5rem;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      text-align: left;
    }
    .sim-header {
      background: #f3f4f6;
      padding: 0.5rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .sim-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }
    .sim-dot.red { background: #ef4444; }
    .sim-dot.yellow { background: #f59e0b; }
    .sim-dot.green { background: #10b981; }
    .sim-title {
      font-size: 0.75rem;
      color: #6b7280;
      margin-left: 0.5rem;
    }
    .sim-body {
      padding: 1.5rem;
      font-size: 0.9rem;
      color: #374151;
    }
    .email-row {
      margin-bottom: 0.5rem;
    }
    hr {
      border: 0;
      border-top: 1px solid #e5e7eb;
      margin: 1rem 0;
    }
    .note-text {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 1rem;
      font-style: italic;
    }
    .btn-email-link {
      display: inline-block;
      background: #4299e1;
      color: white;
      text-decoration: none;
      padding: 0.8rem 1.5rem;
      border-radius: 6px;
      font-weight: bold;
      transition: background 0.2s;
    }
    .btn-email-link:hover {
      background: #3182ce;
    }
`]
})
export class SubscriptionComponent {
  showPaymentModal = false;
  selectedPlan = '';
  processing = false;
  emailSent = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Escuchar cambios en tiempo real (ej: pago confirmado en otro dispositivo)
    this.authService.listenToUserChanges((user) => {
      if (user.role === 'premium') {
        this.handleSuccessfulSubscription();
      }
    });
  }

  subscribe(plan: string) {
    if (!this.authService.isLoggedIn()) {
      alert('Por favor inicia sesión primero');
      return;
    }
    this.selectedPlan = plan;
    this.showPaymentModal = true;
  }

  closeModal() {
    this.showPaymentModal = false;
    this.selectedPlan = '';
    this.emailSent = false;
  }

  async processPayment() {
    this.processing = true;
    try {
      // Simular espera de verificación
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Actualización directa (Simplificado por solicitud del usuario)
      await this.authService.upgradeToPremium();

      this.handleSuccessfulSubscription();
    } catch (error) {
      console.error('Error al procesar pago:', error);
      alert('Hubo un error al verificar el pago. Inténtalo de nuevo.');
    } finally {
      this.processing = false;
    }
  }

  private handleSuccessfulSubscription() {
    this.closeModal();
    alert('¡Pago Verificado! 🎉\nAhora eres miembro Premium.');
    window.location.reload();
  }
}
