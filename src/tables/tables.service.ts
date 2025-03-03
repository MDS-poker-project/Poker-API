import { Injectable } from '@nestjs/common';
import { Table } from './entities/table.entity';
import { PlayersService } from 'src/players/players.service';

@Injectable()
export class TablesService {
  tables : Table[] = []
  constructor(

  ) {
    const types = ['Amator', 'Intermediair', 'Professionel']
    for (let name of types) {
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
