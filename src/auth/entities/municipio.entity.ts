import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Municipio{
    @Prop({ required: true })
    CPRO: string;

    @Prop({ required: true })
    CMUN: string;

    @Prop({ required: true })
    DMUN50: string;

    @Prop({ required: true })
    CUN: string;
}

export const MunicipioSchema = SchemaFactory.createForClass( Municipio );