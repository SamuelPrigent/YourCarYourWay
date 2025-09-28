import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WsService {
  private client: any | null = null;
  private connected = false;
  private connectRequested = false;
  private pendingOnConnect: Array<() => void> = [];

  private ensureClient() {
    if (this.client) return;
    const StompJs = (window as any).StompJs;
    if (!StompJs) {
      console.error(
        'StompJs UMD not found on window. Ensure the script tag is present in index.html.'
      );
      return;
    }
    this.client = new StompJs.Client({
      brokerURL: 'ws://localhost:8080/ws',
      reconnectDelay: 5000,
    });

    this.client.onConnect = () => {
      this.connected = true;
      console.log('[WS] Connected');
      this.pendingOnConnect.splice(0).forEach(fn => fn());
    };

    this.client.onStompError = (frame: any) => {
      console.log('[WS] STOMP error', frame);
    };
  }

  private activateIfNeeded() {
    if (!this.client) this.ensureClient();
    if (!this.client) return; // still missing
    if (!this.connectRequested) {
      this.connectRequested = true;
      this.client.activate();
    }
  }

  subscribeConversation(userA: number, userB: number): Observable<any> {
    const subject = new Subject<any>();
    this.activateIfNeeded();

    const subscribeNow = () => {
      const a = Math.min(userA, userB);
      const b = Math.max(userA, userB);
      const destination = `/topic/conversation/${a}-${b}`;
      try {
        const sub = this.client.subscribe(destination, (message: any) => {
          try {
            const body = JSON.parse(message.body);
            subject.next(body);
          } catch {
            subject.next(message.body);
          }
        });
        // Return teardown to unsubscribe when the subscriber unsubscribes
        subject.subscribe({
          complete: () => {
            try {
              sub.unsubscribe();
            } catch {}
          },
        });
      } catch (e) {
        console.error('Subscribe error', e);
      }
    };

    if (this.connected) {
      subscribeNow();
    } else {
      this.pendingOnConnect.push(subscribeNow);
    }

    return subject.asObservable();
  }

  /**
   * Backends publish to `/topic/conversation/min-max` => `/topic/conversation/a-b`
   */
  subscribeConversationAnyOrder(userA: number, userB: number): Observable<any> {
    const subject = new Subject<any>();
    this.activateIfNeeded();

    const a = userA;
    const b = userB;
    const min = Math.min(a, b);
    const max = Math.max(a, b);

    const onMsg = (message: any, dest: string) => {
      try {
        const parsed = JSON.parse(message.body);
        subject.next(parsed);
        // console.log('[WS] message from', dest, parsed);
      } catch {
        subject.next(message.body);
        // console.log('[WS] message (raw) from', dest, message.body);
      }
    };

    const subscribeNow = () => {
      try {
        const d1 = `/topic/conversation/${min}-${max}`;
        const d2 = `/topic/conversation/${a}-${b}`; // if not properly ordered in back
        // console.log('[WS] subscribing to', d1, d2, d3, d4);
        const sub1 = this.client.subscribe(d1, (m: any) => onMsg(m, d1));
        const sub2 = this.client.subscribe(d2, (m: any) => onMsg(m, d2));
        subject.subscribe({
          complete: () => {
            try {
              sub1.unsubscribe();
            } catch {}
            try {
              sub2.unsubscribe();
            } catch {}
          },
        });
      } catch (e) {
        // console.log('[WS] Subscribe error', e);
      }
    };

    if (this.connected) {
      subscribeNow();
    } else {
      this.pendingOnConnect.push(subscribeNow);
    }

    return subject.asObservable();
  }
}
