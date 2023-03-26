import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"


export class CreateProductDto {
    @ApiProperty({
        description:"Product title (unique)",
        nullable:false,
        uniqueItems:true,
        minLength:1
    })
    @IsString()
    @IsNotEmpty()
    title:string

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?:number

    @ApiProperty()
    @IsOptional()
    @IsString()
    description?:string

    @ApiProperty()
    @IsOptional()
    @IsString()
    slug?:string

    @ApiProperty()
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?:number

    @ApiProperty()
    @IsString({each:true})
    @IsArray()
    sizes:string[]

    @ApiProperty()
    @IsIn(['men','women','kid','unisex'])
    gender:string

    @ApiProperty()
    @IsOptional()
    @IsString({each:true})
    @IsArray()
    tags:string[]

    @ApiProperty()
    @IsOptional()
    @IsString({each:true})
    @IsArray()
    images?:string[]
}
