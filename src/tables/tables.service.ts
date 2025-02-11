import { Injectable } from '@nestjs/common';

@Injectable()
export class TablesService {
  
  findAll() {
    return `This action returns all tables`;
  }

  findOne(id: number) {
    return `This action returns a #${id} table`;
  }

  join(tableId: string, userId: string) {
    return `This action joins the user ${userId} to the table ${tableId}`;
  }
}
