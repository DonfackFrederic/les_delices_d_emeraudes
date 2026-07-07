import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AdminProductsRepository } from './admin-products.repository';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateProductOptionDto,
  UpdateProductOptionDto,
  CreateOptionValueDto,
  UpdateOptionValueDto,
} from '../../dto/product.dto';

@Injectable()
export class AdminProductsService {
  private readonly logger = new Logger(AdminProductsService.name);

  constructor(private readonly repository: AdminProductsRepository) {}

  // ── Produits ──────────────────────────────────────────────────────────────

  async findAll() {
    const { data, error } = await this.repository.findAll();
    if (error) {
      this.logger.error('Erreur lecture produits admin', error);
      throw new InternalServerErrorException('Impossible de récupérer les produits.');
    }
    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.repository.findById(id);
    if (error) {
      this.logger.error(`Erreur lecture produit ${id}`, error);
      throw new InternalServerErrorException('Impossible de récupérer le produit.');
    }
    if (!data) throw new NotFoundException('Produit introuvable.');
    return data;
  }

  async create(dto: CreateProductDto) {
    const { data, error } = await this.repository.create(dto);

    if (error) {
      this.logger.error('Erreur création produit', error);
      if (error.code === '23505') {
        throw new BadRequestException('Un produit avec ce slug existe déjà.');
      }
      if (error.code === '23503') {
        throw new BadRequestException('La catégorie sélectionnée n\'existe pas.');
      }
      throw new InternalServerErrorException('Impossible de créer le produit.');
    }

    return data;
  }

  async update(id: string, dto: UpdateProductDto) {
    const { data, error } = await this.repository.update(id, dto);

    if (error) {
      this.logger.error(`Erreur update produit ${id}`, error);
      if (error.code === '23505') {
        throw new BadRequestException('Un produit avec ce slug existe déjà.');
      }
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Produit introuvable.');
      }
      throw new InternalServerErrorException('Impossible de mettre à jour le produit.');
    }

    return data;
  }

  /**
   * Soft delete uniquement — cf. ADR-003. Les commandes existantes
   * référencent ce produit via un snapshot, jamais de suppression physique.
   */
  async delete(id: string) {
    const { error } = await this.repository.softDelete(id);

    if (error) {
      this.logger.error(`Erreur désactivation produit ${id}`, error);
      throw new InternalServerErrorException('Impossible de désactiver le produit.');
    }

    return { success: true };
  }

  // ── Options ───────────────────────────────────────────────────────────────

  async createOption(productId: string, dto: CreateProductOptionDto) {
    const { data, error } = await this.repository.createOption(productId, dto);

    if (error) {
      this.logger.error(`Erreur création option produit ${productId}`, error);
      if (error.code === '23503') {
        throw new BadRequestException('Le produit sélectionné n\'existe pas.');
      }
      throw new InternalServerErrorException('Impossible de créer l\'option.');
    }

    return data;
  }

  async updateOption(id: string, dto: UpdateProductOptionDto) {
    const { data, error } = await this.repository.updateOption(id, dto);

    if (error) {
      this.logger.error(`Erreur update option ${id}`, error);
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Option introuvable.');
      }
      throw new InternalServerErrorException('Impossible de mettre à jour l\'option.');
    }

    return data;
  }

  async deleteOption(id: string) {
    const { error } = await this.repository.deleteOption(id);

    if (error) {
      this.logger.error(`Erreur suppression option ${id}`, error);
      throw new InternalServerErrorException('Impossible de supprimer l\'option.');
    }

    return { success: true };
  }

  // ── Valeurs d'option ──────────────────────────────────────────────────────

  async createOptionValue(optionId: string, dto: CreateOptionValueDto) {
    const { data, error } = await this.repository.createOptionValue(optionId, dto);

    if (error) {
      this.logger.error(`Erreur création valeur option ${optionId}`, error);
      if (error.code === '23503') {
        throw new BadRequestException('L\'option sélectionnée n\'existe pas.');
      }
      throw new InternalServerErrorException('Impossible de créer la valeur.');
    }

    return data;
  }

  async updateOptionValue(id: string, dto: UpdateOptionValueDto) {
    const { data, error } = await this.repository.updateOptionValue(id, dto);

    if (error) {
      this.logger.error(`Erreur update valeur option ${id}`, error);
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Valeur introuvable.');
      }
      throw new InternalServerErrorException('Impossible de mettre à jour la valeur.');
    }

    return data;
  }

  async deleteOptionValue(id: string) {
    const { error } = await this.repository.deleteOptionValue(id);

    if (error) {
      this.logger.error(`Erreur suppression valeur option ${id}`, error);
      throw new InternalServerErrorException('Impossible de supprimer la valeur.');
    }

    return { success: true };
  }
}