import { Module } from '@nestjs/common';
import { TiendaService } from './tienda.service';
import { TiendaController } from './tienda.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Productos, productoSchema } from './entities/producto.entity';

@Module({
  controllers: [TiendaController],
  providers: [TiendaService],
  imports:[
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: Productos.name,
        schema: productoSchema
      }
    ]),
  ]
})
export class TiendaModule {}
