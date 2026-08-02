import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema() // Nombre de la tabla en la base de datos
export class PedidoPendiente {

    @Prop({ type: Types.ObjectId })
    _id: Types.ObjectId;

    @Prop({ required: true, default: '' })
    idCliente: string;

    @Prop({ required: true, default: '' })
    estadoPedido: string;

    @Prop({ required: true, default: '' })
    tallaSeleccionado: string;

    @Prop({ required: true })
    precioSeleccionado: number;

    @Prop({ required: true })
    subtotalPedido: number;

    @Prop({ required: true })
    gastosEnvio: number;

    @Prop({ required: true })
    totalPedido: number;

    @Prop({ type: Types.ObjectId, required: true })
    direccionEnvio: Types.ObjectId;

    @Prop({ required: true, default: '' })
    fechaPedido: Date;

    @Prop([{
        productoItem: { type: Types.ObjectId, ref: 'Producto' },
        cantidadItem: { type: Number, default: 0 },
        _id: false
    }])
    elementosPedido: Array<{ productoItem: Types.ObjectId, cantidadItem: number }>

}

export const PedidoPendienteSchema = SchemaFactory.createForClass(PedidoPendiente);
