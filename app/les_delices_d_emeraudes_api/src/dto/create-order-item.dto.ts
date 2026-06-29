import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { SelectedOptionDto } from './selected-option.dto';

export class CreateOrderItemDto {
  @IsUUID()
  productId!: string;

  @IsInt()
  @Min(1)
  @Max(50) // garde-fou raisonnable, évite les commandes absurdes/abusives
  quantity!: number;

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => SelectedOptionDto)
  selectedOptions!: SelectedOptionDto[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comment?: string;
}