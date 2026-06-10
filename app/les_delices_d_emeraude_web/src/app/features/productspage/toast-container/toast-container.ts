import { Component, inject } from '@angular/core';
import { Toast } from '../../../shared/interfaces/toast.types';
import { ToastService } from '../../../core/services/toast-service';

@Component({
  selector: 'app-toast-container',
  imports: [],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.scss',
})
export class ToastContainer {
  protected svc = inject(ToastService);
 
  readonly icons: Record<Toast['type'], string> = {
    success: 'ti-circle-check',
    error:   'ti-circle-x',
    warning: 'ti-alert-triangle',
    info:    'ti-info-circle',
  };
 
  trackById(_: number, t: Toast): string { return t.id; }
  onEnter(t: Toast): void { this.svc.pause(t.id); }
  onLeave(t: Toast): void { this.svc.resume(t.id, t.duration); }
  dismiss(id: string): void { this.svc.dismiss(id); }
}


