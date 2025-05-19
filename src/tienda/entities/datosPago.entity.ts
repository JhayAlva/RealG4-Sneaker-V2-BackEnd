import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

Schema()
export class DatosPago{

    @Prop({required:true,maxlength:16})
    numeroTarjeta:string;
    @Prop({required:true,default:''})
    titularTarjeta:string;
    @Prop({required:true,default:''})
    fechaCaducidad:string;
    @Prop({required:true,default:0})
    cvv:number;
}

export const DatosPagoSchema = SchemaFactory.createForClass(DatosPago);