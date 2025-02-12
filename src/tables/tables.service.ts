import { Injectable } from '@nestjs/common';
import { Table } from './entities/table.entity';

@Injectable()
export class TablesService {
  tables : Table[] = []
  constructor() {
    const names = ['Table 1', 'Table 2', 'Table 3']
    for (let name of names) {
      const element = new Table(name);
      this.tables.push(element)
      
    }
  }

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
