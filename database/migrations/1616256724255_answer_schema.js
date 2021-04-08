'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AnswerSchema extends Schema {
  up () {
    this.create('answers', (table) => {
      table.increments()
      table.timestamps()

      table.integer('clickbait').nullable()
      table.string('credibility').nullable()
      table.integer('user_id').references('id').inTable('users')
      table.integer('sentence_id').references('id').inTable('sentences')
    })
  }

  down () {
    this.drop('answers')
  }
}

module.exports = AnswerSchema
