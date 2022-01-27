'use strict'

const Order = use('App/Models/Order')
const Cart = use('App/Models/Cart')
const CartLine = use('App/Models/CartLine')
const Product = use('App/Models/Product')
const DeliveryAddress = use ('App/Models/DeliveryAddress')
const Payment = use('App/Models/Payment')
const District = use('App/Models/District')
const DeliveryPrice = use('App/Models/DeliveryPrice')


class OrderController {
    async adminIndex({ request, params, session, response, view}){
        const referer = request.header('referer')
        const menu = params.menu? params.menu : 'notShipped'
        const sort1 = request.input('sort1')? request.input('sort1'): 'created_at'
        const sort2 = request.input('sort2')? request.input('sort2'): 'created_at'
        let onDesc = request.input('onDesc')? request.input('onDesc'): -1

        const orderId = request.input('orderId')

        const shipped = request.input('shipped')? request.input('shipped') : 'noMatter'
        const amountMin = request.input('amountMin')
        const amountMax = request.input('amountMax')
        const date1 = request.input('date1')
        const date2 = request.input('date2')

        const orders = (await Order.all()).toJSON().filter( order => {
            if(menu==='shipped'){
                return order.shipped

            }else if(menu==='notShipped'){
                return !order.shipped

            }else if(menu==='searchByCode'){
                if(orderId && orderId.length > 3){
                    return order.id.search(orderId) >= 0
                }
                    
            }else if(menu==='filter'){
                return(
                    (shipped? (order.shipped === 'shipped')? order.shipped : 
                        (order.shipped === 'notShipped')? !order.shipped : 
                            (order.shipped === 'notMatter')? true: false : false
                    ) &&
                    (amountMin? order.cart.cartPrice >= amountMin : true) &&
                    (amountMax? order.cart.cartPrice <= amountMax : true) &&
                    (date1? order.created_at >= date1 : true) &&
                    (date2? order.created_at <= date2 : true)
                )

            }else{
                return true
                
            }

        })

        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            order.cart = await Cart.findBy('order_id', order.id)

            if(order.cart){
                order.cart.cart_lines = (await order.cart.cartLines().fetch()).toJSON()

                for (let j = 0; j < order.cart.cart_lines.length; j++) {
                    const cart_line = order.cart.cart_lines[j];
                    cart_line.product = await Product.find(cart_line.product_id)
                }
            }

            order.deliveryAddress = await DeliveryAddress.findBy('order_id', order.id)
            order.payment = await Payment.findBy('order_id', order.id)
        }
        
        orders.sort((order1, order2) => {
            let x, y
            
            if(sort2==="fullname"){
                x = order1.deliveryAddress? order1.deliveryAddress[sort2].toLowerCase() : null
                y = order2.deliveryAddress? order2.deliveryAddress[sort2].toLowerCase() : null
                onDesc = -1
                
            }else if(sort2==='cartPrice' || sort2==='itemCount'){
                x = order1.cart? order1.cart[sort2] : 0
                y = order2.cart? order2.cart[sort2] : 0

            }else{
                x = order1[sort2]
                y = order2[sort2]
            }
            
            if(x < y) { return (1*onDesc) }
            if(x > y) { return (-1*onDesc) }

        }).sort((order1, order2) => {
            let x, y
            
            if(sort1==="fullname"){
                x = order1.deliveryAddress? order1.deliveryAddress[sort1].toLowerCase() : null
                y = order2.deliveryAddress? order2.deliveryAddress[sort1].toLowerCase() : null
                onDesc = -1
                
            }else if(sort1==='cartPrice' || sort1==='itemCount'){
                x = order1.cart? order1.cart[sort1] : 0
                y = order2.cart? order2.cart[sort1] : 0

            }else{
                x = order1[sort1]
                y = order2[sort1]
            }
            
            if(x < y) { return (1*onDesc) }
            if(x > y) { return (-1*onDesc) }

        })

        const perPage = request.input('perPage')? request.input('perPage'): 20
        const pages = Array(Math.ceil(orders.length / perPage)).fill(0).map((x, i) => i + 1);
        const page = request.input('page')? request.input('page') > pages.length? pages.length: 
                        request.input('page') : 1

        
        const start = (page-1)*perPage
        const end = start+perPage
        const ordersToShow = []

        for (let i = start; i < end; i++) {
            const order = orders[i];
            if(order){
                ordersToShow.push(order)
            }
        }

        return view.render('/admin/orders', {
            orders: ordersToShow,
            sort1: sort1, sort2: sort2, onDesc: onDesc,
            page: page, pages: pages, perPage: perPage,
            orderId: orderId,
            shipped: shipped, amountMin: amountMin, amountMax: amountMax, date1: date1, date2: date2,
            ordersLength: orders.length,
            sideMenu: "orders", menu: menu
        })
    }


    async adminView({ params, request, response, view }){
        const referer = request.header('referer')? request.header('referer') : '/admin/orders'
        const order = (await Order.find(params.id)).toJSON()
        if(order){
            order.cart = await Cart.findBy('order_id', order.id)
            order.cart.cart_lines = (await order.cart.cartLines().fetch()).toJSON()

            for (let j = 0; j < order.cart.cart_lines.length; j++) {
                const cart_line = order.cart.cart_lines[j];
                cart_line.product = await Product.find(cart_line.product_id)
            }

            order.deliveryAddress = await DeliveryAddress.findBy('order_id', order.id)
            order.payment = await Payment.findBy('order_id', order.id)

            

            let district = await District.findBy('name', order.deliveryAddress.district)            
            order.delivery_price = parseInt( (await DeliveryPrice.findBy('district_id', district.id)).price )
            
            
            return view.render('/admin/order/view', {
                order: order,
                referer: referer,
                sideMenu: "orders",
                total: order.delivery_price + ( order.livraison ? order.cart.cartPrice : 0 )
            })

        }else{
            return response.redirect('orders')
        }
    }
    

    async adminSelect({ request, response}){

    }
}

module.exports = OrderController
