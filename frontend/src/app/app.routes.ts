import { Routes } from '@angular/router';
import { ChatUserComponent } from './pages/chat-user/chat-user.component';
import { ChatSupportComponent } from './pages/chat-support/chat-support.component';
import { HomeComponent } from './pages/home/home.component';
import { VehicleDetailComponent } from './pages/vehicle-detail/vehicle-detail.component';
import { AgencyDetailComponent } from './pages/agency-detail/agency-detail.component';
import { AccountComponent } from './pages/account/account.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'john', component: ChatUserComponent },
  { path: 'support', component: ChatSupportComponent },
  { path: 'vehicule/:id', component: VehicleDetailComponent },
  { path: 'agence/:id', component: AgencyDetailComponent },
  { path: 'compte', component: AccountComponent },
  { path: '**', redirectTo: '' },
];
