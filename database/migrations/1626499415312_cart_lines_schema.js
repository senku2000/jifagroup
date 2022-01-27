'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CartLinesSchema extends Schema {
  up () {
    this.create('cart_lines', (table) => {
      table.increments()
      table.string('order_id')
      table.string('cart_id').notNullable()
      table.string('product_id').notNullable()
      table.integer('quantity').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('cart_lines')
  }
}

module.exports = CartLinesSchema
