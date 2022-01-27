'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class OrdersSchema extends Schema {
  up () {
    this.create('orders', (table) => {
      table.string('id').notNullable().primary()
      table.boolean('shipped').notNullable().defaultTo(false)
      table.boolean('livraison').notNullable().defaultTo(false)
      table.timestamps()
    })
  }

  down () {
    this.drop('orders')
  }
}

module.exports = OrdersSchema
