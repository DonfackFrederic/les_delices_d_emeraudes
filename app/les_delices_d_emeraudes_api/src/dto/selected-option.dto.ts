import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class SelectedOptionDto {
  @IsUUID()
  optionId!: string;

  @IsString()
  optionName!: string;

  /** Renseigné uniquement pour les options de type 'select' */
  @IsOptional()
  @IsUUID()
  valueId?: string;

  @IsString()
  value!: string;

  @IsNumber()
  priceModifier!: number;
}