import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AdminStatsRepository } from './admin-stats.repository';

@Injectable()
export class AdminStatsService {
  private readonly logger = new Logger(AdminStatsService.name);

  constructor(private readonly repository: AdminStatsRepository) {}

  async getStats() {
    const { data, error } = await this.repository.getStats();

    if (error) {
      this.logger.error('Erreur lecture stats admin', error);
      throw new InternalServerErrorException('Impossible de récupérer les statistiques.');
    }

    return data;
  }
}