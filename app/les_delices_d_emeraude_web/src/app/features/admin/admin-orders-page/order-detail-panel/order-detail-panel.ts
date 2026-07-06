import { Component, effect, inject, input, output, signal } from '@angular/core';
import { Order, OrderStatus } from '@shared/types';
import { AdminOrdersService } from '../../../../core/services/admin-orders.service';
import { FormsModule } from '@angular/forms';


const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'ready', label: 'Prête' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
];

/**
 * Panneau de détail d'une commande — affiché en overlay depuis
 * AdminOrdersPage. Toutes les infos + changement de statut avec
 * confirmation avant application (cf. SPRINT_3.md S3-14).
 */
@Component({
  selector: 'app-order-detail-panel',
  imports: [FormsModule],
  templateUrl: './order-detail-panel.html',
  styleUrl: './order-detail-panel.scss',
})
export class OrderDetailPanel {
  private readonly ordersService = inject(AdminOrdersService);
 
  readonly order = input.required<Order>();
 
  /** Émis après un changement de statut réussi — le parent recharge la liste. */
  readonly statusChanged = output<void>();
  readonly closed = output<void>();
 
  protected readonly statusOptions = STATUS_OPTIONS;
  protected readonly pendingStatus = signal<OrderStatus>('pending');
  protected readonly isUpdating = signal(false);
  protected readonly updateError = signal<string | null>(null);
 
  constructor() {
    // Synchronise pendingStatus dès que l'input order() est disponible ou
    // change (ex: si le parent réaffecte l'objet order après un reload).
    // Nécessaire car input.required() ne peut pas être lu de façon sûre
    // dans un initializer de champ — sa valeur n'est garantie qu'après
    // le premier cycle de binding.
    effect(() => {
      this.pendingStatus.set(this.order().status);
    });
  }
 
  protected formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-CA', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
 
  protected async confirmStatusChange(): Promise<void> {
    const newStatus = this.pendingStatus();
    const confirmed = window.confirm(
      `Changer le statut de la commande vers "${this.statusLabel(newStatus)}" ?`,
    );
    if (!confirmed) {
      this.pendingStatus.set(this.order().status);
      return;
    }
 
    this.isUpdating.set(true);
    this.updateError.set(null);
 
    try {
      await this.ordersService.updateStatus(this.order().id, newStatus);
      this.statusChanged.emit();
    } catch {
      this.updateError.set('Impossible de mettre à jour le statut.');
      this.pendingStatus.set(this.order().status);
    } finally {
      this.isUpdating.set(false);
    }
  }
 
  private statusLabel(status: OrderStatus): string {
    return this.statusOptions.find((o) => o.value === status)?.label ?? status;
  }
}
