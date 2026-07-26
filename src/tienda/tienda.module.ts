import { Module } from '@nestjs/common';
import { TiendaService } from './tienda.service';
import { TiendaController } from './tienda.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Productos, productoSchema } from './entities/producto.entity';
import { Categoria, CategoriaSchema } from './entities/categoria.entity';

@Module({
  controllers: [TiendaController],
  providers: [TiendaService],
  imports:[
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name:Productos.name,
        schema:productoSchema
      },
      {
        name: Categoria.name,
        schema: CategoriaSchema
      }
    ]),
  ],
  exports:[
    MongooseModule
  ]
})
export class TiendaModule {}
