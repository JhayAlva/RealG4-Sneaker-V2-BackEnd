import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { CreateTiendaDto } from './dto/create-tienda.dto';
import { UpdateTiendaDto } from './dto/update-tienda.dto';
import { Productos } from './entities/producto.entity';
import { Model } from 'mongoose';

@Injectable()


export class TiendaService {
  constructor(
    @InjectModel(Productos.name)
    private productosModel:Model<Productos>
    ){}


  async buscarxNumeroVentas():Promise<Productos[]>{
    return this.productosModel
               .find()
               .sort({paresVendidos:-1})
               .limit(4)
               .exec();
  }


  async buscarPorNombre(query:string):Promise<Productos[]>{
    return this.productosModel
                .find({nombre:new RegExp(query,'i')})
                .sort()
                .limit(5)
                .exec();
  }

  async getProductosByPath(path:string):Promise<Productos[]>{
    const newPath = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.productosModel.find({ categoria: { $regex: '^' + newPath } });
  }


  create(createTiendaDto: CreateTiendaDto) {
    return 'This action adds a new tienda';
  }
  
  findAll() {
    return `This action returns all tienda`;
  }

  findOne(id: string) {
    try {
      return this.productosModel.findOne({_id: id});
    } catch (error) {
      throw new Error(`Error al buscar el producto: ${error.message}`);
    }
  }

  update(id: number, updateTiendaDto: UpdateTiendaDto) {
    return `This action updates a #${id} tienda`;
  }

  remove(id: number) {
    return `This action removes a #${id} tienda`;
  }
}
