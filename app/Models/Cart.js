'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Cart extends Model {
    cartLines(){
        return this.hasMany('App/Models/CartLine')
    }
}

module.exports = Cart
