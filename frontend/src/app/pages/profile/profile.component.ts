import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, AuthUser } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-card">
        <h2>Mi Perfil</h2>
        
        <div class="avatar-section">
          <img [src]="user?.avatar_url || 'https://ui-avatars.com/api/?name=' + (user?.nombre || 'User')" alt="Avatar" class="avatar-preview">
          <div class="role-badge" [class.premium]="isPremium">{{ user?.role | uppercase }}</div>
        </div>

        <form (ngSubmit)="saveProfile()" class="profile-form">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [value]="user?.email" disabled class="input-disabled">
          </div>

          <div class="form-group">
            <label>Nombre Completo</label>
            <input type="text" [(ngModel)]="nombre" name="nombre" placeholder="Tu nombre">
          </div>

          <div class="form-group">
            <label>Foto de Perfil</label>
            <div class="file-upload-wrapper">
              <input type="file" (change)="onFileSelected($event)" accept="image/*" id="avatar-upload" class="file-input">
              <label for="avatar-upload" class="btn-upload">
                {{ selectedFile ? 'Imagen seleccionada' : 'Subir nueva foto' }}
              </label>
            </div>
            <p class="help-text" *ngIf="selectedFile">{{ selectedFile.name }}</p>
          </div>

          <div class="actions">
            <button type="button" (click)="cancel()" class="btn-cancel">Cancelar</button>
            <button type="submit" class="btn-save" [disabled]="saving">
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>

        <div *ngIf="message" class="message" [class.error]="isError">
          {{ message }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 80vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f4f6f8;
      padding: 2rem;
    }
    .profile-card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    }
    h2 {
      text-align: center;
      color: #2d3748;
      margin-bottom: 2rem;
    }
    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 2rem;
      position: relative;
    }
    .avatar-preview {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #e2e8f0;
    }
    .role-badge {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      background: #718096;
      color: white;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
    }
    .role-badge.premium {
      background: #cc0000;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #4a5568;
      font-weight: 500;
    }
    input[type="text"], input[type="email"] {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid #cbd5e0;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    .file-input {
      display: none;
    }
    .btn-upload {
      display: inline-block;
      padding: 0.6rem 1rem;
      background: #edf2f7;
      color: #4a5568;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      border: 1px dashed #cbd5e0;
      width: 100%;
      text-align: center;
      box-sizing: border-box;
    }
    .btn-upload:hover {
      background: #e2e8f0;
      border-color: #a0aec0;
    }
    .help-text {
      font-size: 0.8rem;
      color: #718096;
      margin-top: 0.5rem;
    }
    .input-disabled {
      background: #edf2f7;
      color: #718096;
    }
    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }
    button {
      flex: 1;
      padding: 0.8rem;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      border: none;
    }
    .btn-cancel {
      background: #e2e8f0;
      color: #4a5568;
    }
    .btn-save {
      background: #cc0000;
      color: white;
    }
    .btn-save:disabled {
      background: #feb2b2;
    }
    .message {
      margin-top: 1rem;
      text-align: center;
      padding: 0.8rem;
      border-radius: 6px;
      background: #c6f6d5;
      color: #22543d;
    }
    .message.error {
      background: #fed7d7;
      color: #822727;
    }
  `]
})
export class ProfileComponent implements OnInit {
  user: AuthUser | null = null;
  nombre = '';
  avatarUrl = '';
  selectedFile: File | null = null;

  saving = false;
  message = '';
  isError = false;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.nombre = user.nombre || '';
        this.avatarUrl = user.avatar_url || '';
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  get isPremium() {
    return this.user?.role === 'premium';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async saveProfile() {
    this.saving = true;
    this.message = '';
    this.isError = false;

    try {
      let finalAvatarUrl = this.avatarUrl;

      // Si hay archivo seleccionado, subirlo primero
      if (this.selectedFile) {
        finalAvatarUrl = await this.authService.uploadAvatar(this.selectedFile);
      }

      await this.authService.updateProfile(this.nombre, finalAvatarUrl);
      this.message = 'Perfil actualizado correctamente';
      this.selectedFile = null; // Reset file selection
    } catch (error: any) {
      console.error('Error detallado al guardar perfil:', error);
      let errorMsg = error.message || 'Error desconocido';
      if (error.error && error.error.message) {
        errorMsg = error.error.message;
      }
      if (errorMsg.includes('storage')) {
        errorMsg = 'Error de almacenamiento. ¿Creaste el bucket "avatars" y es público?';
      }
      this.isError = true;
      this.message = 'Error: ' + errorMsg;
    } finally {
      this.saving = false;
    }
  }

  cancel() {
    this.router.navigate(['/']);
  }
}
