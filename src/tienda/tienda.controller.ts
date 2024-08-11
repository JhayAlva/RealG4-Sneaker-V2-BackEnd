import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TiendaService } from './tienda.service';
import { CreateTiendaDto } from './dto/create-tienda.dto';
import { UpdateTiendaDto } from './dto/update-tienda.dto';
import { Productos } from './entities/producto.entity';

@Controller('tienda')
export class TiendaController {
  constructor(private readonly tiendaService: TiendaService) {}

  @Post()
  create(@Body() createTiendaDto: CreateTiendaDto) {
    return this.tiendaService.create(createTiendaDto);
  }

  @Get('top-tres-zapas')
  async buscarxNumeroVentas():Promise<Productos[]>{
    return this.tiendaService.buscarxNumeroVentas();
  }

  @Get('search')
  buscarProductoNombre(@Query('query')nombre:string):Promise<Productos[]>{
    return this.tiendaService.buscarPorNombre(nombre);
  }

  @Get('productosByPath')
  buscarProductosPath(@Query('path')path:string):Promise<Productos[]>{
    return this.tiendaService.getProductosByPath(path);
  }
  

  @Get()
  findAll() {
    return this.tiendaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiendaService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTiendaDto: UpdateTiendaDto) {
    return this.tiendaService.update(+id, updateTiendaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tiendaService.remove(+id);
  }
}
