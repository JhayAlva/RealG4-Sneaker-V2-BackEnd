import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import mongoose, { Model, Types } from 'mongoose';

import * as bcryptjs from 'bcryptjs';
import * as Paypal from '@paypal/checkout-server-sdk';

import { RegisterUserDto, CreateUserDto, UpdateAuthDto, LoginDto } from './dto';

import { User } from './entities/user.entity';

import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { uploadImagenDto } from './dto/upload-img-user.dto';
import { Provincia } from './entities/provincia.entity';
import { Municipio } from './entities/municipio.entity';
import { OperarDireccionDto } from './dto/operar-direccion.dto';
import { FinalizarPedidoDto } from './dto/finalizar-pedido.dto';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PedidoCliente } from './entities/pedido.entity';
import { Productos } from './entities/producto.entity';
import { HttpService } from '@nestjs/axios';
import { json } from 'stream/consumers';
import { URLSearchParams } from 'url';
import { lastValueFrom } from 'rxjs';
import { PedidoPendiente } from './entities/pedidoPendiente.entity';

@Injectable()
export class AuthService {

  private stripe: Stripe
  private frontEndUrl: string;
  private backEndUrl:string;
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,

    @InjectModel(Provincia.name)
    private provinciaModel: Model<Provincia>,

    @InjectModel(Municipio.name)
    private municipioModal: Model<Municipio>,

    @InjectModel(PedidoCliente.name)
    private pedidoModal: Model<PedidoCliente>,

    @InjectModel(Productos.name)
    private productoModal: Model<Productos>,

    @InjectModel(PedidoPendiente.name)
    private pedidoPendienteModal: Model<PedidoPendiente>,

    private jwtService: JwtService,

    private httpService: HttpService,

