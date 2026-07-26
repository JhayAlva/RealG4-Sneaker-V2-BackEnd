import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema() // Nombre de la tabla en la base de datos
export class Categoria {

    @Prop({ type: Types.ObjectId })
    _id: string;

    @Prop({ required: true, default: '' })
    nombre: string;

    @Prop({ required: true, default: '' })
    path: string;
}
export const CategoriaSchema = SchemaFactory.createForClass(Categoria);