import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';


import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User, UserSchema } from './entities/user.entity';
import { Provincia, ProvinciaSchema } from './entities/provincia.entity';
import { Municipio, MunicipioSchema } from './entities/municipio.entity';
import { PedidoCliente, PedidoSchema } from './entities/pedido.entity';
import { TiendaModule } from 'src/tienda/tienda.module';
import { PedidoPendiente, PedidoPendienteSchema } from './entities/pedidoPendiente.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    ConfigModule.forRoot({
      isGlobal:true,
    }),
    HttpModule,
    TiendaModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema
      },
      {
        name:Provincia.name,
        schema: ProvinciaSchema
      },
      {
        name:Municipio.name,
        schema:MunicipioSchema
      },
      {
        name:PedidoCliente.name,
        schema:PedidoSchema
      },
      {
        name:PedidoPendiente.name,
        schema:PedidoPendienteSchema
      }
    ]),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SEED,
      signOptions: { expiresIn: '6h' },
    }),
  ]
})
export class AuthModule {}
