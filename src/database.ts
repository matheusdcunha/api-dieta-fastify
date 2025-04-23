import { knex as setupKnex, type Knex} from 'knex'
import { env } from './env'

export const config: Knex.Config = {
  client: 'pg',
  connection: {
    host: 'localhost',
    port: env.DB_PORT,
    user: env.DB_USER,
    database: env.DB_DATABASE,
    password: env.DB_PASSWORD
  },
  migrations:{
    extension:'ts',
    directory: './src/database/migrations'
  },
  pool:{
    min:2,
    max:10
  }
}