'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DeliveryPricesSchema extends Schema {
  up () {
    this.create('delivery_prices', (table) => {
      table.increments()
      table.integer('city_id')
      table.integer('district_id')
      table.integer('price').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('delivery_prices')
  }
}

module.exports = DeliveryPricesSchema
