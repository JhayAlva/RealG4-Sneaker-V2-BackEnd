import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Municipio } from "./municipio.entity";
import { Provincia } from "./provincia.entity";
import { DatosEnvio } from "./datos-envio.entity";
import { Types } from "mongoose";

@Schema()
export class Direccion{
    @Prop({ type: Types.ObjectId })
    _id?:Types.ObjectId;

    @Prop({ required: true, default: '' })
    calle: string;

    @Prop({ required: true, default: 0 })
    cp: number;

    @Prop({ required: true, default: '' })
    pais: string;

    @Prop({ type: Object, required: true })
    provincia: Provincia;

    @Prop({ type: Object, required: true })
    municipio: Municipio;

    @Prop({ required: true, default: false })
    direcPrincipal: boolean;

    @Prop({ type: Object, required: true })
    datosEnvio: DatosEnvio;

    @Prop({ required: false, default: '' })
    alias: string;

    @Prop({ required: false, default:'' })
    longitudAndLatitud:[number,number];
}

export const DireccionSchema = SchemaFactory.createForClass( Direccion );