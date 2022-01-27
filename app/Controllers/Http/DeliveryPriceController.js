'use strict'

const Database = use('Database')
const DeliveryPrice = use('App/Models/DeliveryPrice')
const City = use('App/Models/City')
const District = use('App/Models/District') 


class DeliveryPriceController {

    async adminDeliveryPricesView({ view }){
        const deliveryPrices = await Database.table('delivery_prices').orderBy('updated_at', 'desc')

        for (let i = 0; i < deliveryPrices.length; i++) {
            const deliveryPrice = deliveryPrices[i];
            deliveryPrice.city = await City.find(deliveryPrice.city_id)
            deliveryPrice.district = await District.find(deliveryPrice.district_id)
        }

        return view.render('admin/zones/delivery-prices', {
            sideMenu: 'zones',
            zoneMenu: 'deliveryPrices',
            deliveryPrices: deliveryPrices
        })
    }


    async adminAddDeliveryPriceView({ view }){
        const cities = await Database.table('cities').orderBy('name')
        const districts = await Database.table('districts').orderBy('name')

        return view.render('admin/zones/delivery-price/add', {
            sideMenu: 'zones',
            zoneMenu: 'deliveryPrices',
            cities: cities,
            districts: districts
        })
    }


    async adminAddDeliveryPrice({ request, session, response}){
        const referer = request.header('referer')
        const cityId = request.input('city')
        const districtId = request.input('district')
        const price = request.input('price')
        const deliveryPrices = await Database.table('delivery_prices').where('city_id', cityId)
                                            .where('district_id', districtId)
        
        if(deliveryPrices.length > 0){
            session.flash({ errorNotif: "This delivery price is already added"})

        }else{
            const deliveryPrice = new DeliveryPrice()
            deliveryPrice.city_id = cityId
            deliveryPrice.district_id = districtId
            deliveryPrice.price = price
            await deliveryPrice.save()
            session.flash({ successNotif: "This delivery price is added"})
        }

        return response.redirect(referer)
    }


    async adminUpdateDeliveryPrice({ params, request, session, response }){
        const referer = request.header('referer')
        const deliveryPrice = await DeliveryPrice.find(params.id)

        if(deliveryPrice){
            deliveryPrice.price = request.input('price')
            await deliveryPrice.save()
            deliveryPrice.city = await City.find(deliveryPrice.city_id)
            deliveryPrice.district = await District.find(deliveryPrice.district_id)
            session.flash({ successNotif: "Delivery price of '"+deliveryPrice.city.name+"/"
                                            +deliveryPrice.district.name+"' is "+deliveryPrice.price
                                            +" XOF now !"})

        }else{
            session.flash({ errorNotif: "An error has occured !"})
        }

        return response.redirect(referer)
    }


    async adminDeleteDeliveryPrice({params, request, session, response}){
        const referer = request.header('referer')
        const deliveryPrice = await DeliveryPrice.find(params.id)

        if(deliveryPrice){
            const city = await City.find(deliveryPrice.city_id)
            const district = await District.find(deliveryPrice.district_id)
            await deliveryPrice.delete()
            session.flash({ successNotif: "Delivery price of "+city.name+" | "+district.name+" is deleted !"})

        }else{
            session.flash({ errorNotif: "An error has occured !"})
        }

        return response.redirect(referer)
    }


    async adminSelect({ request, session, response }){
        const referer = request.header('referer')
        const action = request.input('action')

        if(action === 'updateDeliveryPrice'){
            const deliveryPriceId = request.input('deliveryPriceId')
            const newPrice = request.input('newPrice')
            const deliveryPrice = await DeliveryPrice.find(deliveryPriceId) 
            
            if(deliveryPrice){
                deliveryPrice.price = newPrice
                await deliveryPrice.save()
                deliveryPrice.city = await City.find(deliveryPrice.city_id)
                deliveryPrice.district = await District.find(deliveryPrice.district_id)
                session.flash({ successNotif: "Delivery price of '"+deliveryPrice.city.name+"/"
                                                +deliveryPrice.district.name+"' is "+deliveryPrice.price
                                                +" XOF now !"})

            }else{
                session.flash({ errorNotif: "An error has occcured !"})
            }

        }else{
            const inputs = request.post()
            let done = 0, select = 0, notif = ""

            for (const key in inputs) {
                if(request.input(key)==="on"){
                    const deliveryPrice = await DeliveryPrice.find(key)
    
                    if(deliveryPrice){
                        if(action==="deleteDeliveryPrices"){
                            await deliveryPrice.delete()
                            done++
                        }
    
                        select++
                    }
                }
            }

            if(action==="deleteDeliveryPrices"){
                notif = done+" delivery prices of "+select+" are deleted !"
            }
    
            session.flash({ successNotif: notif })
        }

        return response.redirect(referer)
    }
}

module.exports = DeliveryPriceController
