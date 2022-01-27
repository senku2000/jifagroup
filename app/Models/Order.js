'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Order extends Model {
    cart(){
        return this.hasOne('App/Models/Cart')
    }

    payment(){
        return this.hasOne('App/Models/Payment')
    }

    deliveryAddress(){
        return this.hasOne('App/Models/DeliveryAddress')
    }
    
}

module.exports = Order
