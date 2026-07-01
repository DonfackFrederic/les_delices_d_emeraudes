import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import type { AuthenticatedUser } from 'src/auth/current-user.decorator';
import { UpdateProfileDto } from 'src/dto/update-profile.dto';

@Controller('users/me')
@UseGuards(JwtAuthGuard) // toutes les routes de ce controller sont protégées
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('orders')
  getMyOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getMyOrders(user.id);
  }

  @Get('orders/:id')
  getMyOrderById(
    @Param('id', ParseUUIDPipe) orderId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.getMyOrderById(orderId, user.id);
  }

  @Patch('profile')
  updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.usersService.updateProfile(user.id, dto);
  }
}