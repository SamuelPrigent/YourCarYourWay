import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import userData from '../../mock/user.json';
import { Router } from '@angular/router';

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}
interface UserProfile {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  password: string; // hash (mock)
  adresse: string;
  paymentMethods: PaymentMethod[];
}

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
      <button class="back" (click)="goBack()">← Retour</button>

      <header class="head">
        <h1>Espace personnel</h1>
        <p class="subtitle">Gérez vos informations de compte et vos moyens de paiement</p>
      </header>

      <!-- Section: Informations personnelles -->
      <section class="section">
        <h2>Informations personnelles</h2>
        <form (ngSubmit)="saveProfile()" #formPerso="ngForm" class="form-vertical">
          <div class="row-2">
            <div class="col">
              <label for="nom">Nom</label>
              <input
                id="nom"
                name="nom"
                [(ngModel)]="profile().nom"
                required
                autocomplete="family-name"
              />
            </div>
            <div class="col">
              <label for="prenom">Prénom</label>
              <input
                id="prenom"
                name="prenom"
                [(ngModel)]="profile().prenom"
                required
                autocomplete="given-name"
              />
            </div>
          </div>

          <label for="adresse">Adresse</label>
          <input
            id="adresse"
            name="adresse"
            [(ngModel)]="profile().adresse"
            autocomplete="street-address"
          />

          <label for="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            [(ngModel)]="profile().email"
            required
            autocomplete="email"
          />

          <label for="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            name="password"
            [(ngModel)]="passwordEdit"
            placeholder="••••••••"
            autocomplete="new-password"
          />

          <div class="actions">
            <button class="btn primary" type="submit">Enregistrer</button>
          </div>
        </form>
      </section>

      <!-- Section: Moyens de paiement -->
      <section class="section">
        <h2>Moyens de paiement</h2>
        <div class="pm-grid">
          <div class="pm-card" *ngFor="let pm of profile().paymentMethods">
            <button
              class="pm-close"
              (click)="openRemovePmModal(pm.id)"
              aria-label="Supprimer ce moyen de paiement"
            >
              ✕
            </button>
            <div class="pm-brand">{{ pm.brand }}</div>
            <div class="pm-last">•••• {{ pm.last4 }}</div>
            <div class="pm-exp">{{ pm.expMonth | number : '2.0-0' }}/{{ pm.expYear }}</div>
          </div>
        </div>
        <div class="actions">
          <button class="btn">Ajouter un moyen de paiement</button>
        </div>
      </section>

      <!-- Section: Supprimer le compte -->
      <section class="section">
        <h2>Supprimer le compte</h2>
        <div class="actions">
          <button class="btn danger" (click)="openDeleteAccountModal()">
            Supprimer mon compte
          </button>
        </div>
      </section>

      <!-- Modal suppression compte -->
      <div class="modal-backdrop" *ngIf="showDeleteAccount()" (click)="closeDeleteAccountModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Confirmer la suppression</h3>
          <p>Veuillez saisir votre mot de passe pour confirmer.</p>
          <label for="confirmPassword" class="sr-only">Mot de passe</label>
          <input
            id="confirmPassword"
            class="modal-input"
            type="password"
            [(ngModel)]="confirmPassword"
            placeholder="Mot de passe"
            autocomplete="current-password"
          />
          <div class="modal-actions">
            <button class="btn" (click)="closeDeleteAccountModal()">Annuler</button>
            <button class="btn danger" (click)="confirmDeleteAccount()">Supprimer</button>
          </div>
        </div>
      </div>

      <!-- Modal suppression moyen de paiement -->
      <div class="modal-backdrop" *ngIf="removePmId()" (click)="closeRemovePmModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Supprimer ce moyen de paiement ?</h3>
          <p>Cette opération retirera le moyen de paiement de votre compte.</p>
          <div class="modal-actions">
            <button class="btn" (click)="closeRemovePmModal()">Annuler</button>
            <button class="btn danger" (click)="confirmRemovePm()">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .wrap {
        max-width: 910px;
        margin: 20px auto 40px;
        padding: 34px 32px 40px;
      }
      .back {
        margin: 4px 0 12px;
        background: transparent;
        border: 0;
        color: #1e3a8a;
        font-weight: 600;
        cursor: pointer;
      }
      .head {
        /* max-width: 870px;
        margin: auto; */
      }

      .head h1 {
        margin: 6px 0;
      }
      .subtitle {
        color: #6b7280;
        margin: 0 0 12px;
      }

      .section {
        /* max-width: 870px;
        margin: auto; */
        padding: 24px 0 40px;
        border-bottom: 1px solid #eef2f7;
      }
      .section:last-of-type {
        border-bottom: 0;
      }
      h2 {
        font-size: 20px;
        font-weight: 800;
        margin: 0 0 14px;
      }

      .form-vertical {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      @media (max-width: 720px) {
        .row-2 {
          grid-template-columns: 1fr;
        }
      }
      .col {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .col input {
        box-sizing: border-box;
      }

      label {
        font-weight: 600;
      }
      input {
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        height: 38px;
        padding: 0 10px;
        outline: none;
        background: #f8fafc;
        width: 100%;
        box-sizing: border-box;
      }
      input:focus {
        border-color: #93c5fd;
        box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.35);
      }
      .actions {
        margin-top: 10px;
      }

      .pm-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
        max-width: 980px;
      }
      @media (max-width: 1100px) {
        .pm-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      @media (max-width: 840px) {
        .pm-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 540px) {
        .pm-grid {
          grid-template-columns: 1fr;
        }
      }
      .pm-card {
        position: relative;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 16px;
        background: white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        min-height: 110px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .pm-close {
        position: absolute;
        top: 6px;
        right: 6px;
        background: #fee2e2;
        border: 1px solid #fecaca;
        color: #991b1b;
        border-radius: 8px;
        height: 24px;
        width: 24px;
        cursor: pointer;
      }
      .pm-brand {
        font-weight: 800;
        font-size: 16px;
        margin-bottom: 2px;
      }
      .pm-last {
        color: #111827;
        font-size: 18px;
        letter-spacing: 2px;
      }
      .pm-exp {
        color: #6b7280;
        font-size: 12px;
        margin-top: auto;
      }

      /* Boutons gris pour réduire le contraste avec le rouge */
      .btn {
        border: 1px solid #e5e7eb;
        background: #f8fafc;
        color: #374151;
        border-radius: 10px;
        height: 36px;
        padding: 0 12px;
        cursor: pointer;
      }
      .btn:hover {
        filter: brightness(0.98);
      }
      .btn.primary {
        border-color: #e5e7eb;
        background: #f1f5f9;
        font-weight: 700;
      }
      .btn.danger {
        border-color: #fecaca;
        background: #fee2e2;
        color: #991b1b;
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
        display: grid;
        place-items: center;
        z-index: 50;
      }
      .modal {
        width: min(520px, 92%);
        background: white;
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
      }
      .modal h3 {
        margin: 0 0 6px;
      }
      .modal p {
        margin: 0 0 10px;
        color: #374151;
      }
      .modal-input {
        width: 100%;
        margin-top: 8px auto;
        box-sizing: border-box;
      }
      .modal-input:focus {
        box-shadow: 0 0 0 3px rgba(147, 197, 253, 0.25);
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 15px;
      }
    `,
  ],
})
export class AccountComponent {
  constructor(private router: Router) {}

  profile = signal<UserProfile>(userData as UserProfile);

  passwordEdit = '';
  confirmPassword = '';

  // state modals
  showDeleteAccount = signal(false);
  removePmId = signal<string | null>(null);

  saveProfile() {
    const p = { ...this.profile() };
    if (this.passwordEdit) {
      p.password = '***updated***';
      this.passwordEdit = '';
    }
    this.profile.set(p);
  }

  // Delete Account modal
  openDeleteAccountModal() {
    this.showDeleteAccount.set(true);
  }
  closeDeleteAccountModal() {
    this.showDeleteAccount.set(false);
    this.confirmPassword = '';
  }
  confirmDeleteAccount() {
    // Simulation: on ferme la modale
    this.closeDeleteAccountModal();
  }

  // Remove PM modal
  openRemovePmModal(id: string) {
    this.removePmId.set(id);
  }
  closeRemovePmModal() {
    this.removePmId.set(null);
  }
  confirmRemovePm() {
    const id = this.removePmId();
    if (!id) return;
    const p = { ...this.profile() };
    p.paymentMethods = p.paymentMethods.filter(x => x.id !== id);
    this.profile.set(p);
    this.closeRemovePmModal();
  }

  goBack() {
    this.router.navigateByUrl('/');
  }
}
