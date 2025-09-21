import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WsService } from '../../services/ws.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-user',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <section class="chat-page user-theme">
      <div class="messages" #messages>
        <ng-container *ngFor="let msg of messagesList; let i = index; trackBy: trackById">
          <div class="day-separator" *ngIf="isNewDay(i)">
            {{ msg.createdAt | date : 'dd/MM/yy' }}
          </div>
          <div class="message-row" [class.own]="msg.fromUserId === currentUserId">
            <div class="bubble">
              <div class="text">{{ msg.message }}</div>
              <div class="meta">{{ msg.createdAt | date : 'HH:mm' }}</div>
            </div>
          </div>
        </ng-container>
      </div>
    </section>
    <form class="composer" (ngSubmit)="send()">
      <input
        type="text"
        name="draft"
        [(ngModel)]="draft"
        placeholder="Votre message..."
        aria-label="Votre message"
      />
      <button type="submit" aria-label="Envoyer" [disabled]="isSending || !draft.trim()">
        <img src="assets/send.svg" alt="Envoyer" />
      </button>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .chat-page {
        /* Hauteur fixe relative au viewport pour déclencher l'overflow interne */
        --composer-h: 64px;
        height: calc(100vh - 56px); /* 56px ~ header */
        display: flex;
        flex-direction: column;
        overflow: hidden; /* évite un espace sous le composer sticky */
      }
      .user-theme {
        background: #eaf3ff;
      }
      .messages {
        flex: 1 1 auto;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: 16px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .day-separator {
        align-self: center;
        margin: 6px 0 10px;
        padding: 4px 10px;
        font-size: 12px;
        color: #374151;
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 999px;
        box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
      }
      .message-row {
        display: flex;
        justify-content: flex-start;
      }
      .message-row.own {
        justify-content: flex-end;
      }

      .bubble {
        max-width: min(80%, 640px);
        padding: 10px 12px;
        border-radius: 14px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        background: white;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
      }
      .message-row.own .bubble {
        background: linear-gradient(180deg, #d5e7ff 0%, #c6ddff 100%);
        border-color: #9ec6ff;
      }

      .text {
        color: #1f2937;
      }
      .meta {
        margin-top: 6px;
        font-size: 0.75rem;
        color: #6b7280;
        text-align: right;
      }

      .composer {
        position: sticky;
        bottom: 0;
        margin: 0;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: var(--composer-h);
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: saturate(1.2) blur(4px);
      }
      .composer input[type='text'] {
        flex: 1;
        height: 42px;
        padding: 0 12px;
        border: 1px solid #a5c8ff;
        border-radius: 10px;
        outline: none;
        background: #f6faff;
      }
      .composer input[type='text']:focus {
        border-color: #7bb1ff;
        box-shadow: 0 0 0 3px rgba(123, 177, 255, 0.2);
      }
      .composer button {
        width: 42px;
        height: 42px;
        border: 1px solid #7bb1ff;
        border-radius: 10px;
        background: linear-gradient(180deg, #cfe3ff 0%, #b7d4ff 100%);
        color: #1f4ea3;
        display: grid;
        place-items: center;
        cursor: pointer;
      }
      .composer button:hover {
        filter: saturate(1.1);
      }
      .composer img {
        width: 20px;
        height: 20px;
      }
    `,
  ],
})
export class ChatUserComponent implements OnInit, OnDestroy, AfterViewInit {
  messagesList: any[] = [];
  currentUserId = 1;
  draft = '';
  isSending = false;
  private wsSub?: Subscription;
  @ViewChild('messages') private messagesRef?: ElementRef<HTMLDivElement>;

  trackById(index: number, item: any) {
    return item.id;
  }

  constructor(private http: HttpClient, private ws: WsService, private zone: NgZone) {}

  ngOnInit(): void {
    this.loadConversation();
    // subscribe to real-time updates for conversation (1,2) with both orders
    this.wsSub = this.ws.subscribeConversationAnyOrder(1, 2).subscribe(msg => {
      const normalized = this.normalizeMessage(msg);
      this.zone.run(() => {
        if (normalized && typeof normalized === 'object' && 'id' in normalized) {
          const exists = this.messagesList.some((m: any) => m.id === (normalized as any).id);
          if (!exists) {
            this.messagesList = [...this.messagesList, normalized as any];
            setTimeout(() => this.scrollToBottom(true), 0);
          }
        } else {
          this.messagesList = [...this.messagesList, normalized as any];
          setTimeout(() => this.scrollToBottom(true), 0);
        }
      });
    });
  }

  ngAfterViewInit(): void {
    // Scroll simple une fois à l'arrivée sur la page + diagnostics
    this.logScrollState('afterViewInit:before');
    setTimeout(() => {
      this.scrollToBottom(true);
      this.logScrollState('afterViewInit:after t=0');
    }, 0);
    setTimeout(() => {
      this.scrollToBottom(true);
      this.logScrollState('afterViewInit:after t=50');
    }, 50);
    setTimeout(() => {
      this.scrollToBottom(true);
      this.logScrollState('afterViewInit:after t=200');
    }, 200);
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }

  private loadConversation(): void {
    const params = new HttpParams().set('userA', 1).set('userB', 2);
    this.http.get<any[]>('/api/messages/conversation', { params }).subscribe({
      next: data => {
        const existing: any[] = (this.messagesList ?? []).map(m => this.normalizeMessage(m) as any);
        const incoming: any[] = (data ?? []).map(m => this.normalizeMessage(m) as any);
        const byId = new Map<number, any>();
        for (const m of existing) byId.set(m.id as number, m);
        for (const m of incoming) byId.set(m.id as number, m);
        const merged = Array.from(byId.values());
        merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        this.messagesList = merged;
      },
      error: e => {
        this.messagesList = this.messagesList ?? [];
      },
    });
  }

  send() {
    const message = this.draft.trim();
    if (!message || this.isSending) return;
    const body = {
      userId: 1,
      toUserId: 2,
      message,
    } satisfies { userId: number; toUserId: number; message: string };
    this.draft = '';
    this.isSending = true;

    this.http.post('/api/message', body).subscribe({
      next: () => {
        this.isSending = false;
      },
      error: e => {
        this.isSending = false;
      },
    });
  }

  private scrollToBottom(smooth: boolean) {
    const el = this.messagesRef?.nativeElement;
    if (!el) {
      return;
    }
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    } catch {
      el.scrollTop = el.scrollHeight;
    }
    requestAnimationFrame(() => {});
  }

  private logScrollState(label: string) {
    const el = this.messagesRef?.nativeElement;
    if (!el) {
      return;
    }
  }

  isNewDay(index: number): boolean {
    if (index === 0) return true;
    const cur = this.getDayKey(this.messagesList[index]?.createdAt);
    const prev = this.getDayKey(this.messagesList[index - 1]?.createdAt);
    return cur !== prev;
  }

  getDayKey(value: any): string {
    const d = value instanceof Date ? value : new Date(value);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }

  private normalizeMessage(raw: any): any {
    if (!raw || typeof raw !== 'object') return raw;
    // Assure que la propriété 'message' existe (certains backends envoient 'content')
    if ((raw as any).message == null && (raw as any).content != null) {
      return { ...raw, message: (raw as any).content };
    }
    return raw;
  }
}