    private configService: ConfigService
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'));
    this.frontEndUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:4200';
    this.backEndUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000';

  }


  async create(createUserDto: CreateUserDto): Promise<User> {

    try {

      const { password, ...userData } = createUserDto;

      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });

      await newUser.save();
      const { password: _, ...user } = newUser.toJSON();

      return user;

    } catch (error) {
      if (error === 11000) {
        throw new BadRequestException(`${createUserDto.email} ya existe!`)
      }
      throw new InternalServerErrorException('Something terribe happen!!!');
    }

  }

  async register(registerDto: RegisterUserDto): Promise<LoginResponse> {

    const user = await this.create(registerDto);

    return {
      user: user,
      token: this.getJwtToken({ id: user._id })
    }
  }


  async login(loginDto: LoginDto): Promise<LoginResponse> {

    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email })
      .populate('direcciones', 'pedidos')
      .exec();

    if (!user) {
      throw new UnauthorizedException('credenciales no validas');
    }

    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('credenciales no validass');
    }

    const { password: _, ...rest } = user.toJSON();


    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    }

  }

  async UploadImagen(uploadImg: uploadImagenDto): Promise<LoginResponse> {
    const { imagenBase64, email, id } = uploadImg;

    //Update de la imagen
    const user = await this.userModel.findByIdAndUpdate(id, { avatar: imagenBase64 }, { new: true })
      .populate('direcciones')
      .exec();
    if (!user) {
      throw new UnauthorizedException('No se encontro ningun usuario con ese id');
    }

    const { password: _, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    }

  }

  async operarDireccion(datosDireccion: OperarDireccionDto): Promise<LoginResponse> {
    const { direccion, operacion, usuarioId } = datosDireccion;

    switch (operacion) {
      case 'borrar':
        const direccionObjectId = new Types.ObjectId(direccion._id);
        let _resultadoDelete = await this.userModel.updateOne({ _id: usuarioId },
          { $pull: { 'direcciones': { _id: direccionObjectId } } })

        if (_resultadoDelete.modifiedCount != 1) throw new UnauthorizedException(`Error al borrar direccion con _id:${JSON.stringify(direccion)}`);

        break;
      case 'crear':
        direccion._id = new mongoose.Types.ObjectId();
        let _resultCreate = await this.userModel.updateOne({ _id: usuarioId },
          { $push: { 'direcciones': direccion } });

        if (_resultCreate.modifiedCount != 1) throw new UnauthorizedException(`Error al Crear direccion ${JSON.stringify(direccion)}`);

        break;
      case 'modificar':
        try {

          const ObjectId = mongoose.Types.ObjectId;
          const id_usuario = new ObjectId(usuarioId);
          direccion._id = new ObjectId(direccion._id);

          let user = await this.userModel.findOne({ _id: id_usuario, 'direcciones._id': direccion._id });
          if (!user) {
            throw new UnauthorizedException(`No se encontrÃ³ un usuario con _id: ${usuarioId} o direcciÃ³n con _id: ${direccion._id}`);
          }

          let _resultModif = await this.userModel.findOneAndUpdate(
            { _id: id_usuario, 'direcciones._id': direccion._id },
            { $set: { 'direcciones.$': direccion } },
            { new: true }
          );

          if (!_resultModif) {
            throw new UnauthorizedException(`Error al Modificar direccion con _id: ${direccion._id}`);
          }
        } catch (error) {
          console.error('Error durante la actualizaciÃ³n:', error);
          throw new UnauthorizedException(`Error al Modificar direccion con _id: ${direccion._id}`);
        }

    }

    const user = await this.userModel.findOne({ _id: usuarioId })
      .populate('direcciones')
      .exec();
    const { password: _, ...rest } = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({ id: user.id }),
    }

  }

  async FinalizarPedido(datosPedido: FinalizarPedidoDto): Promise<LoginResponse> {
    const { datosPago, metodoPago, newPedido } = datosPedido;
    try {
      const clientePedido = await this.userModel.findOne({ _id: new Types.ObjectId(newPedido.idCliente) });

      const [mesCaducidad, anioCaducidad] = datosPago.fechaCaducidad.split('/');

      if (metodoPago === 'tarjeta') {
        const _optionsCustomer = {
          email: clientePedido.email,
          name: clientePedido.nombre,
          phone: clientePedido.telefono,
          address: {
            city: String(newPedido.direccionEnvio),
            country: String(newPedido.direccionEnvio),
            state: String(newPedido.direccionEnvio),
            line1: String(newPedido.direccionEnvio)
          },
          metadata: { id: newPedido.idCliente }
        };

        const _customer = await this.stripe.customers.create(_optionsCustomer);

        const _optionsCardToken = {
          card: {
            name: datosPago.titularTarjeta,
            number: datosPago.numeroTarjeta,
            exp_month: mesCaducidad,
            exp_year: anioCaducidad,
            currency: "eur",
            cvc: String(datosPago.cvv)
          },
        };

        const _tokencard = await this.stripe.tokens.create(_optionsCardToken);
        const _cardOptions = {
          source: _tokencard.id
        };
        const _card = await this.stripe.customers.createSource(_customer.id, _cardOptions);

        const _chargeoptions = {
          amount: Math.round(newPedido.totalPedido * 100),
          currency: 'eur',
          source: _card.id,
          description: newPedido._id.toString(),
          customer: _customer.id
        };

        const _cargopedido = await this.stripe.charges.create(_chargeoptions);

        if (_cargopedido.status.toLowerCase() === "succeeded") {
          let _idPedido = new mongoose.Types.ObjectId();
          newPedido._id = _idPedido;

          let _newItems = [];
          let productoId;

          newPedido.elementosPedido.forEach(e => {
            productoId = e.productoItem._id;

            _newItems.push({
              productoItem: e.productoItem._id,
              cantidadItem: e.cantidadItem
            });
          });

          newPedido.elementosPedido = _newItems;

          // Verificamos que newPedido tenga todos los datos necesarios
          if (newPedido && newPedido._id && newPedido.elementosPedido.length > 0) {
            let _insertarPedido = await this.pedidoModal.create(newPedido);

            let _resultUpdateProducto = await this.productoModal.updateOne({ _id: productoId }, {
              $set: { "ultimaVenta": newPedido.totalPedido },
              $inc: { "paresVendidos": 1 } // Esto incrementa el valor de paresVendidos en 1
            });

            const user = await this.userModel.findOne({ _id: newPedido.idCliente })
              .populate('direcciones', 'pedidos')
              .exec();

            user.pedidos.push(_insertarPedido._id);
            await user.save();

            const { password: _, ...rest } = user.toJSON();

            return {
              user: rest,
              token: this.getJwtToken({ id: user.id }),
            };
          } else {
            console.error('El pedido no tiene la estructura correcta para la inserciÃ³n.');
          }
        }
      } else {
        //Insertar el pedido Pendiento en la base de datos
        let _idPedido = new mongoose.Types.ObjectId();
        newPedido._id = _idPedido;

        let _newItems = [];
        let productoId;

        newPedido.elementosPedido.forEach(e => {
          productoId = e.productoItem._id;

          _newItems.push({
            productoItem: e.productoItem._id,
            cantidadItem: e.cantidadItem
          });
        });

        let _insertarPedido = await this.pedidoPendienteModal.create(newPedido);

        // Manejar otros mÃ©todos de pago si es necesario
        const orderRequest = {
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'EUR',
              value: newPedido.totalPedido.toString(),
            },
          }],
          application_context: {
            brand_name: 'RealG4Sneaker',
            user_action: 'PAY_NOW',
            landing_page: 'NO_PREFERENCE',
            return_url: `${this.backEndUrl}/auth/execute-payment?pedidoId=${newPedido._id}`,  // URL a la que PayPal redirige tras la aprobaciÃ³n
            cancel_url: `${this.backEndUrl}/auth/cancel-payment`,    // URL si el usuario cancela el pago
          }
        };

        // Realiza la solicitud para crear el pedido en PayPal
        const auth = {
          username: this.configService.get<string>('PAYPAL_CLIENTE_ID'),
          password: this.configService.get<string>('SECRET_KEY_PAYPAL'),
        };

        try {

          const response = await this.httpService.axiosRef.post('https://api-m.sandbox.paypal.com/v2/checkout/orders', orderRequest, {
            auth,
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const approvalLink = response.data.links.find(link => link.rel === 'approve');
          const { password: _, ...rest } = clientePedido.toJSON();

          return {
            user: rest,
            token: this.getJwtToken({ id: clientePedido.id }),
            approvalUrl: approvalLink.href,
          };

        } catch (error) {
          console.error('Error al crear el pedido de PayPal:', error);
          throw new Error('Error al procesar el pago con PayPal');
        }
      }
    } catch (error) {
      console.error('Error en el proceso de FinalizarPedido:', error);
    }
    return;
  }

  async executePayment(token: string, payerId: string, pedidoId: string) {
    const auth = {
      username: this.configService.get<string>('PAYPAL_CLIENTE_ID'),
      password: this.configService.get<string>('SECRET_KEY_PAYPAL'),
    };

    try {
      const response = await this.httpService.axiosRef.post(
        `https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}/capture`,
        {
          payer_id: payerId
        },
        {
          auth,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'COMPLETED') {
        // AquÃ­ puedes realizar cualquier operacion adicional en tu base de datos

        const pedido = await this.pedidoPendienteModal.findById(new mongoose.Types.ObjectId(pedidoId)).lean();
        if (!pedido) {
          console.error('Pedido no encontrado con ID:', pedidoId);
          return {
            success: false,
            message: 'Pedido no encontrado',
            redirect_url: `${this.frontEndUrl}/pago-error`,
          };
        }
        const newPedido = await this.pedidoModal.create({
          _id: new mongoose.Types.ObjectId(),
          idCliente: pedido.idCliente,
          estadoPedido: pedido.estadoPedido,
          tallaSeleccionado: pedido.tallaSeleccionado,
          precioSeleccionado: pedido.precioSeleccionado,
          subtotalPedido: pedido.subtotalPedido,
          gastosEnvio: pedido.gastosEnvio,
          totalPedido: pedido.totalPedido,
          direccionEnvio: pedido.direccionEnvio,
          fechaPedido: pedido.fechaPedido,
          elementosPedido: pedido.elementosPedido
        });

        await this.pedidoPendienteModal.deleteOne({ _id: new mongoose.Types.ObjectId(pedidoId) });

        let productoId;

        newPedido.elementosPedido.forEach(e => {
          productoId = e.productoItem._id;
        });

        let _resultUpdateProducto = await this.productoModal.updateOne({ _id: productoId }, {
          $set: { "ultimaVenta": newPedido.totalPedido },
          $inc: { "paresVendidos": 1 } // Esto incrementa el valor de paresVendidos en 1
        });

        const user = await this.userModel.findOne({ _id: newPedido.idCliente })
          .populate('direcciones', 'pedidos')
          .exec();

        user.pedidos.push(newPedido._id);
        await user.save();

        const { password: _, ...rest } = user.toJSON();


        // Redirigir al frontend con el estado de Ã©xito
        return {
          success: true,
          message: 'Pago completado con Ã©xito',
          redirect_url: `${this.frontEndUrl}/es-Es/pedido-finalizado/${newPedido.id}?talla=${newPedido.tallaSeleccionado}&precio=${newPedido.precioSeleccionado}`, // URL final en el frontend
        };
      }
    } catch (error) {
      console.error('Error al capturar el pago de PayPal:', error);

      // Redirigir al frontend con el estado de error
      return {
        success: false,
        message: 'Error al capturar el pago de PayPal',
        redirect_url: `${this.frontEndUrl}/pago-error`, // URL de error en el frontend
      };
    }
  }

  async getPedidoUsuario(idPedido: string): Promise<any> {
    const pedidoRecuperado = await this.pedidoModal.findById(new Types.ObjectId(idPedido))
      .populate('elementosPedido.productoItem')
      .lean()
      .exec();

    if (!pedidoRecuperado) return pedidoRecuperado;

    const usuario = await this.userModel.findById(new Types.ObjectId(pedidoRecuperado.idCliente)).lean().exec();
    const direccion = usuario?.direcciones?.find((direc: any) => String(direc._id) === String(pedidoRecuperado.direccionEnvio));

    return {
      ...pedidoRecuperado,
      direccionEnvio: direccion || pedidoRecuperado.direccionEnvio
    };
  }

  async getProvincia(): Promise<Provincia[]> {
    return this.provinciaModel.find().sort({ PRO: 1 });
  }

  async getMunicipio(codprov: number): Promise<Municipio[]> {
    return this.municipioModal.find({ CPRO: codprov });
  }

  async getPedidosxUsuario(codusuario: string): Promise<any[]> {
    const pedidos = await this.pedidoModal.find({ idCliente: new Types.ObjectId(codusuario) })
      .populate('elementosPedido.productoItem')
      .lean()
      .exec();

    const usuario = await this.userModel.findById(new Types.ObjectId(codusuario)).lean().exec();

    return pedidos.map((pedido: any) => {
      const direccion = usuario?.direcciones?.find((direc: any) => String(direc._id) === String(pedido.direccionEnvio));

      return {
        ...pedido,
        direccionEnvio: direccion || pedido.direccionEnvio
      };
    });
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);
    const { password, ...rest } = user.toJSON();
    return rest;
  }


  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

}



