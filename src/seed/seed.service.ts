import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {

  constructor(
    private readonly producstService:ProductsService, //servicios es injectable
    @InjectRepository(User)//entidad
    private readonly userRepository: Repository<User>
  ){}

  async runSeed() {
    await this.deleteTables()
    const adminUser = await this.insertUsers()
    await this.insertNewProducts(adminUser)
    console.log('ejecutado')
    return "SEED EXECUTED"
  }

  private async deleteTables(){
    await this.producstService.deleteAllProducts()

    const queryBuilder = this.userRepository.createQueryBuilder()
    await queryBuilder
    .delete()
    .where({})
    .execute()
  }

  private async insertUsers() {
    const seedUsers = initialData.users
    // const users: User[] = []
    // seedUsers.forEach(user=>{
    //   users.push(this.userRepository.create({
    //     ...user,
    //     password:bcrypt.hashSync(user.password,10)
    //   }))
    // })

    const dbUsers = await this.userRepository.save(seedUsers)

    return dbUsers[0]
  }

  private async insertNewProducts(user:User) {
    await this.producstService.deleteAllProducts()


    const products = initialData.products

    const insertPromises = []

    products.forEach(product => {
      insertPromises.push(this.producstService.create(product,user))
    })

    await Promise.all(insertPromises)

    return true
  }

}
