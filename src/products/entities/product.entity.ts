import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/auth/entities/user.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ProudctImage } from "./product-image.entity";

@Entity({name:'products'})
export class Product {
    @ApiProperty({
        example:"00433503-6573-4a63-9c4b-770104ba0117",
        description:'Product ID',
        uniqueItems:true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example:"T-Shirt Teslo",
        description:'Product Title',
        uniqueItems:true
    })
    @Column('text',{
        unique:true
    })
    title:string

    @ApiProperty({
        example:"0",
        description:'Product price'
    })
    @Column('float',{
        default:0
    })
    price:number

    @ApiProperty({
        example:"Esta es la descripcion del producto",
        description:'Product description',
        default:null
    })
    @Column({
        type:'text',
        nullable:true
    })
    description:string

    @ApiProperty({
        example:"t-shirt_teslo",
        description:'Product friendly uri',
        default:null
    })
    @Column({
        type:'text',
        unique:true
    })
    slug:string

    @ApiProperty({
        example:10,
        description:'Product stock',
        default:0
    })
    @Column('int',{default:0})
    stock:number;

    @ApiProperty({
        example:['M','XXL'],
        description:'Product sizes'
    })
    @Column('text',{
        array:true
    })
    sizes:string[]

    @ApiProperty({
        example:'women',
        description:'Product gender'
    })
    @Column('text')
    gender:string;

    @ApiProperty()
    @Column({
        type:'text',
        array:true,
        default:[]
    })
    tags: string[]

    @ApiProperty()
    @OneToMany(
        () => ProudctImage,
        productImage => productImage.product,
        { cascade:true, eager:true }
    )
    images?:ProudctImage[]

    @ManyToOne(
        ()=> User,
        (user) => user.product,
        {eager:true} // cargar la relacion cuando se consultan productos
    )
    user:User

    @BeforeInsert()
    checkSlugInsert(){
        if( !this.slug ){
            this.slug = this.title
        }

        this.slug = this.slug.toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'","")
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.slug.toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'","")
    }
}
