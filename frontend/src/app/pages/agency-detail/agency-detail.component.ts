import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import agencesData from '../../mock/agences.json';
import vehiculesData from '../../mock/vehicule.json';

interface Agence {
  id: number;
  nom: string;
  description: string;
}
interface Vehicule {
  id: number;
  nom: string;
  description: string;
  categorie: string;
  dailyPrice: number;
  AgenceId: number;
}

@Component({
  selector: 'app-agency-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="wrap">
      <button class="back" (click)="goBack()">← Retour</button>
      <ng-container *ngIf="agence; else notFound">
        <header class="head">
          <h1>{{ agence.nom }}</h1>
          <div class="meta">Agence • {{ vehicules.length }} véhicule(s) disponible(s)</div>
        </header>
        <section class="content">
          <p class="desc">{{ agence.description }}</p>
          <div class="list">
            <div class="vcard" *ngFor="let v of vehicules" [routerLink]="['/vehicule', v.id]">
              <div class="vtitle">{{ v.nom }}</div>
              <div class="vmeta">
                {{ v.categorie }} • {{ v.dailyPrice | number : '1.0-2' }} € / jour
              </div>
            </div>
          </div>
        </section>
      </ng-container>
      <ng-template #notFound>
        <p>Agence introuvable.</p>
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
      .list {
        margin-top: 12px;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      @media (max-width: 700px) {
        .list {
          grid-template-columns: 1fr;
        }
      }
      .vcard {
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        padding: 12px;
        cursor: pointer;
        background: #fff;
      }
      .vcard:hover {
        background: #f8fafc;
      }
      .vtitle {
        font-weight: 700;
      }
      .vmeta {
        color: #475569;
        font-size: 12px;
      }
    `,
  ],
})
export class AgencyDetailComponent {
  agence?: Agence;
  vehicules: Vehicule[] = [];

  constructor(private route: ActivatedRoute, private router: Router) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const agences = agencesData as Agence[];
    this.agence = agences.find(a => a.id === id);
    const vehicules = vehiculesData as Vehicule[];
    this.vehicules = vehicules.filter(v => v.AgenceId === id);
  }

  goBack() {
    this.router.navigateByUrl('/');
  }
}
