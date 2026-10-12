import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController, RoomTypesController } from './rooms.controller';

@Module({
  providers: [RoomsService],
  controllers: [RoomsController, RoomTypesController],
  exports: [RoomsService],
})
export class RoomsModule {}
