import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { NewMessageDtop } from './dtos/new-message.dto'
import { MessagesWsService } from './messages-ws.service'
import { JwtService } from '@nestjs/jwt'
import { JwtPayload } from '../../dist/auth/interfaces/jwt-payload.interface'

@WebSocketGateway({cors:true})
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
    ) {}

  @WebSocketServer() wss:Server

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string
    let payload:JwtPayload

    try {
      payload  = this.jwtService.verify(token)
      await this.messagesWsService.registerClient(client, payload.id)
    } catch (error) {
      client.disconnect()
      return
    }

    // console.log({payload})
    console.log({conectados:this.messagesWsService.getConnectedClients()})

    //notificar a los clientes de su conexion
    this.wss.emit('clients-updated',this.messagesWsService.getConnectedClients())
  }
  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id)
    console.log({conectados:this.messagesWsService.getConnectedClients()})
    //notificar a los clientes de su conexion
    this.wss.emit('clients-updated',this.messagesWsService.getConnectedClients())
  }

  @SubscribeMessage('message-from-client') //nombre del evento que esta a la escucha
  handleMessageFromClient(client:Socket, payload:NewMessageDtop){
    //emite unicamente al cliente
    // client.emit('message-from-server',{
    //   fullName:'soy yo',
    //   message:payload.message || 'no-message'
    // })

    //emitir a todos menos al que envia
    // client.broadcast.emit('message-from-server',{
    //   fullName:'soy yo',
    //   message:payload.message || 'no-message'
    // })

    //emitir a todos
    this.wss.emit('message-from-server',{
        fullName:this.messagesWsService.getUserFullName(client.id),
        message:payload.message || 'no-message'
      })
  }


}
