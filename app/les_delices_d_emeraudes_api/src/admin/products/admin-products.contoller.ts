import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminProductsService } from './admin-products.service';
import {
  CreateProductDto,
  UpdateProductDto,
  CreateProductOptionDto,
  UpdateProductOptionDto,
  CreateOptionValueDto,
  UpdateOptionValueDto,
} from '../../dto/product.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly service: AdminProductsService) {}

  // ── Produits ──────────────────────────────────────────────────────────────

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.delete(id);
  }

  // ── Options ───────────────────────────────────────────────────────────────

  @Post(':productId/options')
  createOption(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Body() dto: CreateProductOptionDto,
  ) {
    return this.service.createOption(productId, dto);
  }
}

/**
 * Controllers séparés pour /admin/options et /admin/values car ils ne
 * partagent pas le préfixe /admin/products (pas de dépendance à :productId
 * pour update/delete, cohérent avec les routes définies dans SPRINT_3.md).
 */
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/options')
export class AdminOptionsController {
  constructor(private readonly service: AdminProductsService) {}

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductOptionDto,
  ) {
    return this.service.updateOption(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deleteOption(id);
  }

  @Post(':optionId/values')
  createValue(
    @Param('optionId', ParseUUIDPipe) optionId: string,
    @Body() dto: CreateOptionValueDto,
  ) {
    return this.service.createOptionValue(optionId, dto);
  }
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/values')
export class AdminValuesController {
  constructor(private readonly service: AdminProductsService) {}

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOptionValueDto,
  ) {
    return this.service.updateOptionValue(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.deleteOptionValue(id);
  }
}