import { IsNotEmpty, IsString } from "class-validator";

export class uploadImagenDto {
    @IsString()
    @IsNotEmpty()
    id: string;
  
    @IsString()
    @IsNotEmpty()
    imagenBase64: string;
  
    @IsString()
    @IsNotEmpty()
    email: string;
}
