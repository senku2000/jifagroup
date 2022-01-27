'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CartsSchema extends Schema {
  up () {
    this.create('carts', (table) => {
      table.string('id').notNullable().primary()
      table.string('order_id')
      table.integer('itemCount').defaultTo(0)
      table.integer('cartPrice').defaultTo(0)
      table.timestamps()
    })
  }

  down () {
    this.drop('carts')
  }
}

module.exports = CartsSchema
