import * as mysql from 'mysql2/promise';
import { format, subMonths } from 'date-fns';

export interface ExoneradoRecord {
  id: number;
  cpRF: string;
  cpNome: string;
}

export class ExoneradosService {
  private dbConnection: any;

  constructor() {
    this.dbConnection = mysql.createPool({
      host: '10.75.32.125',
      user: 'root',
      password: 'Hta123P',
      database: 'SGU',
    });
  }

  async compareTables() {
    const now = new Date();
    const currentTable = format(now, 'yyyy_MM');
    const previousMonth = subMonths(now, 1);
    const previousTable = format(previousMonth, 'yyyy_MM');

    // Consulta na tabela atual
    const [currentRecords]: [ExoneradoRecord[], any] =
      await this.dbConnection.query(
        `SELECT cpID, cpRF, cpNome FROM ${currentTable}`,
      );

    // Consulta na tabela do mês anterior
    const [previousRecords]: [ExoneradoRecord[], any] =
      await this.dbConnection.query(
        `SELECT cpID, cpRF, cpNome FROM ${previousTable}`,
      );

    // Filtrando os registros que estão faltando na tabela atual
    const missingRecords: ExoneradoRecord[] = previousRecords.filter(
      (previousRecord) =>
        !currentRecords.some(
          (currentRecord) => currentRecord.cpRF === previousRecord.cpRF,
        ),
    );

    return missingRecords;
  }
}
