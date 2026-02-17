import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';

@WebSocketGateway({
  cors: { origin: '*' }, // ok dev (à resserrer en prod)
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  // ✅ Message global (tous les agents)
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('chat:global')
  handleGlobalMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { message: string },
  ) {
    const user = (client as any).user;

    this.ensureJoinedPersonalRoom(client);

    this.server.emit('chat:global:new', {
      fromAgentId: user.sub ?? user.id,
      from: user.username,
      message: payload.message,
      at: new Date().toISOString(),
    });
  }

  // ✅ Message privé (agent -> agent)
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('chat:dm')
  handleDirectMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { toAgentId: number; message: string },
  ) {
    const user = (client as any).user;

    this.ensureJoinedPersonalRoom(client);

    this.server.to(`agent:${payload.toAgentId}`).emit('chat:dm:new', {
      fromAgentId: user.sub ?? user.id,
      from: user.username,
      message: payload.message,
      at: new Date().toISOString(),
    });
  }

  // ✅ utilitaire: notifier un agent (utilisé pour notifications mission)
  notifyAgent(agentId: number, event: any) {
    this.server.to(`agent:${agentId}`).emit('mission:event', event);
  }

  // ✅ utilitaire: notifier tout le monde
  notifyAll(event: any) {
    this.server.emit('mission:event', event);
  }

  private ensureJoinedPersonalRoom(client: Socket) {
    const user = (client as any).user;
    const agentId = user.sub ?? user.id;
    client.join(`agent:${agentId}`);
  }
}
