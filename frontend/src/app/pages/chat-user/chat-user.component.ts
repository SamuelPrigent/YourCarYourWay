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
        /* header height already excluded by layout */
        --composer-h: 64px;
        min-height: calc(100vh - 57px);
        display: flex;
        flex-direction: column;
      }
      .user-theme {
        background: #eaf3ff;
      }

      .messages {
        flex: 1;
        overflow: auto;
        padding: 16px 12px;
        /* leave space for the fixed composer */
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
    // console.log('[CHAT USER] ngOnInit');
    this.loadConversation();
    // subscribe to real-time updates for conversation (1,2) with both orders
    // console.log('[CHAT USER] Subscribing WS for conversation 1-2');
    this.wsSub = this.ws.subscribeConversationAnyOrder(1, 2).subscribe(msg => {
      //   console.log('[CHAT USER] WS message received', msg);
      const normalized = this.normalizeMessage(msg);
      this.zone.run(() => {
        if (normalized && typeof normalized === 'object' && 'id' in normalized) {
          const exists = this.messagesList.some((m: any) => m.id === (normalized as any).id);
          if (!exists) {
            this.messagesList = [...this.messagesList, normalized as any];
            // console.log(
            //   '[CHAT USER] appended WS message id',
            //   (normalized as any).id,
            //   'len=',
            //   this.messagesList.length
            // );
          } else {
            // console.log('[CHAT USER] skipped duplicate id', (normalized as any).id);
          }
        } else {
          this.messagesList = [...this.messagesList, normalized as any];
          //   console.log('[CHAT USER] appended WS message (no id) len=', this.messagesList.length);
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
        // console.log('[CHAT USER] REST loaded', Array.isArray(data) ? data.length : data);
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
        // console.log('[CHAT USER] REST load error', e);
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
        // console.log('[CHAT USER] send() success');
        this.isSending = false;
      },
      error: e => {
        // console.log('[CHAT USER] send() error', e);
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

  private normalizeMessage(raw: any): any {
    if (!raw || typeof raw !== 'object') return raw;
    // Assure que la propriété 'message' existe (certains backends envoient 'content')
    if ((raw as any).message == null && (raw as any).content != null) {
      return { ...raw, message: (raw as any).content };
    }
    return raw;
  }
}
