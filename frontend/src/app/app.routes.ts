import { Routes } from '@angular/router';
import { ChatUserComponent } from './pages/chat-user/chat-user.component';
import { ChatSupportComponent } from './pages/chat-support/chat-support.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'john' },
  { path: 'john', component: ChatUserComponent },
  { path: 'support', component: ChatSupportComponent },
  { path: '**', redirectTo: 'john' },
];
