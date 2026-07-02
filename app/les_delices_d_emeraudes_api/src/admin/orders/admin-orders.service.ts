import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AdminOrdersRepository, AdminOrdersFilter } from './admin-orders.repository';
import { UpdateOrderStatusDto } from 'src/dto/update-oder-status.dto';

@Injectable()
export class AdminOrdersService {
  private readonly logger = new Logger(AdminOrdersService.name);

  constructor(private readonly repository: AdminOrdersRepository) {}

  async findAll(filters: AdminOrdersFilter) {
    const { data, total, error } = await this.repository.findAll(filters);

    if (error) {
      this.logger.error('Erreur lecture commandes admin', error);
      throw new InternalServerErrorException('Impossible de récupérer les commandes.');
    }

    return {
      data,
      total,
      page: filters.page ?? 1,
      limit: filters.limit ?? 20,
    };
  }

  /**
   * Met à jour le statut d'une commande.
   * Le déclenchement de l'email de changement de statut (S3-08) est
   * branché au Bloc B — pour l'instant on logue l'intention.
   */
  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const { data, error } = await this.repository.updateStatus(id, dto.status);

    if (error) {
      this.logger.error(`Erreur update statut commande ${id}`, error);
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Commande introuvable.');
      }
      throw new InternalServerErrorException('Impossible de mettre à jour le statut.');
    }

    // TODO (Bloc B - S3-08) : await this.emailService.sendStatusUpdate(data);
    this.logger.log(
      `Commande ${id} → statut "${dto.status}" (email à brancher au Bloc B)`,
    );

    return data;
  }
}