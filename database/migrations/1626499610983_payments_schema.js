'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PaymentsSchema extends Schema {
  up () {
    this.create('payments', (table) => {
      table.string('id').notNullable().primary()
      table.string('order_id')
      table.string('paymentMethod')
      table.string('paymentId').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('payments')
  }
}

module.exports = PaymentsSchema
