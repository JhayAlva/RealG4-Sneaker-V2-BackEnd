import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Direccion } from "../entities/direccion.entity";
import { Type } from "class-transformer";

export class OperarDireccionDto {
    
    @Type(() => Direccion)
    @IsNotEmpty()
    direccion: Direccion;

    @IsNotEmpty()
    @IsString()
    operacion: string;

    @IsNotEmpty()
    @IsString()
    usuarioId: string;
}
