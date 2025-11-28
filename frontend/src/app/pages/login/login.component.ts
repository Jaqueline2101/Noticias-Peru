import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-container">
      <div class="container">
        <div class="login-card">
          <h1>{{ isRegistering ? 'Crear Cuenta' : 'Acceso al Portal' }}</h1>
          <p class="subtitle">
            {{ isRegistering ? 'Únete para acceder a noticias exclusivas.' : 'Ingresa para disfrutar de contenido' }}
            <span *ngIf="!isRegistering" class="highlight">gratuito</span>
            <span *ngIf="!isRegistering"> y </span>
            <span *ngIf="!isRegistering" class="highlight premium">premium</span>.
          </p>

          <form (ngSubmit)="onSubmit()" #authForm="ngForm">
            <!-- Campos de Registro -->
            <div *ngIf="isRegistering" class="register-grid">
              <div class="form-group">
                <label for="nombre">Nombre</label>
                <input id="nombre" name="nombre" type="text" required [(ngModel)]="nombre" placeholder="Juan" />
              </div>
              <div class="form-group">
                <label for="apellido">Apellido</label>
                <input id="apellido" name="apellido" type="text" required [(ngModel)]="apellido" placeholder="Pérez" />
              </div>
              <div class="form-group">
                <label for="dni">DNI</label>
                <input id="dni" name="dni" type="text" required [(ngModel)]="dni" placeholder="12345678" maxlength="8" />
              </div>
              <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input id="telefono" name="telefono" type="tel" required [(ngModel)]="telefono" placeholder="987654321" />
              </div>
            </div>

            <div class="form-group">
              <label for="email">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                [(ngModel)]="email"
                placeholder="tu-email@ejemplo.com"
              />
            </div>

            <div class="form-group">
              <label for="password">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                [(ngModel)]="password"
                placeholder="********"
                minlength="6"
              />
            </div>

            <div class="info-box" *ngIf="!isRegistering">
              <p>
                Para probar el modo <strong>premium</strong>, usa un correo que termine en
                <code>&#64;premium.com</code>
              </p>
            </div>

            <button class="btn-primary" type="submit" [disabled]="loading || !authForm.form.valid">
              <span *ngIf="!loading">{{ isRegistering ? 'Registrarse' : 'Ingresar' }}</span>
              <span *ngIf="loading">Procesando...</span>
            </button>

            <p *ngIf="error" class="error">{{ error }}</p>
          </form>

          <div class="toggle-auth">
            <p>
              {{ isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?' }}
              <button class="btn-link-inline" type="button" (click)="toggleMode()">
                {{ isRegistering ? 'Inicia sesión aquí' : 'Regístrate aquí' }}
              </button>
            </p>
          </div>

          <button class="btn-link" type="button" routerLink="/">
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: calc(100vh - 100px);
        display: flex;
        align-items: center;
        padding: 2rem 0;
      }
      .container {
        max-width: 450px;
        margin: 0 auto;
        padding: 0 1rem;
      }
      .login-card {
        background: #fff7f2;
        border-radius: 16px;
        padding: 2.5rem 2rem;
        box-shadow: 0 8px 24px rgba(60, 32, 20, 0.25);
        border: 1px solid rgba(120, 53, 15, 0.2);
      }
      h1 {
        margin: 0 0 0.75rem 0;
        font-size: 1.8rem;
        color: #4a2511;
        text-align: center;
      }
      .subtitle {
        margin-bottom: 1.5rem;
        color: #7c6f64;
        font-size: 0.95rem;
        text-align: center;
      }
      .highlight {
        font-weight: 600;
        color: #8b4513;
      }
      .highlight.premium {
        color: #7b1e3a;
      }
      .form-group {
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .register-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      @media (max-width: 480px) {
        .register-grid {
          grid-template-columns: 1fr;
          gap: 0;
        }
      }
      label {
        font-size: 0.9rem;
        color: #5b3a29;
        font-weight: 500;
      }
      input {
        padding: 0.6rem 0.75rem;
        border-radius: 8px;
        border: 1px solid #e2d6cf;
        font-size: 0.95rem;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        background: #fffdfa;
        width: 100%;
        box-sizing: border-box;
      }
      input:focus {
        border-color: #9b2c2c;
        box-shadow: 0 0 0 1px rgba(155, 44, 44, 0.2);
      }
      .info-box {
        background: #fef3c7;
        border-radius: 8px;
        padding: 0.75rem;
        margin: 0.75rem 0 1.25rem 0;
        font-size: 0.85rem;
        color: #7c2d12;
        border: 1px solid rgba(180, 83, 9, 0.3);
      }
      .info-box code {
        background: #fef9c3;
        padding: 0.1rem 0.25rem;
        border-radius: 4px;
        font-size: 0.8rem;
      }
      .btn-primary {
        width: 100%;
        padding: 0.8rem 1rem;
        border-radius: 999px;
        border: none;
        background: linear-gradient(135deg, #7b341e, #9b2c2c);
        color: #fffaf0;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        margin-top: 1rem;
        transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        box-shadow: 0 8px 18px rgba(123, 52, 30, 0.4);
      }
      .btn-primary:hover:enabled {
        transform: translateY(-1px);
        box-shadow: 0 10px 22px rgba(123, 52, 30, 0.5);
        opacity: 0.95;
      }
      .btn-primary:disabled {
        opacity: 0.7;
        cursor: default;
        box-shadow: none;
      }
      .toggle-auth {
        margin-top: 1.5rem;
        text-align: center;
        font-size: 0.9rem;
        color: #5b3a29;
      }
      .btn-link-inline {
        background: none;
        border: none;
        color: #9b2c2c;
        font-weight: 600;
        cursor: pointer;
        text-decoration: underline;
        padding: 0;
        font-size: inherit;
      }
      .btn-link {
        display: block;
        width: 100%;
        margin-top: 1.5rem;
        background: none;
        border: none;
        color: #7b341e;
        font-size: 0.9rem;
        cursor: pointer;
        text-decoration: none;
        text-align: center;
      }
      .btn-link:hover {
        text-decoration: underline;
      }
      .error {
        margin-top: 1rem;
        color: #9b2c2c;
        font-size: 0.9rem;
        text-align: center;
        background: rgba(155, 44, 44, 0.1);
        padding: 0.5rem;
        border-radius: 6px;
      }
    `,
  ],
})
export class LoginComponent {
  isRegistering = false;

  // Login & Register
  email = '';
  password = '';

  // Register only
  nombre = '';
  apellido = '';
  dni = '';
  telefono = '';

  loading = false;
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) { }

  toggleMode() {
    this.isRegistering = !this.isRegistering;
    this.error = null;
  }

  async onSubmit() {
    this.loading = true;
    this.error = null;

    try {
      if (this.isRegistering) {
        await this.auth.register(
          this.email.trim(),
          this.password,
          this.nombre.trim(),
          this.apellido.trim(),
          this.telefono.trim(),
          this.dni.trim()
        );
      } else {
        await this.auth.login(this.email.trim(), this.password);
      }

      // Redirect on success (both login and register now auto-login)
      await this.router.navigateByUrl('/');

    } catch (err: any) {
      console.error(err);
      if (this.isRegistering) {
        this.error = 'No se pudo registrar. Verifique los datos o intente con otro correo.';
      } else {
        this.error = 'No se pudo iniciar sesión. Verifique sus credenciales.';
      }
    } finally {
      this.loading = false;
    }
  }
}
