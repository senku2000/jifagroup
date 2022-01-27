'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class DistrictSchema extends Schema {
  up () {
    this.create('districts', (table) => {
      table.increments()
      table.string('name').notNullable()
      table.integer('city_id')
      table.timestamps()
    })
  }

  down () {
    this.drop('districts')
  }
}

module.exports = DistrictSchema
