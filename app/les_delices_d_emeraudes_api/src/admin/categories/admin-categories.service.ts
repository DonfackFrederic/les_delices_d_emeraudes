import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AdminCategoriesRepository } from './admin-categories.repository';
import { CreateCategoryDto, UpdateCategoryDto } from '../../dto/category.dto';

@Injectable()
export class AdminCategoriesService {
  private readonly logger = new Logger(AdminCategoriesService.name);

  constructor(private readonly repository: AdminCategoriesRepository) {}

  async create(dto: CreateCategoryDto) {
    const { data, error } = await this.repository.create(dto);

    if (error) {
      this.logger.error('Erreur création catégorie', error);
      // Code 23505 = violation de contrainte unique (slug ou name dupliqué)
      if (error.code === '23505') {
        throw new BadRequestException(
          'Une catégorie avec ce nom ou ce slug existe déjà.',
        );
      }
      throw new InternalServerErrorException('Impossible de créer la catégorie.');
    }

    return data;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const { data, error } = await this.repository.update(id, dto);

    if (error) {
      this.logger.error(`Erreur update catégorie ${id}`, error);
      if (error.code === '23505') {
        throw new BadRequestException(
          'Une catégorie avec ce nom ou ce slug existe déjà.',
        );
      }
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Catégorie introuvable.');
      }
      throw new InternalServerErrorException('Impossible de mettre à jour la catégorie.');
    }

    return data;
  }

  async delete(id: string) {
    // Vérifie qu'aucun produit actif n'est lié avant de supprimer
    // (cf. contrainte métier documentée dans SPRINT_3.md S3-02)
    const activeProductCount = await this.repository.countActiveProducts(id);

    if (activeProductCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer : ${activeProductCount} produit(s) actif(s) dans cette catégorie.`,
      );
    }

    const { error } = await this.repository.delete(id);

    if (error) {
      this.logger.error(`Erreur suppression catégorie ${id}`, error);
      throw new InternalServerErrorException('Impossible de supprimer la catégorie.');
    }

    return { success: true };
  }
}