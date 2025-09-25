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
      <header class="thread-header">
        <div class="thread-left">
          <span class="avatar">
            <img src="assets/user.svg" alt="Avatar John" />
          </span>
          <div class="thread-meta">
            <h2>John</h2>
            <p>En ligne</p>
          </div>
        </div>
        <div class="thread-actions" aria-hidden="true">
          <img src="assets/points.svg" alt="Décoration" />
        </div>
      </header>
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
        --composer-h: 64px;
        height: calc(100vh - 120px);
        display: flex;
        flex-direction: column;
      }
      .support-theme {
        background: #e9f7ec;
      }
      .messages {
        flex: 1 1 auto;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        padding: 59px 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .thread-header {
        flex: 0 0 auto;
        position: fixed;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 18px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        background: rgb(255, 255, 255);
        backdrop-filter: saturate(1.2) blur(4px);
      }
      .thread-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .avatar {
        display: inline-flex;
        width: 37px;
        height: 37px;
        border-radius: 50%;
        background: #f8f8f8;
        border: 1px solid rgba(0, 0, 0, 0.05);
        overflow: hidden;
        justify-content: center;
        align-items: center;
      }
      .avatar img {
        width: 21px;
        height: 21px;
        opacity: 0.8;
      }
      .thread-meta h2 {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: #1f2937;
      }
      .thread-meta p {
        margin: 2px 0 0;
        font-size: 12px;
        color: #6b7280;
      }
      .thread-actions img {
        width: 25px;
        height: 25px;
        opacity: 0.65;
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
        margin: 0;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px 10px;
        min-height: var(--composer-h);
        background: #e9f7ec;
        backdrop-filter: saturate(1.2) blur(4px);
      }
      .composer input[type='text'] {
        flex: 1;
        height: 42px;
        padding: 0 12px;
        border: 1px solid #8dd9b0;
        border-radius: 22px;
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
        border-radius: 22px;
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
  private initialScrollLoopActive = false;
  private initialScrollAttempts = 0;
  private initialScrollWaitFrames = 0;
  private viewReady = false;

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
          } else {
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
    this.viewReady = true;
    this.scheduleInitialScroll();
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
        this.scheduleInitialScroll();
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
      userId: 2,
      toUserId: 1,
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

  private scheduleInitialScroll(): void {
    if (this.initialScrollDone) {
      return;
    }
    if (!this.viewReady) {
      return;
    }
    if (this.initialScrollLoopActive) {
      return;
    }
    this.startInitialScrollLoop();
  }

  private startInitialScrollLoop(): void {
    this.initialScrollLoopActive = true;
    this.initialScrollAttempts = 0;
    this.initialScrollWaitFrames = 0;
    this.zone.runOutsideAngular(() => {
      requestAnimationFrame(() => this.performInitialScroll());
    });
  }

  private performInitialScroll(): void {
    if (this.initialScrollDone) {
      this.initialScrollLoopActive = false;
      return;
    }
    const el = this.messagesRef?.nativeElement;
    if (!el) {
      this.initialScrollLoopActive = false;
      return;
    }
    const hasContent = (this.messagesList?.length ?? 0) > 0;
    if (!hasContent) {
      this.initialScrollWaitFrames += 1;
      if (this.initialScrollWaitFrames >= 40) {
        this.initialScrollLoopActive = false;
        return;
      }
      requestAnimationFrame(() => this.performInitialScroll());
      return;
    }
    this.initialScrollWaitFrames = 0;
    const atBottom = this.scrollToBottom(false);
    if (atBottom) {
      this.zone.run(() => {
        this.initialScrollDone = true;
        this.logScrollState('initial-scroll:done');
      });
      this.initialScrollLoopActive = false;
      return;
    }
    this.initialScrollAttempts += 1;
    if (this.initialScrollAttempts >= 60) {
      this.zone.run(() => {
        this.initialScrollDone = true;
        this.logScrollState('initial-scroll:forced-stop');
      });
      this.initialScrollLoopActive = false;
      return;
    }
    requestAnimationFrame(() => this.performInitialScroll());
  }

  private scrollToBottom(smooth: boolean): boolean {
    const el = this.messagesRef?.nativeElement;
    if (!el) {
      return true;
    }
    if (smooth) {
      try {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      } catch {
        el.scrollTop = el.scrollHeight;
      }
    } else {
      el.scrollTop = el.scrollHeight;
    }
    const atBottom = Math.abs(el.scrollHeight - (el.scrollTop + el.clientHeight)) <= 1;
    return atBottom;
  }

  private isNearBottom(threshold = 100): boolean {
    const el = this.messagesRef?.nativeElement;
    if (!el) return true;
    const distance = el.scrollHeight - (el.scrollTop + el.clientHeight);
    return distance <= threshold;
  }

  isNewDay(index: number): boolean {
    if (index === 0) return true;
    const cur = this.getDayKey(this.messagesList[index]?.createdAt);
    const prev = this.getDayKey(this.messagesList[index - 1]?.createdAt);
    return cur !== prev;
  }

  getDayKey(value: any): string {
    const d = value instanceof Date ? value : new Date(value);
    // yyyy-mm-dd key
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }

  private logScrollState(label: string) {
    const el = this.messagesRef?.nativeElement;
    if (!el) {
      return;
    }
  }

  private normalizeMessage(raw: any): any {
    if (!raw || typeof raw !== 'object') return raw;
    if ((raw as any).message == null && (raw as any).content != null) {
      return { ...raw, message: (raw as any).content };
    }
    return raw;
  }
}
