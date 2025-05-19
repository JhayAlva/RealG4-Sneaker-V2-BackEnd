import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Direccion, DireccionSchema } from './direccion.entity';
import mongoose, { Types } from 'mongoose';
import { PedidoCliente, PedidoSchema } from './pedido.entity';
@Schema()
export class User {

    _id?: string;

    @Prop({ required: true, minlength: 3 })
    nombre: string;

    @Prop({ required: true, minlength: 3 })
    apellidos: string;

    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ minlength: 6, required: true })
    password?: string;

    @Prop({ default: '' })
    avatar?: string;

    @Prop({ default: 0 })
    telefono: string

    @Prop({ default: true })
    isActive: string;

    @Prop({ type: [DireccionSchema], default: [] })
    direcciones: Direccion[]

    @Prop({ type: [Types.ObjectId], ref: 'PedidoCliente', default: [] })
    pedidos: Types.ObjectId[];

}


export const UserSchema = SchemaFactory.createForClass(User);
