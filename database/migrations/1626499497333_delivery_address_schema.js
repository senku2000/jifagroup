'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DeliveryAddressSchema extends Schema {
  up () {
    this.create('delivery_addresses', (table) => {
      //table.string('id').notNullable().primary()
      table.increments()
      table.string('order_id')
      table.string('fullname').notNullable()
      table.string('address').notNullable()
      table.string('country').notNullable()
      table.string('district')
      table.string('city').notNullable()
      table.string('zip')//.notNullable()
      table.string('phone').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('delivery_addresses')
  }
}

module.exports = DeliveryAddressSchema
