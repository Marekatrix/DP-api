'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SentenceSchema extends Schema {
  up () {
    this.create('sentences', (table) => {
      table.increments()
      table.timestamps()

      table.text('text').notNullable()
      table.boolean('eligible').nullable()
      table.integer('user_id').references('id').inTable('users')
    })
  }

  down () {
    this.drop('sentences')
  }
}

module.exports = SentenceSchema
