import { Type } from "class-transformer";
import { DatosPago } from "../entities/datosPago.entity";
import { Pedido } from "../entities/pedido.entity";
import { IsNotEmpty, IsString } from "class-validator";

export class FinalizarPedidoDto {
    @Type(() => Pedido)
    @IsNotEmpty()
    newPedido: Pedido;
    
    @Type(() => DatosPago)
    @IsNotEmpty()
    datosPago: DatosPago;

    @IsNotEmpty()
    @IsString()
    metodoPago: string;
}