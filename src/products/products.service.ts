import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { Product } from './entities/product.entity';
import { PaginationDto } from '../common/dtos/pagination.dto';
import {validate as isUUID} from 'uuid'
import { ProudctImage } from './entities/product-image.entity';
import { User } from 'src/auth/entities/user.entity';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService')

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProudctImage)
    private readonly productImageRepository: Repository<ProudctImage>,

    private readonly dataSourse:DataSource

  ) {}

  async create(createProductDto: CreateProductDto, user:User) {
    try {
      const { images = [], ...productDetails } = createProductDto
      const product = this.productRepository.create({
        ...productDetails,
        images:images.map(image => this.productImageRepository.create({url:image})),
        user, //user added and saveit automatic bc the relationship in entitty
      })
      await this.productRepository.save(product)
      return {...product, images}
    } catch (error) {
      this.handleDBExceptions(error)
    } 
  }

  async findAll({limit=10, offset=0}:PaginationDto) {
    
      const products = await this.productRepository.find({
        take:limit,
        skip:offset,
        relations:{
          images:true
        }
      })

      return products.map(product => ({
        ...product,
        images:product.images.map(image=>image.url)
      }))
  }

  async findOne(term: string) {

    let product: Product
    if(isUUID(term)){
      product = await this.productRepository.findOneBy({id:term})
    }else{
      const queryBuilder = this.productRepository.createQueryBuilder('prod')
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug',{
          title:term.toUpperCase(),
          slug:term.toLowerCase()
        })
        .innerJoinAndSelect('prod.images','prodImages')
        .getOne()
    }
    // const product = await this.productRepository.findOneBy({term})
    if(!product){
      throw new NotFoundException(`Product with id:${term} not found`)
    }

    return product
  }

  async findOnePlain(term:string){
    const {images = [],...rest} = await this.findOne(term)
    return {
      ...rest,
      images:images.map(({url})=>url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto,user:User) {

    const {images,...toUpdate} = updateProductDto

    const product = await this.productRepository.preload({
      id,
      ...toUpdate
    })

    if(!product){
      throw new NotFoundException(`Product with id:${id} not found`)
    }

    //query runner
    const queryRunner = this.dataSourse.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      if( images ){
        //product es el nombre de la relacion
        await queryRunner.manager.delete( ProudctImage, {product:{ id }} )

        product.images = images.map(image => this.productImageRepository.create({url:image}))
      }
      product.user = user
      await queryRunner.manager.save(product)

      await queryRunner.commitTransaction()
      await queryRunner.release()

      return this.findOnePlain(id)

    } catch (error) {
      await queryRunner.rollbackTransaction()
      await queryRunner.release()
      this.handleDBExceptions(error)
    }

  }

  async remove(id: string) {
    try {
      const product = await this.findOne(id)
      await this.productRepository.remove(product)
      return product
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  private handleDBExceptions(error:any){
    this.logger.error(error)
    this.logger.error(error.code)
      if(error.code==='23505'){
        throw new BadRequestException(error.details)
      }

      throw new InternalServerErrorException(error)
  }

  async deleteAllProducts() {
    //esta query sirve para eliminar los registros de las dos tablas sin hacer transacciones
    //revisar el entity el eliminado en cascada
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();

    } catch (error) {
      this.handleDBExceptions(error);
    }

  }
}
