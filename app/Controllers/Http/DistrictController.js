'use strict'

const Database = use('Database')
const City = use('App/Models/City')
const District = use('App/Models/District')
const DeliveryPrice = use('App/Models/DeliveryPrice')

class DistrictController {

    async adminDistrictsView({ view }){

        const cities = (await City.all()).toJSON().sort((city1, city2) => {
            let x = city1.name
            let y = city2.name
            if(x < y) { return -1 }
            if(x > y) { return 1 }
        })

        const districts = (await District.all()).toJSON().sort((district1, district2) => {
            let x = district1.name
            let y = district2.name
            if(x < y) { return -1 }
            if(x > y) { return 1 }
        })

        for (let i = 0; i < districts.length; i++) {
            const district = districts[i];
            district.city = await City.find(district.city_id)
        }

        districts.sort((district1, district2) => {
            let x = district1.city ? district1.city.name : null
            let y = district2.city ? district2.city.name : null
            if(x < y) { return -1 }
            if(x > y) { return 1 }
        })

        return view.render('admin/zones/districts', {
            sideMenu: 'zones',
            zoneMenu: 'districts',
            cities: cities,
            districts: districts
        })
    }


    async adminAddDistrict({ request, session, response}){
        const referer = request.header('referer')
        const city_id = request.input('city_id')
        const name = request.input('name')
        const city = await City.find(city_id)

        if(city){
            const district = await Database.table('districts').where('city_id', city.id).where('name', name)

            if(district.length > 0){
                session.flash({ errorNotif: 'This district is already exist for this city !'})

            }else{
                const newDistrict = new District()
                newDistrict.city_id = city_id
                newDistrict.name = name
                await newDistrict.save()

                session.flash({ successNotif: newDistrict.name+' is successfuly added !'})
            }

        }else{
            session.flash({ errorNotif: "This city does not exist !\nPlease add this before to add it district"})
        }

        return response.redirect(referer)
    }


    async adminUpdateDistrictView({ params, view }){
        const district = await District.find(params.id)
        const cities = (await City.all()).toJSON()

        if(district){
            const deliveryPrice = await DeliveryPrice.findBy('district_id', district.id)

            return view.render('admin/zones/district/update', {
                sideMenu: 'zones',
                zoneMenu: 'districts',
                district: district,
                cities: cities,
                deliveryPrice: deliveryPrice
            })
        }
    }


    async adminUpdateDistrict({ params, request, session, response }){
        const referer = request.header('referer')
        const district = await District.find(params.id)

        if(district){
            const name = request.input('name')
            const city_id = request.input('city_id')

            if(district.name === name && district.city_id === city_id){
                session.flash({ successNotif: "No changement"})

            }else{
                const districts = await Database.table('districts').where('city_id', city_id).where('name', name)

                if(districts.length > 0){
                    session.flash({ errorNotif: 'This district is already exist for this city !'})

                }else{
                    district.city_id = city_id
                    district.name = name
                    await district.save()
                    session.flash({ successNotif: district.name+' is updated !'})
                }
            }

        }else{
            session.flash({ errorNotif : "An error has occured !"})
        }

        return response.redirect(referer)
    }


    async adminDeleteDistrict({ params, request, session, response}){
        const referer = request.header('referer')
        const district = await District.find(params.id)

        if(district){
            const deliveryPricesDeleted = await Database.table('delivery_prices')
                                                        .where('district_id', district.id).delete()
            await district.delete()
            session.flash({ successNotif: district.name+" is deleted !"})

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
        let deliveryPricesDel = 0

        for (const key in inputs) {
            if(request.input(key)==="on"){
                const district = await District.find(key)

                if(district){
                    if(action==="deleteDistricts"){
                        const deliveryPricesDeleted = await Database.table('delivery_prices')
                                                                    .where('district_id', district.id).delete()
                        await district.delete()
                        done++
                        deliveryPricesDel += deliveryPricesDeleted
                    }

                    select++
                }
            }
        }

        if(action==="deleteDistricts"){
            notif = done+" districts of "+select+" are deleted !\n"
                    +deliveryPricesDel+" delivery prices are deleted"
        }

        session.flash({ successNotif: notif })
        return response.redirect(referer)
    }
}

module.exports = DistrictController
