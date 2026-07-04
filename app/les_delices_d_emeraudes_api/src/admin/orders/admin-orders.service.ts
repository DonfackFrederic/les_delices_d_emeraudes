import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AdminOrdersRepository, AdminOrdersFilter } from './admin-orders.repository';
import { UpdateOrderStatusDto } from 'src/dto/update-oder-status.dto';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AdminOrdersService {
  private readonly logger = new Logger(AdminOrdersService.name);

  constructor(
    private readonly repository: AdminOrdersRepository,
    private readonly emailService: EmailService,
  ) {}

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
   * Met à jour le statut d'une commande et déclenche l'email correspondant
   * (preparing, ready, delivered, cancelled — cf. status-update.template.ts).
   * Les statuts pending/confirmed ne déclenchent pas d'email ici (confirmed
   * est déjà couvert par l'email de confirmation initial au paiement).
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
 
    if (!data) {
      throw new NotFoundException('Commande introuvable.');
    }
 
    // Fire-and-forget : ne bloque jamais la réponse HTTP à l'admin.
    // EmailService gère ses propres erreurs en interne.
    void this.emailService.sendStatusUpdate(data, dto.status);
 
    this.logger.log(`Commande ${id} → statut "${dto.status}"`);
 
    return data;
  }
}