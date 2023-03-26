import { IsString, IsNotEmpty } from 'class-validator';

export class NewMessageDtop {
    @IsString()
    @IsNotEmpty()
    message:string
}