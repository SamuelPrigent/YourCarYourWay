import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <nav class="nav">
        <a routerLink="/john" routerLinkActive="active">John (user)</a>
        <a routerLink="/support" routerLinkActive="active">Tom (Support)</a>
      </nav>
    </header>
  `,
  styles: [
    `
      .header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: saturate(1.2) blur(6px);
      }
      .nav {
        display: flex;
        gap: 12px;
      }
      a {
        text-decoration: none;
        color: #444;
        font-weight: 500;
      }
      a.active {
        color: rgb(35, 24, 194);
      }
    `,
  ],
})
export class HeaderComponent {}
