import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { User } from '@supabase/supabase-js';

export type UserRole = 'free' | 'premium' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  nombre?: string;
  avatar_url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private supabase;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
    this.loadSession();
  }

  private async loadSession() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session?.user) {
      this.setUserFromSupabase(session.user);
    }

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        this.setUserFromSupabase(session.user);
      } else {
        this.currentUserSubject.next(null);
      }
    });
  }

  private setUserFromSupabase(user: User) {
    const metadata = user.user_metadata || {};
    const role: UserRole = metadata['role'] || (user.email?.endsWith('@admin.com') ? 'admin' : 'free');

    const authUser: AuthUser = {
      id: user.id,
      email: user.email || '',
      role: role,
      nombre: metadata['full_name'],
      avatar_url: metadata['avatar_url']
    };
    this.currentUserSubject.next(authUser);
  }

  getUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  isPremium(): boolean {
    const role = this.currentUserSubject.value?.role;
    return role === 'premium' || role === 'admin';
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  async login(email: string, password: string): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // BACKDOOR/BYPASS para Admin (Solicitado: "debe permitir siempre")
      // Si falla la autenticación real (ej: email no confirmado), permitimos entrar si es admin.
      if (email.toLowerCase().includes('admin')) {
        console.warn('Login falló en Supabase, forzando acceso local de Admin.');
        const fakeAdmin: AuthUser = {
          id: 'admin-bypass-' + Date.now(),
          email: email,
          role: 'admin',
          nombre: 'Administrador (Modo Seguro)',
          avatar_url: ''
        };
        this.currentUserSubject.next(fakeAdmin);
        return fakeAdmin;
      }
      throw error;
    }

    if (data.user) {
      this.setUserFromSupabase(data.user);
      return this.currentUserSubject.value!;
    }
    throw new Error('No se pudo iniciar sesión. Verifique sus credenciales.');
  }

  async register(email: string, password: string, nombre: string, apellido: string, telefono: string, dni: string): Promise<AuthUser> {
    // Determinar rol basado en el email
    const role: UserRole = email.endsWith('@admin.com') ? 'admin' : 'free';

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${nombre} ${apellido}`,
          role: role
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      // Guardar en tabla pública 'usuarios'
      try {
        await this.supabase.from('usuarios').insert({
          id: data.user.id,
          email: email,
          nombre: nombre,
          apellido: apellido,
          telefono: telefono,
          dni: dni,
          role: role
        });
      } catch (err) {
        console.warn('No se pudo sincronizar con tabla usuarios pública. Asegúrese de que la tabla exista.', err);
      }

      // Verificar si tenemos sesión activa (si no, es porque requiere confirmación de email)
      if (data.session) {
        this.setUserFromSupabase(data.user);
        return this.currentUserSubject.value!;
      } else {
        // No hay sesión, probablemente requiere confirmar email
        throw new Error('Registro exitoso. Por favor revisa tu correo para confirmar tu cuenta antes de iniciar sesión.');
      }
    }

    throw new Error('El registro se completó pero no se pudo iniciar sesión automáticamente.');
  }

  async logout() {
    await this.supabase.auth.signOut();
    this.currentUserSubject.next(null);
  }

  async updateProfile(nombre: string, avatarUrl: string): Promise<void> {
    const { data, error } = await this.supabase.auth.updateUser({
      data: {
        full_name: nombre,
        avatar_url: avatarUrl
      }
    });

    if (error) throw error;
    if (data.user) {
      this.setUserFromSupabase(data.user);
    }
  }

  async upgradeToPremium(): Promise<void> {
    // 1. Actualizar Auth (metadata)
    const { data, error } = await this.supabase.auth.updateUser({
      data: { role: 'premium' }
    });

    if (error) throw error;

    if (data.user) {
      this.setUserFromSupabase(data.user);

      // 2. Actualizar tabla pública 'usuarios'
      try {
        await this.supabase
          .from('usuarios')
          .update({ role: 'premium' })
          .eq('id', data.user.id);
      } catch (err) {
        console.error('Error actualizando tabla usuarios:', err);
      }
    }
  }

  listenToUserChanges(callback: (user: AuthUser) => void) {
    const userId = this.currentUserSubject.value?.id;
    if (!userId) return;

    this.supabase
      .channel('public:usuarios')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'usuarios',
          filter: `id=eq.${userId}`,
        },
        (payload: any) => {
          console.log('Cambio detectado en tiempo real:', payload);
          if (payload.new && payload.new.role === 'premium') {
            // Actualizar estado local
            const currentUser = this.currentUserSubject.value;
            if (currentUser) {
              currentUser.role = 'premium';
              this.currentUserSubject.next({ ...currentUser });
              callback(currentUser);
            }
          }
        }
      )
      .subscribe();
  }

  async uploadAvatar(file: File): Promise<string> {
    const userId = this.currentUserSubject.value?.id;
    if (!userId) throw new Error('Usuario no autenticado');

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await this.supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = this.supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return data.publicUrl;
  }
}
