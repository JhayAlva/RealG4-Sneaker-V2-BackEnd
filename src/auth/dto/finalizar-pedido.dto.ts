import { Type } from "class-transformer";
import { DatosPago } from "../entities/datosPago.entity";
import { PedidoCliente } from "../entities/pedido.entity";
import { IsNotEmpty, IsString } from "class-validator";

export class FinalizarPedidoDto {
    @Type(() => PedidoCliente)
    @IsNotEmpty()
    newPedido: PedidoCliente;
    
    @Type(() => DatosPago)
    @IsNotEmpty()
    datosPago: DatosPago;

    @IsNotEmpty()
    @IsString()
    metodoPago: string;
}