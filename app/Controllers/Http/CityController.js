'use strict'

const Database = use('Database')
const City = use('App/Models/City')
const District = use('App/Models/District')

class CityController {

    async adminCitiesView({ view }){
        const cities = (await City.all()).toJSON().sort((city1, city2) => {
            let x = city1.name
            let y = city2.name
            if(x < y) { return -1 }
            if(x > y) { return 1 }
        })

        return view.render('admin/zones/cities', {
            sideMenu: 'zones',
            zoneMenu: 'cities',
            cities: cities,
        })
    }


    async adminAddCityView({ view }){
        return view.render('admin/zones/city/addCity', {
            sideMenu: 'zones',
        })
    }


    async adminAddCity({ request, session, response}){
        const name = request.input('name')
        const city = await City.findBy('name', name)

        if(city){
            session.flash({ errorNotif: 'City '+city.name+' is already exist !'})

        }else{
            const newCity = new City()
            newCity.name = name
            await newCity.save()
            session.flash({ successNotif: 'City '+newCity.name+' added !'})
        }
        
        return response.route('cities')
    }


    async adminUpdateCityView({ params, view }){
        const city = await City.find(params.id)

        if(city){
            const districts = await Database.table('districts').where('city_id', city.id)

            return view.render('admin/zones/city/update', {
                sideMenu: 'zones',
                zoneMenu: 'cities',
                city: city,
                districts: districts
            })
        }
    }


    async adminUpdateCity({ params, request, session, response }){
        const city = await City.find(params.id)

        if(city){
            const name = request.input('name')

            if(city.name === name){
                session.flash({ successNotif: "No changement"})

            }else{
                const cityExist = await City.findBy('name', name)

                if(cityExist){
                    session.flash({ errorNotif: 'City '+city.name+' is already exist !'})

                }else{
                    city.name = name
                    await city.save()
                    session.flash({ successNotif: "City "+city.name+" is updated !"})
                }
            }
            
        }else{
            session.flash({ errorNotif : "An error has occured !"})
        }

        return response.route('adminUpdateCity', {id: params.id})
    }


    async adminDeleteCity({ params, request, session, response}){
        const city = await City.find(params.id)
        const referer = request.header('referer')

        if(city){
            const deliveryPricesDeleted = await Database.table('delivery_prices').where('city_id', city.id)
                                                        .delete()
            const districtsDeleted = await Database.table('districts').where('city_id', city.id).delete()
            await city.delete()
            session.flash({ successNotif: city.name+" is deleted !\n"
                                +districtsDeleted+" districts are deleted !\n"
                                +deliveryPricesDeleted+" delivery prices are deleted !"})

        }else{
            session.flash({ errorNotif: "An error has occured !"})
        }

        return response.redirect(referer)
    }


    async adminSelect({ request, session, response}){
        const referer = request.header('referer')
        const inputs = request.post()
        const action = request.input('action')

        let done = 0
        let select = 0
        let notif = ""
        let districtsDel = 0, deliveryPricesDel = 0

        for (const key in inputs) {
            if(request.input(key)==="on"){
                const city = await City.find(key)

                if(city){
                    if(action==="deleteCities"){
                        const deliveryPricesDeleted = await Database.table('delivery_prices')
                                                                    .where('city_id', city.id).delete()
                        const districtsDeleted = await Database.table('districts').where('city_id', city.id)
                                                                .delete()
                        await city.delete()
                        done++
                        districtsDel += districtsDeleted
                        deliveryPricesDel += deliveryPricesDeleted
                    }

                    select++
                }
            }
        }

        if(action==="deleteCities"){
            notif = done+" cities of "+select+" are deleted !\n"+districtsDel+" districts are deleted !\n"
                    +deliveryPricesDel+" delivery prices are deleted"
        }

        session.flash({ successNotif: notif })
        return response.redirect(referer)
    }

    
}

module.exports = CityController
