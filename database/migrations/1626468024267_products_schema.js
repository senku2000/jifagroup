'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ProductsSchema extends Schema {
  up () {
    this.create('products', (table) => {
      table.string('id').notNullable().primary()
      table.string('category_id')
      table.string('name').notNullable()
      table.integer('price').notNullable()
      table.string('description')
      table.integer('quantity').defaultTo(0)
      table.string('imageUrl')
      table.boolean('onStore').notNullable().defaultTo(false)
      table.timestamps()
    })
  }

  down () {
    this.drop('products')
  }
}

module.exports = ProductsSchema
