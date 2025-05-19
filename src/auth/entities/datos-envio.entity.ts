import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class DatosEnvio {
    @Prop({ required: true, default: '' })
    nombre: string;

    @Prop({ required: true, default: '' })
    apellidos: string;

    @Prop({ required: true, default: '' })
    nifcif: string;

    @Prop({ required: true, default: '' })
    telefono: string;
}

export const DatosEnvioSchema = SchemaFactory.createForClass( DatosEnvio );
