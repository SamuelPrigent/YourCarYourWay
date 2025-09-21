import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WsService } from '../../services/ws.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-support',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <section class="chat-page support-theme">
      <div class="messages" #messages>
        <div *ngFor="let msg of messagesList; trackBy: trackById">
          <div class="message-row" [class.own]="msg.fromUserId === currentUserId">
            <div class="bubble">
              <div class="text">{{ msg.message }}</div>
              <div class="meta">{{ msg.createdAt | date : 'short' }}</div>
            </div>
          </div>
        </div>
      </div>

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
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .chat-page {
        --composer-h: 64px;
        min-height: calc(100vh - 57px);
        display: flex;
        flex-direction: column;
      }
      .support-theme {
        background: #e9f9ef;
      }

      .messages {
        flex: 1;
        overflow: auto;
        padding: 16px 12px;
        padding-bottom: calc(var(--composer-h) + 12px);
        display: flex;
        flex-direction: column;
        gap: 8px;
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
        background: linear-gradient(180deg, #c9f2da 0%, #b6ebcc 100%);
        border-color: #8dd9b0;
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
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 2px 12px 6px;
        min-height: var(--composer-h);
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: saturate(1.2) blur(4px);
      }
      .composer input[type='text'] {
        flex: 1;
        height: 42px;
        padding: 0 12px;
        border: 1px solid #8dd9b0;
        border-radius: 10px;
        outline: none;
        background: #f3fbf6;
      }
      .composer input[type='text']:focus {
        border-color: #6dcca0;
        box-shadow: 0 0 0 3px rgba(109, 204, 160, 0.2);
      }
      .composer button {
        width: 42px;
        height: 42px;
        border: 1px solid #6dcca0;
        border-radius: 10px;
        background: linear-gradient(180deg, #c6efd6 0%, #ade8c6 100%);
        color: #116b3f;
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
export class ChatSupportComponent implements OnInit, OnDestroy, AfterViewInit {
  messagesList: any[] = [];
  currentUserId = 2;
  draft = '';
  isSending = false;
  private wsSub?: Subscription;
  @ViewChild('messages') private messagesRef?: ElementRef<HTMLDivElement>;
  private initialScrollDone = false;

  trackById(index: number, item: any) {
    return item.id;
  }

  constructor(private http: HttpClient, private ws: WsService, private zone: NgZone) {}

  ngOnInit(): void {
    // console.log('[CHAT SUPPORT] ngOnInit');
    this.loadConversation();
    // subscribe to real-time updates for conversation (1,2) with both orders
    // console.log('[CHAT SUPPORT] Subscribing WS for conversation 1-2');
    this.wsSub = this.ws.subscribeConversationAnyOrder(1, 2).subscribe(msg => {
      //   console.log('[CHAT SUPPORT] WS message received', msg);
      const normalized = this.normalizeMessage(msg);
      this.zone.run(() => {
        if (normalized && typeof normalized === 'object' && 'id' in normalized) {
          const exists = this.messagesList.some((m: any) => m.id === (normalized as any).id);
          if (!exists) {
            this.messagesList = [...this.messagesList, normalized as any];
            // console.log('[CHAT SUPPORT] appended WS message id', (normalized as any).id, 'len=', this.messagesList.length);
          } else {
            // console.log('[CHAT SUPPORT] skipped duplicate id', (normalized as any).id);
          }
        } else {
          this.messagesList = [...this.messagesList, normalized as any];
          //   console.log('[CHAT SUPPORT] appended WS message (no id) len=', this.messagesList.length);
        }
      });
    });
  }

  ngAfterViewInit(): void {
    // Scroll simple une fois à l'arrivée sur la page
    setTimeout(() => this.scrollToBottom(true), 0);
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }

  private loadConversation(): void {
    const params = new HttpParams().set('userA', 1).set('userB', 2);
    this.http.get<any[]>('/api/messages/conversation', { params }).subscribe({
      next: data => {
        // console.log('[CHAT SUPPORT] REST loaded', Array.isArray(data) ? data.length : data);
        const existing: any[] = (this.messagesList ?? []).map(m => this.normalizeMessage(m) as any);
        const incoming: any[] = (data ?? []).map(m => this.normalizeMessage(m) as any);
        const byId = new Map<number, any>();
        for (const m of existing) byId.set(m.id as number, m);
        for (const m of incoming) byId.set(m.id as number, m);
        const merged = Array.from(byId.values());
        merged.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        this.messagesList = merged;
        if (!this.initialScrollDone) {
          this.initialScrollDone = true;
          setTimeout(() => this.scrollToBottom(true), 0);
        }
      },
      error: e => {
        // console.log('[CHAT SUPPORT] REST load error', e);
        this.messagesList = this.messagesList ?? [];
      },
    });
  }

  send() {
    const message = this.draft.trim();
    if (!message || this.isSending) return;
    const body = {
      userId: 2,
      toUserId: 1,
      message,
    } satisfies { userId: number; toUserId: number; message: string };
    this.draft = '';
    this.isSending = true;

    this.http.post('/api/message', body).subscribe({
      next: () => {
        // console.log('[CHAT SUPPORT] send() success');
        this.isSending = false;
      },
      error: e => {
        // console.log('[CHAT SUPPORT] send() error', e);
        this.isSending = false;
      },
    });
  }

  private scrollToBottom(smooth: boolean) {
    const el = this.messagesRef?.nativeElement;
    if (!el) return;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
    } catch {
      el.scrollTop = el.scrollHeight;
    }
  }

  private isNearBottom(threshold = 100): boolean {
    const el = this.messagesRef?.nativeElement;
    if (!el) return true;
    const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
    return distance <= threshold;
  }

  private normalizeMessage(raw: any): any {
    if (!raw || typeof raw !== 'object') return raw;
    if ((raw as any).message == null && (raw as any).content != null) {
      return { ...raw, message: (raw as any).content };
    }
    return raw;
  }
}
