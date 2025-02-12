import { Injectable } from '@nestjs/common';

@Injectable()
export class TablesService {

  findAll() {
    return `This action returns all tables`;
  }

  findOne(id: number) {
    return `This action returns a #${id} table`;
  }

  join(tableId: string, playerId: string) {
    return `This action joins the user ${playerId} to the table ${tableId}`;
  }
}
