import { IsEnum } from 'class-validator';
import type { OrderStatus } from '@shared/types';

export class UpdateOrderStatusDto {
  @IsEnum(['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'] as OrderStatus[])
  status!: OrderStatus;
}