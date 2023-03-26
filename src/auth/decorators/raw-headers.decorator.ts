import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const RawHeaders = createParamDecorator (
    (data:string,ctx:ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest()
        const headers = req.rawHeaders

        if(!headers) throw new InternalServerErrorException('User not found (request)')

        
        return  headers 
    }
)