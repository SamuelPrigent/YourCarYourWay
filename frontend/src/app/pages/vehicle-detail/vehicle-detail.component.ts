import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import vehiculesData from '../../mock/vehicule.json';
import agencesData from '../../mock/agences.json';

interface Vehicule {
  id: number;
  nom: string;
  description: string;
  categorie: string; // ACRISS
  dailyPrice: number;
  AgenceId: number;
}
interface Agence {
  id: number;
  nom: string;
  description: string;
}

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="wrap">
      <button class="back" (click)="goBack()">← Retour</button>
      <ng-container *ngIf="vehicule; else notFound">
        <header class="head">
          <h1>{{ vehicule.nom }}</h1>
          <div class="meta">
            {{ vehicule.categorie }} • {{ vehicule.dailyPrice | number : '1.0-2' }} € / jour
          </div>
        </header>
        <section class="content">
          <p class="desc">{{ vehicule.description }}</p>
          <div class="agency" *ngIf="agence">
            <div class="agency-title">Agence de retrait</div>
            <div class="agency-name">{{ agence.nom }}</div>
            <div class="agency-desc">{{ agence.description }}</div>
          </div>
        </section>
        <footer class="actions">
          <button class="cta">Réserver ce véhicule</button>
        </footer>
      </ng-container>
      <ng-template #notFound>
        <p>Véhicule introuvable.</p>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .wrap {
        max-width: 980px;
        margin: 20px auto;
        padding: 16px 32px;
      }
      .back {
        margin: 12px 0 8px;
        background: transparent;
        border: 0;
        color: #1e3a8a;
        font-weight: 600;
        cursor: pointer;
      }
      .head h1 {
        margin: 8px 0 4px;
        font-size: 28px;
      }
      .meta {
        color: #475569;
        font-size: 14px;
      }
      .content {
        margin-top: 16px;
      }
      .desc {
        color: #374151;
      }
      .agency {
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 12px;
        background: white;
        margin-top: 12px;
      }
      .agency-title {
        font-size: 12px;
        color: #6b7280;
      }
      .agency-name {
        font-weight: 700;
      }
      .actions {
        margin-top: 20px;
      }
      .cta {
        background: #1e3a8a;
        color: white;
        border: 0;
        padding: 10px 14px;
        border-radius: 10px;
        cursor: pointer;
      }
      .cta:hover {
        filter: brightness(1.05);
      }
    `,
  ],
})
export class VehicleDetailComponent {
  vehicule?: Vehicule;
  agence?: Agence;

  constructor(private route: ActivatedRoute, private router: Router) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const list = vehiculesData as Vehicule[];
    this.vehicule = list.find(v => v.id === id);
    if (this.vehicule) {
      const agences = agencesData as Agence[];
      this.agence = agences.find(a => a.id === this.vehicule!.AgenceId);
    }
  }

  goBack() {
    this.router.navigateByUrl('/');
  }
}
