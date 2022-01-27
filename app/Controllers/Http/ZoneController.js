'use strict'

const City = use('App/Models/City')

class ZoneController {

    async index({ response }){

        return response.route('adminDeliveryPrices')
    }
}

module.exports = ZoneController
