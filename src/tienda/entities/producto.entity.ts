import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Productos{
    @Prop({ required: true })
    nombre: string;
  
    @Prop({ required: true })
    estilo: string;
  
    @Prop({ required: true })
    color: string;
  
    @Prop({ required: true })
    precioRetail: number;
  
    @Prop({ type: [{ talla: String, precio: Number }], default: [] })
    variaciones:[];
  
    @Prop({ required: true })
    fechaLanzamiento: Date;
  
    @Prop({ required: true })
    categoria: string;
  
    @Prop({ type: [String], default: [] })
    imagenes: string[];
  
    @Prop({ required: true })
    paresVendidos: number;
  
    @Prop({ required: true })
    ultimaVenta: number;
  
    @Prop({ required: true })
    valoracionGeneral: number;
  
    @Prop({ required: true })
    opiniones: number;
}

export const productoSchema = SchemaFactory.createForClass( Productos );