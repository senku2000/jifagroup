'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class MailsSchema extends Schema {
  up () {
    this.create('mails', (table) => {
      table.increments()
      table.string('senderName').notNullable()
      table.string('senderEmail').notNullable()
      table.string('senderPhone')
      table.string('message').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('mails')
  }
}

module.exports = MailsSchema
