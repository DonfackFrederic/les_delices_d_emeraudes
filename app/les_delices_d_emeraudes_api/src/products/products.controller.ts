import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
// import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // @Post()
  // create(@Body() createProductDto: CreateProductDto) {
  //   return this.productsService.create(createProductDto);
  // }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('featured') featured?: boolean,
    @Query('search') search?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '12',
  ) {
    const q = {
      category,
      featured,
      search,
      page: Number(page) || 1,
      limit: Number(limit) || 12,
    };

    return this.productsService.findAll(q);
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
  //   return this.productsService.update(+id, updateProductDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.productsService.remove(+id);
  // }
}
