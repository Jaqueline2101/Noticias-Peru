import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { NoticiaDetailComponent } from './pages/noticia-detail/noticia-detail.component';
import { BusquedaComponent } from './pages/busqueda/busqueda.component';
import { CategoriaComponent } from './pages/categoria/categoria.component';
import { SubscriptionComponent } from './pages/subscription/subscription.component';


export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'noticia/:id', component: NoticiaDetailComponent },
  { path: 'buscar', component: BusquedaComponent },
  { path: 'categoria/:id', component: CategoriaComponent },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  { path: 'suscripcion', component: SubscriptionComponent },
  {
    path: 'validar-suscripcion',
    loadComponent: () => import('./pages/subscription/validate-subscription.component').then(m => m.ValidateSubscriptionComponent)
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  { path: '**', redirectTo: '' }
];
