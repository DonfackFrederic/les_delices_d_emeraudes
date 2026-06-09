import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../../shared/interfaces/toast.types';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts  = signal<Toast[]>([]);
  readonly toasts  = this._toasts.asReadonly();

  private timers   = new Map<string, ReturnType<typeof setTimeout>>();

  // ── API fluente ───────────────────────────────────────────

  show(title: string, message?: string, type: ToastType = 'info', duration = 4000): string {
    const id    = crypto.randomUUID();
    const toast: Toast = { id, type, title, message, duration };
    this._toasts.update(list => [...list, toast]);
    this.startTimer(id, duration);
    return id;
  }

  success(title: string, message?: string, duration = 4000) { return this.show(title, message, 'success', duration); }
  error  (title: string, message?: string, duration = 5000) { return this.show(title, message, 'error',   duration); }
  warning(title: string, message?: string, duration = 4500) { return this.show(title, message, 'warning', duration); }
  info   (title: string, message?: string, duration = 4000) { return this.show(title, message, 'info',    duration); }

  dismiss(id: string): void {
    this.clearTimer(id);
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  /** mouseenter → stoppe le décompte */
  pause(id: string): void { this.clearTimer(id); }

  /** mouseleave → repart de la durée initiale */
  resume(id: string, duration: number): void { this.startTimer(id, duration); }

  private startTimer(id: string, duration: number): void {
    this.clearTimer(id);
    this.timers.set(id, setTimeout(() => this.dismiss(id), duration));
  }

  private clearTimer(id: string): void {
    const t = this.timers.get(id);
    if (t) { clearTimeout(t); this.timers.delete(id); }
  }
}