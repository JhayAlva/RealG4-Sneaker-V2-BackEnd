import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class User {

    _id?:string;

    @Prop({required:true, minlength:3})
    nombre:string;

    @Prop({required:true, minlength:3})
    apellidos:string;

    @Prop({ unique:true, required:true})
    email:string;

    @Prop({minlength:6, required:true})
    password?:string;

    @Prop({default:''})
    avatar?:string;
    
    @Prop({default:true})
    isActive:string;

}


export const UserSchema = SchemaFactory.createForClass( User );
