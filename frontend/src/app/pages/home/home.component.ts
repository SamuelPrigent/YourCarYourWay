import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Import JSON mocks (requires resolveJsonModule enabled in tsconfig)
import vehiculesData from '../../mock/vehicule.json';
import agencesData from '../../mock/agences.json';

interface Vehicule {
  id: number;
  nom: string;
  description: string;
  categorie: string; // ACRISS (4 chars)
  dailyPrice: number; // DECIMAL(12,2)
  AgenceId: number;
}

interface Agence {
  id: number;
  nom: string;
  description: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="hero">
      <h1>Your Car Your Way</h1>
      <p>Location de véhicule partout en Europe</p>
    </section>

    <section class="search-bar">
      <div class="search-input">
        <input type="text" placeholder="Où allez-vous ?" />
        <div class="mode">
          <button class="mode-btn" (click)="toggleMode()" [attr.aria-expanded]="dropdownOpen()">
            {{ mode() === 'vehicules' ? 'Véhicules' : 'Agences' }}
            <span class="chev">▾</span>
          </button>
          <div class="dropdown" *ngIf="dropdownOpen()">
            <button (click)="setMode('vehicules')" [class.active]="mode() === 'vehicules'">
              Véhicules
            </button>
            <button (click)="setMode('agences')" [class.active]="mode() === 'agences'">
              Agences
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="grid" *ngIf="mode() === 'vehicules'">
      <a class="card" *ngFor="let v of vehicules" [routerLink]="['/vehicule', v.id]">
        <div class="title">{{ v.nom }}</div>
        <div class="meta">{{ v.categorie }} • {{ v.dailyPrice | number : '1.0-2' }} € / jour</div>
        <p class="desc">{{ v.description }}</p>
      </a>
    </section>

    <section class="grid" *ngIf="mode() === 'agences'">
      <a class="card" *ngFor="let a of agences" [routerLink]="['/agence', a.id]">
        <div class="title">{{ a.nom }}</div>
        <p class="desc">{{ a.description }}</p>
      </a>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .hero {
        text-align: center;
        padding: 72px 16px 24px;
      }
      .hero h1 {
        font-size: 48px;
        margin: 0 0 8px;
        letter-spacing: -0.5px;
      }
      .hero p {
        color: #4b5563;
        margin: 0;
      }

      .search-bar {
        padding: 16px;
        display: flex;
        justify-content: center;
      }
      .search-input {
        width: min(1100px, 100%);
        position: relative;
        display: flex;
      }
      .search-input input {
        flex: 1;
        height: 48px;
        padding: 0 14px;
        border: 1px solid #cbd5e1;
        border-radius: 12px;
        background: #f8fafc;
        outline: none;
      }
      .search-input input:focus {
        border-color: #93c5fd;
        box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.35);
      }

      .mode {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
      }
      .mode-btn {
        height: 34px;
        padding: 0 10px;
        border-radius: 8px;
        border: 1px solid #bfdbfe;
        background: #e0f2fe;
        color: #1e3a8a;
        font-weight: 600;
        cursor: pointer;
      }
      .mode-btn .chev {
        margin-left: 6px;
      }
      .dropdown {
        position: absolute;
        right: 0;
        margin-top: 6px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        padding: 6px;
        min-width: 140px;
        z-index: 10;
      }
      .dropdown button {
        display: block;
        width: 100%;
        text-align: left;
        background: transparent;
        border: 0;
        padding: 8px 10px;
        border-radius: 6px;
        cursor: pointer;
      }
      .dropdown button:hover {
        background: #f3f4f6;
      }
      .dropdown button.active {
        background: #dbeafe;
        color: #1e3a8a;
        font-weight: 600;
      }

      .grid {
        padding: 24px 16px 48px;
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
        max-width: 1100px;
        margin: 0 auto;
      }
      @media (max-width: 1100px) {
        .grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      @media (max-width: 840px) {
        .grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 540px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }

      .card {
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 14px;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        text-decoration: none;
        color: inherit;
        display: block;
      }
      .card .title {
        font-weight: 700;
        margin-bottom: 4px;
      }
      .card .meta {
        font-size: 12px;
        color: #475569;
        margin-bottom: 8px;
      }
      .card .desc {
        color: #374151;
        margin: 0;
      }
    `,
  ],
})
export class HomeComponent {
  // state
  mode = signal<'vehicules' | 'agences'>('vehicules');
  dropdownOpen = signal(false);

  vehicules: Vehicule[] = vehiculesData as Vehicule[];
  agences: Agence[] = agencesData as Agence[];

  toggleMode() {
    this.dropdownOpen.set(!this.dropdownOpen());
  }
  setMode(m: 'vehicules' | 'agences') {
    this.mode.set(m);
    this.dropdownOpen.set(false);
  }
}
