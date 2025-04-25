// eslint-disable-next-line
import { Knex } from "knex"

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      age: number
      auth_id: string
      weight: number
      height: number
      created_at: string
      updated_at: string
    }
    meals: {
      id: number
      user_id: string
      name: string
      description: string
      date: string
      in_diet: boolean
    }
  }
}
