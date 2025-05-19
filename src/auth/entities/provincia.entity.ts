import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Provincia{
    @Prop({ required: true })
    CPRO: string;

    @Prop({ required: true })
    PRO: string;

    @Prop({ required: true })
    CCOM: string;
}

export const ProvinciaSchema = SchemaFactory.createForClass( Provincia );