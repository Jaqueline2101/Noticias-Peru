import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="header">
      <!-- Top Bar: Date & Social -->
      <div class="top-bar">
        <div class="container top-bar-content">
          <div class="date-display">
            {{ currentDate | date:'fullDate' | titlecase }}
          </div>
          <div class="social-icons">
            <a href="#" class="social-icon">FB</a>
            <a href="#" class="social-icon">TW</a>
            <a href="#" class="social-icon">YT</a>
          </div>
        </div>
      </div>

      <!-- Brand Bar: Logo -->
      <div class="brand-bar">
        <div class="container brand-content">
          <div class="logo">
            <a routerLink="/">
              <span class="logo-icon">🇵🇪</span>
              <div class="logo-text">
                <h1>PORTAL NOTICIAS</h1>
                <span class="logo-subtitle">PERÚ</span>
              </div>
            </a>
          </div>
          <div class="ad-space">
            <img src="https://placehold.co/728x90/EEE/31343C?text=Publicidad" alt="Publicidad">
          </div>
        </div>
      </div>

      <!-- Nav Bar: Red Background -->
      <div class="nav-bar">
        <div class="container nav-content">
          <nav class="main-nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">INICIO</a>
            <a *ngFor="let cat of categorias" [routerLink]="['/categoria', cat]" routerLinkActive="active">
              {{ cat | uppercase }}
            </a>
            <a *ngIf="otrasCategorias.length > 0" routerLink="/categoria/General" routerLinkActive="active">OTROS</a>
          </nav>
          
          <div class="nav-controls">
            <div class="search-box" [class.active]="isSearchActive">
              <input 
                type="text" 
                placeholder="Buscar..." 
                [(ngModel)]="searchTerm"
                (keyup.enter)="onSearch()"
              />
              <button (click)="toggleSearch()">
                <span class="search-icon">🔍</span>
              </button>
            </div>
            
            <div class="user-controls">
              <a *ngIf="!isPremium" routerLink="/suscripcion" class="btn-subscribe">SUSCRÍBETE</a>

              <ng-container *ngIf="isLoggedIn; else loginBtn">
                <div class="user-menu-dropdown">
                  <div class="user-avatar" [class.premium-avatar]="isPremium">
                    {{ userEmail.charAt(0).toUpperCase() }}
                    <span *ngIf="isPremium" class="crown-icon">👑</span>
                  </div>
                  <div class="dropdown-content">
                    <a *ngIf="isAdmin" routerLink="/admin" class="dropdown-item">📊 Dashboard</a>
                    <a routerLink="/perfil" class="dropdown-item">👤 Mi Perfil</a>
                    <button (click)="logout()" class="dropdown-item logout">🚪 Salir</button>
                  </div>
                </div>
              </ng-container>
              <ng-template #loginBtn>
                <button (click)="openLoginModal()" class="btn-login">INGRESAR</button>
              </ng-template>
            </div>
          </div>
        </div>
      </div>

      <!-- ... ticker ... -->

      <!-- Login/Register Modal -->
      <div class="modal-overlay" *ngIf="showLoginModal" (click)="closeLoginModal()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <button class="close-btn" (click)="closeLoginModal()">×</button>
          
          <h2>{{ isRegisterMode ? 'Crear Cuenta' : 'Acceso al Portal' }}</h2>
          <p class="modal-subtitle">
            {{ isRegisterMode ? 'Únete a nuestra comunidad.' : 'Ingresa para acceder a contenido exclusivo.' }}
          </p>
          
          <form (ngSubmit)="isRegisterMode ? onRegister() : onLogin()" #authForm="ngForm" autocomplete="off">
            <div class="form-group" *ngIf="isRegisterMode">
              <label>Nombre</label>
              <input type="text" [(ngModel)]="registerName" name="name" required placeholder="Nombres" autocomplete="off">
            </div>
            <div class="form-group" *ngIf="isRegisterMode">
              <label>Apellido</label>
              <input type="text" [(ngModel)]="registerApellido" name="lastname" required placeholder="Apellidos" autocomplete="off">
            </div>
            <div class="form-group" *ngIf="isRegisterMode">
              <label>DNI</label>
              <input type="text" [(ngModel)]="registerDni" name="dni" required placeholder="DNI" maxlength="8" autocomplete="off">
            </div>
            <div class="form-group" *ngIf="isRegisterMode">
              <label>Teléfono</label>
              <input type="tel" [(ngModel)]="registerTelefono" name="phone" placeholder="Celular" autocomplete="off">
            </div>

            <div class="form-group">
              <label>Correo electrónico</label>
              <input type="email" [(ngModel)]="loginEmail" name="email" required placeholder="tu-email@ejemplo.com" autocomplete="off">
            </div>
            <div class="form-group">
              <label>Contraseña</label>
              <input type="password" [(ngModel)]="loginPassword" name="password" required placeholder="********" minlength="6" autocomplete="new-password">
            </div>
            
            <div class="info-box" *ngIf="!isRegisterMode">
              <small>Tip: Usa <code>&#64;premium.com</code> para acceso total.</small>
            </div>

            <button type="submit" class="btn-submit" [disabled]="loading || !authForm.form.valid">
              {{ loading ? 'Procesando...' : (isRegisterMode ? 'Registrarse' : 'Ingresar') }}
            </button>
            
            <p *ngIf="loginError" class="error-msg">{{ loginError }}</p>

            <div class="toggle-mode">
              <button type="button" (click)="toggleMode()">
                {{ isRegisterMode ? '¿Ya tienes cuenta? Ingresa aquí' : '¿No tienes cuenta? Regístrate aquí' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .header {
      position: relative;
      background-color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      font-family: 'Roboto', sans-serif;
    }

    /* Spacer removed */
    .header-spacer {
      display: none;
    }



    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    /* Top Bar */
    .top-bar {
      background-color: #1a1a1a;
      color: #e5e5e5;
      font-size: 0.75rem;
      padding: 0.4rem 0;
      border-bottom: 1px solid #333;
    }
    .top-bar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .social-icons {
      display: flex;
      gap: 1rem;
    }
    .social-icon {
      color: #ccc;
      text-decoration: none;
      transition: color 0.2s;
      font-weight: 500;
    }
    .social-icon:hover {
      color: #fff;
    }

    /* Brand Bar */
    .highlight:hover {
      background: #b30000;
      transform: translateY(-2px);
    }

    .admin-link {
      background: #333;
      color: white !important;
      border-radius: 20px;
      padding: 8px 16px !important;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .admin-link:hover {
      background: #555;
    }

    .mobile-menu-btn {
      display: none;
    }
    .brand-bar {
      background-color: white;
      border-bottom: 1px solid #eee;
    }
    .brand-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo a {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      text-decoration: none;
      color: #000;
    }
    .logo-icon {
      font-size: 2.5rem;
    }
    .logo-text h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 900;
      line-height: 1;
      letter-spacing: -0.05em;
      color: #cc0000;
    }
    .logo-subtitle {
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      color: #333;
      display: block;
    }
    .ad-space {
      display: none; /* Hidden on mobile/small screens */
    }
    @media (min-width: 768px) {
      .ad-space {
        display: block;
        width: 400px;
        height: 60px;
        background: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        font-size: 0.8rem;
        border: 1px dashed #ccc;
      }
    }

    /* Nav Bar */
    .nav-bar {
      background-color: #cc0000; /* News Red */
      color: white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 50px;
    }
    .main-nav {
      display: flex;
      height: 100%;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .main-nav::-webkit-scrollbar {
      display: none;
    }
    .main-nav a {
      color: white;
      text-decoration: none;
      font-weight: 700;
      font-size: 0.9rem;
      padding: 0 1.2rem;
      display: flex;
      align-items: center;
      height: 100%;
      transition: background 0.2s;
      white-space: nowrap;
    }
    .main-nav a:hover, .main-nav a.active {
      background-color: #990000;
    }

    .nav-controls {
      display: flex;
      align-items: center;
      height: 100%;
      background: #cc0000; /* Cover scroll overlap */
      position: relative;
      z-index: 2;
      padding-left: 1rem;
      box-shadow: -5px 0 10px -5px rgba(0,0,0,0.2);
    }

    /* Search */
    .search-box {
      display: flex;
      align-items: center;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      padding: 0.2rem;
      margin-right: 1rem;
    }
    .search-box input {
      background: transparent;
      border: none;
      color: white;
      width: 0;
      padding: 0;
      transition: width 0.3s;
      font-size: 0.9rem;
    }
    .search-box.active input {
      width: 150px;
      padding: 0 0.5rem;
    }
    .search-box input::placeholder {
      color: rgba(255,255,255,0.7);
    }
    .search-box input:focus {
      outline: none;
    }
    .search-box button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0.3rem 0.5rem;
      font-size: 1rem;
    }

    /* User Controls */
    .user-controls {
      display: flex;
      align-items: center;
    }
    .btn-login {
      background: white;
      color: #cc0000;
      padding: 0.3rem 0.8rem;
      border-radius: 3px;
      font-weight: 700;
      font-size: 0.8rem;
      text-decoration: none;
      cursor: pointer;
    }
    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .user-avatar {
      width: 30px;
      height: 30px;
      background: #990000;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 0.8rem;
      border: 2px solid rgba(255,255,255,0.3);
      color: white;
      position: relative;
    }
    .premium-avatar {
      border-color: #ffd700;
      background: #1a1a1a;
    }
    .crown-icon {
      position: absolute;
      top: -8px;
      right: -8px;
      font-size: 0.8rem;
    }
    .btn-subscribe {
      background: #ffd700;
      color: #1a1a1a;
      padding: 0.3rem 0.8rem;
      border-radius: 3px;
      font-weight: 800;
      font-size: 0.8rem;
      text-decoration: none;
      margin-right: 0.5rem;
      transition: background 0.2s;
    }
    .btn-subscribe:hover {
      background: #ffed4a;
    }
    .btn-logout {
      background: none;
      border: none;
      color: rgba(255,255,255,0.8);
      cursor: pointer;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 600;
    }
    .btn-logout:hover {
      color: white;
    }

    /* Ticker Bar */
    .ticker-bar {
      background-color: #f5f5f5;
      border-bottom: 1px solid #ddd;
      height: 40px;
      overflow: hidden;
    }
    .ticker-content {
      display: flex;
      height: 100%;
    }
    .ticker-label {
      background: #e0e0e0;
      color: #cc0000;
      font-weight: 800;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      padding: 0 1rem;
      white-space: nowrap;
      z-index: 2;
    }
    .pulsing-dot {
      color: #cc0000;
      margin-right: 0.5rem;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
    .ticker-wrapper {
      flex: 1;
      display: flex;
      align-items: center;
      overflow: hidden;
      position: relative;
    }
    .ticker-track {
      display: flex;
      align-items: center;
      white-space: nowrap;
      animation: ticker 30s linear infinite;
      padding-left: 100%; /* Start off-screen */
    }
    .ticker-item {
      display: flex;
      align-items: center;
    }
    .ticker-item a {
      color: #333;
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      padding: 0 1rem;
    }
    .ticker-item a:hover {
      color: #cc0000;
      text-decoration: underline;
    }
    .separator {
      color: #ccc;
    }
    @keyframes ticker {
      0% { transform: translateX(0); }
      100% { transform: translateX(-100%); }
    }
    .ticker-wrapper:hover .ticker-track {
      animation-play-state: paused;
    }

    .header-spacer {
      display: none;
    }

    /* Modal Styles */
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
      padding: 2rem;
      border-radius: 8px;
      width: 100%;
      max-width: 360px;
      position: relative;
      box-shadow: 0 20px 50px rgba(0,0,0,0.3);
      max-height: 90vh;
      overflow-y: auto;
    }
    .close-btn {
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
    }
    .modal-content h2 {
      margin: 0 0 0.5rem 0;
      color: #cc0000;
      font-size: 1.5rem;
    }
    .modal-subtitle {
      color: #666;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.3rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #333;
    }
    .form-group input {
      width: 100%;
      padding: 0.6rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 0.95rem;
    }
    .form-group input:focus {
      border-color: #cc0000;
      outline: none;
    }
    .btn-submit {
      width: 100%;
      background: #cc0000;
      color: white;
      border: none;
      padding: 0.7rem;
      border-radius: 4px;
      font-weight: 700;
      cursor: pointer;
      margin-top: 1rem;
    }
    .btn-submit:hover {
      background: #990000;
    }
    .btn-submit:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    .info-box {
      background: #fff8e1;
      padding: 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      color: #856404;
      margin-bottom: 1rem;
    }
    .error-msg {
      color: #dc3545;
      font-size: 0.85rem;
      margin-top: 1rem;
      text-align: center;
    }

    @media (max-width: 768px) {
      .header-spacer {
        height: 180px;
      }
      .brand-bar {
        padding: 1rem 0;
      }
      .logo-text h1 {
        font-size: 1.4rem;
      }
      .nav-content {
        height: 45px;
      }
    }
    
    /* Dropdown */
    .user-menu-dropdown {
      position: relative;
      cursor: pointer;
    }
    .user-menu-dropdown:hover .dropdown-content {
      display: block;
    }
    .dropdown-content {
      display: none;
      position: absolute;
      right: 0;
      top: 100%;
      background-color: white;
      min-width: 160px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      z-index: 1;
      border-radius: 4px;
      overflow: hidden;
    }
    .dropdown-item {
      color: #333;
      padding: 12px 16px;
      text-decoration: none;
      display: block;
      font-size: 0.9rem;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
    }
    .dropdown-item:hover {
      background-color: #f1f1f1;
    }
    .dropdown-item.logout {
      color: #cc0000;
      border-top: 1px solid #eee;
    }

    .toggle-mode {
      margin-top: 1rem;
      text-align: center;
    }
    .toggle-mode button {
      background: none;
      border: none;
      color: #666;
      text-decoration: underline;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .toggle-mode button:hover {
      color: #cc0000;
    }
  `]
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  isPremium = false;
  userEmail = '';
  searchTerm = '';
  isSearchActive = false;
  currentDate = new Date();

  // Login/Register Modal State
  showLoginModal = false;
  isRegisterMode = false;
  loginEmail = '';
  loginPassword = '';
  registerName = '';
  registerApellido = '';
  registerTelefono = '';
  registerDni = '';
  loading = false;
  loginError: string | null = null;
  isAdmin = false;

  categorias: string[] = [];
  otrasCategorias: string[] = [];
  latestNews: any[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private supabaseService: SupabaseService
  ) { }

  ngOnInit() {
    // Subscribe to user state
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.userEmail = user?.email || '';
      this.isPremium = user?.role === 'premium';
      this.isAdmin = user?.role === 'admin';
    });

    // Fetch latest news for ticker
    this.loadTickerNews();

    // Fetch categories
    this.loadCategorias();
  }

  async loadCategorias() {
    try {
      const allCats = await this.supabaseService.getCategorias();
      // Mostrar TODAS las categorías disponibles
      this.categorias = allCats;
      this.otrasCategorias = [];
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async loadTickerNews() {
    try {
      const news = await this.supabaseService.getNoticiasFiltradas({
        page: 1,
        limit: 10
      });
      this.latestNews = news;
    } catch (error) {
      console.error('Error loading ticker news:', error);
    }
  }

  toggleSearch() {
    this.isSearchActive = !this.isSearchActive;
    if (this.isSearchActive) {
      setTimeout(() => {
        const input = document.querySelector('.search-box input') as HTMLElement;
        if (input) input.focus();
      }, 100);
    } else if (this.searchTerm) {
      this.onSearch();
    }
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/buscar'], { queryParams: { q: this.searchTerm } });
      this.isSearchActive = false;
    }
  }

  openLoginModal() {
    this.showLoginModal = true;
    this.isRegisterMode = false;
    this.loginError = null;
    this.loginEmail = '';
    this.loginPassword = '';
    this.registerName = '';
    this.registerApellido = '';
    this.registerTelefono = '';
    this.registerDni = '';
  }

  closeLoginModal() {
    this.showLoginModal = false;
  }

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.loginError = null;
  }

  async onLogin() {
    if (!this.loginEmail || !this.loginPassword) return;

    this.loading = true;
    this.loginError = null;

    try {
      await this.authService.login(this.loginEmail, this.loginPassword);
      this.closeLoginModal();
      // window.location.reload(); // No reload needed with observable
    } catch (err: any) {
      console.error('Login error:', err);
      // Mostrar mensaje específico de Supabase si existe
      this.loginError = err.message || err.error_description || 'Credenciales inválidas o error de conexión';

      if (this.loginError?.includes('Email not confirmed')) {
        this.loginError = 'Debes confirmar tu correo electrónico antes de ingresar.';
      } else if (this.loginError?.includes('Invalid login credentials')) {
        this.loginError = 'Correo o contraseña incorrectos.';
      }
    } finally {
      this.loading = false;
    }
  }

  async onRegister() {
    if (!this.loginEmail || !this.loginPassword || !this.registerName || !this.registerApellido || !this.registerDni) return;

    this.loading = true;
    this.loginError = null;

    try {
      await this.authService.register(
        this.loginEmail,
        this.loginPassword,
        this.registerName,
        this.registerApellido,
        this.registerTelefono,
        this.registerDni
      );

      // Éxito: Cambiar a modo login, manteniendo los datos llenos ("ya puestos")
      this.isRegisterMode = false;
      this.loginError = null; // Limpiar error si hubo

      // Mensaje de éxito (opcional, o usar un alert/toast)
      alert('¡Cuenta creada exitosamente! Por favor confirma tu ingreso.');

    } catch (err: any) {
      this.loginError = 'Error al registrar: ' + (err.message || 'Intente nuevamente');
    } finally {
      this.loading = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    window.location.reload();
  }
}
