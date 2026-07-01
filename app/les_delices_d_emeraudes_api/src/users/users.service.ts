import {
  ForbiddenException,
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateProfileDto } from 'src/dto/update-profile.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  async getMyOrders(userId: string) {
    const { data, error } = await this.usersRepository.findOrdersByUserId(userId);

    if (error) {
      this.logger.error(`Erreur lecture commandes userId=${userId}`, error);
      throw new InternalServerErrorException('Impossible de récupérer vos commandes.');
    }

    return data;
  }

  async getMyOrderById(orderId: string, userId: string) {
    const { data, error } = await this.usersRepository.findOrderByIdForUser(
      orderId,
      userId,
    );

    if (error) {
      this.logger.error(
        `Erreur lecture commande orderId=${orderId} userId=${userId}`,
        error,
      );
      throw new InternalServerErrorException('Impossible de récupérer la commande.');
    }

    // null = commande inexistante OU appartient à quelqu'un d'autre.
    // On retourne toujours 403 (pas 404) pour ne pas révéler l'existence
    // d'une commande à un utilisateur non autorisé — cf. SPRINT_2 S2-05.
    if (!data) {
      throw new ForbiddenException('Accès refusé.');
    }

    return data;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { data, error } = await this.usersRepository.updateProfile(
      userId,
      dto,
    );

    if (error) {
      this.logger.error(`Erreur update profil userId=${userId}`, error);
      throw new InternalServerErrorException('Impossible de mettre à jour le profil.');
    }

    return data;
  }
}