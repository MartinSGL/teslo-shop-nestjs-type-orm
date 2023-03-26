import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service'
import { RawHeaders,GetUser, Auth } from './decorators'
import { CreateUserDto,LoginUserDto } from './dto'
import { User } from './entities/user.entity'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto)
  }

  @Post('login')
  loginUser(@Body() loginUserDto:LoginUserDto){
    return this.authService.login(loginUserDto)
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user:User
  ){
    return this.authService.checkAuthStatus(user)
  }

  @Get('private')
  @UseGuards( AuthGuard() ) // Guards necesarios para valdar tokens 
  testingPrivateRoute(
    // @Req() request:Express.Request //solo vaa mostrar la info del usuario cuando pasa por eu Guard
    // data()
    @GetUser() user:User,
    @GetUser('email') userEmail:User['email'],
    @RawHeaders () rawHeaders:string[]
  ){
    return {
      ok:true,
      message:'hola mundo private',
      user,
      userEmail,
      rawHeaders
    }
  }
  //ver video 180
  // @SetMetadata('roles',['admin','super-user']) //añadir informacion extra al metodo o controlador a ejecutar
  // @Get('private2')
  // @RoleProtected(ValidRoles.superUser)
  // @UseGuards( AuthGuard(), UserRoleGuard )
  // privateRoute2(
  //   @GetUser() user:User
  // ){
  //   return{
  //     ok:true,
  //     user
  //   }
  // }

  @Get('private3')
  @Auth()
  privateRoute2(
    @GetUser() user:User
  ){
    return{
      ok:true,
      user
    }
  }
}
