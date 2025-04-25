import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.increments('id').primary(),
      table.uuid('user_id').references('id').inTable('users'),
      table.text('name').notNullable(),
      table.text('description').notNullable(),
      table.timestamp('date').notNullable(),
      table.boolean('in_diet').notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('meals')
}
