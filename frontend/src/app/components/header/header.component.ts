import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <nav class="nav">
        <div class="left">
          <a routerLink="/" routerLinkActive="active" class="link">Accueil</a>
          <a routerLink="/compte" routerLinkActive="active" class="link">Compte</a>
        </div>
        <div class="right">
          <a class="combo" aria-label="Ouvrir John ou Tom">
            <span class="opt">
              <a routerLink="/john" routerLinkActive="active-inner">John</a>
            </span>
            <span class="divider"></span>
            <span class="opt">
              <a routerLink="/support" routerLinkActive="active-inner">Support</a>
            </span>
          </a>
        </div>
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
        padding: 10px 16px;
        border-bottom: 1px solid #eee;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: saturate(1.2) blur(6px);
      }
      .nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .left {
        display: flex;
        gap: 16px;
      }
      .left .link {
        color: #374151;
      }
      a {
        text-decoration: none;
        color: #444;
        font-weight: 500;
      }
      a.active {
        color: rgb(35, 24, 194);
      }
      .combo {
        display: inline-flex;
        align-items: center;
        gap: 0;
        /* background: #e6f0ff;
        border: 1px solid #c7dbff;
        color: #173a8b; */
        /*  */
        background: #f9f9f9;
        border: 1px solid #d9d9d9;
        color: #242424;
        padding: 6px 8px;
        border-radius: 999px;
      }
      .combo .opt a {
        color: #173a8b;
        padding: 2px 10px;
        display: inline-block;
      }
      .combo .opt a.active-inner {
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      .combo .divider {
        width: 1px;
        height: 18px;
        background: rgba(0, 0, 0, 0.15);
        margin: 0 4px;
      }
    `,
  ],
})
export class HeaderComponent {}
