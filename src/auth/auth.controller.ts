import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

import { CreateUserDto, LoginDto, RegisterUserDto, UpdateAuthDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { LoginResponse } from './interfaces/login-response';
import { User } from './entities/user.entity';
import { uploadImagenDto } from './dto/upload-img-user.dto';
import { Provincia } from './entities/provincia.entity';
import { Municipio } from './entities/municipio.entity';
import { OperarDireccionDto } from './dto/operar-direccion.dto';
import { FinalizarPedidoDto } from './dto/finalizar-pedido.dto';
import { PedidoCliente } from './entities/pedido.entity';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('/login')
  login( @Body() loginDto: LoginDto  ) {
    return this.authService.login( loginDto );
  }

  @Post('/registro')
  register( @Body() registerDto: RegisterUserDto  ) {
    return this.authService.register( registerDto );
  }

  @Post('/uploadImagen')
  uploadImagenUser(@Body() uploadImgUser:uploadImagenDto){
    return this.authService.UploadImagen(uploadImgUser);
  }

  @Get('/GetProvincias')
  getProvincias():Promise<Provincia[]>{
    return this.authService.getProvincia();
  }

  @Get('/GetMunicipio')
  getMunicipios(@Query('codprov') codprov: number):Promise<Municipio[]>{
    return this.authService.getMunicipio(codprov);
  }

  @Get('/GetPedidosUsuario')
  getPedidosUsuario(@Query('codusuario') codusuario: string):Promise<PedidoCliente[]>{
    return this.authService.getPedidosxUsuario(codusuario);
  }

  @Post('/OperarDirecciones')
  operarDirecciones(@Body() operarDireccion:OperarDireccionDto){
    return this.authService.operarDireccion(operarDireccion);
  }

  @Post('/FinalizarPedidoCliente')
  async FinalizarPedido(@Body() FinalizarPedido:FinalizarPedidoDto ){
    return this.authService.FinalizarPedido(FinalizarPedido);
  }

  @Get('/execute-payment')
  async executePayment(@Query('token') token: string, 
  @Query('PayerID') payerId: string,
  @Query('pedidoId') pedidoId: string,
  @Res() res: Response){

    const redirectToUrl= await this.authService.executePayment(token, payerId, pedidoId);
    // Redirigimos al usuario
    return res.redirect(redirectToUrl.redirect_url);
  }

  @Get('/GetPedidoCliente/:idPedido')
  getPedido(@Param('idPedido') idPedido:string):Promise<PedidoCliente>{
    return this.authService.getPedidoUsuario(idPedido);
  }

  @UseGuards( AuthGuard )
  @Get()
  findAll( @Request() req: Request ) {
    // const user = req['user'];
    
    // return user;
    return this.authService.findAll();
  }

  // LoginResponse
  @UseGuards( AuthGuard )
  @Get('check-token')
  checkToken( @Request() req: Request ): LoginResponse {
      
    const user = req['user'] as User;

    return {
      user,
      token: this.authService.getJwtToken({ id: user._id })
    }

  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
