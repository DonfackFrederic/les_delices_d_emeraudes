import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  customerName!: string;

  @IsEmail()
  customerEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  customerPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  deliveryNotes?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  /**
   * Total calculé côté frontend, envoyé UNIQUEMENT à des fins de comparaison
   * UX (détecter une désynchronisation avant même d'appeler Stripe).
   * Le total réellement utilisé est TOUJOURS recalculé côté serveur
   * (voir OrdersService.createOrder). Cf. ADR-004.
   */
  @IsNumber()
  @Min(0)
  expectedTotal!: number;
}