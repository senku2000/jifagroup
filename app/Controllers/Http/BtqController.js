'use strict'

const Product = use('App/Models/Product')
const Category = use('App/Models/Category')
const Cart = use('App/Models/Cart')
const CartLine = use('App/Models/CartLine')
const Order = use('App/Models/Order')
const DeliveryAddress = use('App/Models/DeliveryAddress')
const Payment = use('App/Models/Payment')
const City = use('App/Models/City')
const District = use('App/Models/District')
const DeliveryPrice = use('App/Models/DeliveryPrice')
const Database = use('Database')

class BtqController {
       
    async home({ view, request  }) {
        /**
         * Au debut l'utilisateur n'a pas de panier
         */
        
        let cart = null

        /**
         * On verifie si l'utilisateur a un panier
         * enregistrer dans son cookie et
         * si ce dernier est valide et
         * on le recupere si oui
         */
        const cart_id = request.cookie('cart_id',0)
        if(cart_id)
            cart = await Cart.find(cart_id)

        const categoriesAll = (await Category.all()).toJSON()

        for (let i = 0; i < categoriesAll.length; i++) {

            categoriesAll[i].products = (await Database.table('products').where('category_id', categoriesAll[i].id))
                .filter(product => {
                    return product.onStore
                })
        }

        /**
         * On filtre les categorie pour recuperer uniquement
         * les categorie ayant des produits
         */
        const categories = categoriesAll.filter(category => {
            return category.products.length > 0
        })

        const products = await Database.table('products')
                                        .orderBy('created_at', 'desc')
                                        .where('onStore', true)
                                        .offset(0)
                                        .limit(6)
        
        return view.render('front-office.welcome',{
                products: products,
                cart:cart,
                active: 'home',
                categories: categories
            })       
    }


   
    async store({ view, params, request , response }) {                

        /**
        * Au debut l'utilisateur n'a pas de panier
        */
        let cart = null

        /**
        * On verifie si l'utilisateur a un panier
        * enregistrer dans son cookie et
        * si ce dernier est valide et
        * on le recupere si oui
        */
        const cart_id = request.cookie('cart_id')
        if(cart_id)
            cart = await Cart.find(cart_id)

        

        /**
         * On recupere toutes les categories et on
         * leurs associe leur produits
         */
        const categoriesAll = (await Category.all()).toJSON()

        for (let i = 0; i < categoriesAll.length; i++) {
            
            categoriesAll[i].products = (await Database.table('products').where('category_id', categoriesAll[i].id))
                                .filter( product => {
                return product.onStore
            })
        }

        /**
         * On filtre les categorie pour recuperer uniquement
         * les categorie ayant des produits
         */
        const categories = categoriesAll.filter( category => {            
                return category.products.length > 0
        })

        /**
         * On filtre les produits qui sont onStore pour 
         * recupere uniquement les produits qui sont dans la category demander
         */
        let category_id = params.category_id

        let products = (await Database.table('products').where('onStore', true)).filter( product => {
            if (category_id === "others"){
                return product.category_id == null // produis n'ayant pas de categorie

            }else if (category_id){
                return (category_id === product.category_id)

            }else{
                return true
            }

        })
        
        if (products.length <= 0)
            return response.route('store')
        
        const others = await Database.table("products").where('category_id', null)
       
        
        return view.render('front-office.store',{
            categories:categories,
            products: products,
            others: others,
            cart: cart,
            active: 'store',
            c_category_id : params.category_id
        })      
    }


    async viewProduct({ params, response, view , request}) {

        /**
      * Au debut l'utilisateur n'a pas de panier
      */
        let cart = null

        /**
        * On verifie si l'utilisateur a un panier
        * enregistrer dans son cookie et
        * si ce dernier est valide et
        * on le recupere si oui
        */
        const cart_id = request.cookie('cart_id')
        if (cart_id)
            cart = await Cart.find(cart_id)

        
        if (params.id) {
            let product = await Product.find(params.id)
            if (!product) {
                return response.route('store')
            }
            let products = (await Database.table('products').where('category_id', product.category_id))
                .filter(el => { return el.onStore })
                .filter(el => { return el.id !== product.id })
            
            const categoriesAll = (await Category.all()).toJSON()
            for (let i = 0; i < categoriesAll.length; i++) {

                categoriesAll[i].products = (await Database.table('products').where('category_id', categoriesAll[i].id))
                    .filter(product => {
                        return product.onStore
                    })
            }
            const categories = categoriesAll.filter(category => {
                return category.products.length > 0
            })

            return view.render('front-office/viewProduct', { product: product, products: products, categories: categories, cart: cart })
        } else {
            return response.route('store')
        }
    }

    async addToCaret({ response, request }) {


        /**
         * On cree d'abord un panier
         */
        let cart = new Cart()

        /**
        * On verifie si l'utilisateur a un panier
        * enregistrer dans son cookie et
        * si ce dernier est valide et
        * on le recupere si oui dans le nouveau panier
        */
        const cart_id = request.cookie('cart_id')        
        if(cart_id)
            cart = await Cart.find(cart_id)            
        
        /**
         * si on a pas deja de panier a recupperer
         * on lui en cree un avec un identifiant unique         
         */
        if(cart===null||!cart.id){ 
            
            // generateur d'identifiant
            let find = 0, code = "", enableCode = null
            do{
                find++;
                let characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let charactersLength = characters.length;

                for (let i=0; i < 10; i++) {
                    code += characters.substr(Math.floor((Math.random() * charactersLength) + 1), 1);
                }

                enableCode = await Category.findBy('id', code)
            }while(enableCode && find < 10)                        

            /**
             * si le code genere est bien unique
             * et n'est pas encore utiliser
             * on l'affecte au panier si non
             * on redirige l'utilisateur pour reprendre le processus
             */
            if(!enableCode){
                if (!cart) //si un panier n'existe pas encore on le cree
                    cart = new Cart()                                
                cart.id = code                
            } else {
                session.flash({
                    alert: `<span>Une erreur s'est produite lors 
                            de la creation de votre panier ! <br>
                            Vous pouvez à nouveau tanté un achat.</span>`
                })
               return response.route('home')
            }

        }


        const product_id = request.get().id
        
        if(product_id){

            const product = await Product.find(product_id)

            if (product) {
                

                let enableCartLine = await Database.table('cart_lines').where('cart_id', cart.id)
                                                    .where('product_id',product.id)
                if(enableCartLine.length>0){
                    let newQuantity = enableCartLine[0].quantity + 1

                    const affectedRow = await Database.table('cart_lines')
                        .where('cart_id', cart.id)
                        .where('product_id', product.id)
                        .update('quantity', newQuantity)
                } else {
                    
                    let count = await Database.table('cart_lines').where('cart_id', cart.id).count()

                    if (count[0]['count(*)'] === 6) {
                        return response.send('max_items')
                    }

                    const cartLine = new CartLine()
                    cartLine.cart_id = cart.id
                    cartLine.product_id = product.id
                    cartLine.quantity = 1
                    await cartLine.save()
                }

                cart.itemCount = cart.itemCount? cart.itemCount+1 : 1
                cart.cartPrice = cart.cartPrice? cart.cartPrice+product.price : product.price
                response.cookie('cart_id', cart.id)
                await cart.save()                
                return response.send({ itemCount: cart.itemCount, prodName: product.name })

            } else {
                return response.send('error db')               
            }
            
        } else {
           return response.send('error')
        }

    }
    

   async view_caret({view,request,response,session}){

       
       /**
       * On verifie si l'utilisateur a un panier
       * enregistrer dans son cookie et
       * si ce dernier est valide et
       * on le recupere si oui
       */
       let enableCart = null

       let cart_id = request.cookie('cart_id', 0)                     
       if (cart_id)
           enableCart = await Cart.find(cart_id)
       
       
       if (enableCart) {
           if (enableCart.cartPrice <= 0) {
               session.flash({
                   alert: `<span class="text-center">Votre panier est vide ! </span>` })
               return response.route('home')
            }
           // on recupere les produit du panier
           const cart_lines = await Database.table('cart_lines') 
                                    .where('cart_id', enableCart.id) 
          
           /**
            * on effectue un trie des produits
            */           
           for (let i in cart_lines) {
               const current_prod = await Product.find(cart_lines[i].product_id)
               cart_lines[i].name = current_prod.name
               cart_lines[i].price = current_prod.price * cart_lines[i].quantity
               cart_lines[i].img = current_prod.imageUrl               
           }

           return view.render('front-office.cart', { cart_lines: cart_lines, cart: enableCart })
       } else {

           response.clearCookie('cart_id')         
           session.flash({
               alert: `<span class="text-center">Votre panier est vide ou a été perdu !</br>
                                             Recommencer votre achat </span>` })
           response.route('home')
       }
                
    }
    

    async addQuantity({ request }) {
        
        /**
         * On verifie si l'utilisateur a un panier
         * enregistrer dans son cookie et
         * si ce dernier est valide et
         * on le recupere si oui
         */
        let enableCart = null

        let cart_id = request.cookie('cart_id', 0)
        if (cart_id)
            enableCart = await Cart.find(cart_id)
        
        
        if (enableCart) {

            let data = request.all()
            
            let cart_line = await CartLine.find(data.id)

            if (cart_line) {
                cart_line.quantity += 1

                const product_price = (await Product.find(cart_line.product_id)).price
                enableCart.itemCount += 1
                enableCart.cartPrice += product_price
                await cart_line.save()
                await enableCart.save()
            }
        }
        
    }


    async decreaseQuantity({ request }) {

        /**
         * On verifie si l'utilisateur a un panier
         * enregistrer dans son cookie et
         * si ce dernier est valide et
         * on le recupere si oui
         */
        let enableCart = null

        let cart_id = request.cookie('cart_id', 0)
        if (cart_id)
            enableCart = await Cart.find(cart_id)
        
        
        if (enableCart) {

            let data = request.all()

            let cart_line = await CartLine.find(data.id)

            if (cart_line) {
                cart_line.quantity -= 1

                const product_price = (await Product.find(cart_line.product_id)).price
                enableCart.itemCount -= 1
                enableCart.cartPrice -= product_price
                await cart_line.save()
                await enableCart.save()
            }
        }
    }


    async delFromCart({ request }) {
       
        /**
         * On verifie si l'utilisateur a un panier
         * enregistrer dans son cookie et
         * si ce dernier est valide et
         * on le recupere si oui
         */
        let enableCart = null

        let cart_id = request.cookie('cart_id', 0)
        if (cart_id)
            enableCart = await Cart.find(cart_id)
        
        
        if (enableCart) {
           
           const data = request.all()

           const cart_line = await CartLine.find(data.id)
           
           if (cart_line) {
               enableCart.itemCount -= cart_line.quantity

               const product_price = (await Product.find(cart_line.product_id)).price
               enableCart.cartPrice -= (cart_line.quantity * product_price)
               await cart_line.delete()
               await enableCart.save()
          }           

       } 
   }

   
    async delivry_addressView({ request, view ,response , session }) {        
       
        /**
         * On verifie si l'utilisateur a un panier
         * enregistrer dans son cookie et
         * si ce dernier est valide et
         * on le recupere si oui
         */
        let enableCart = null

        let cart_id = request.cookie('cart_id', 0)
        if (cart_id)
            enableCart = await Cart.find(cart_id)

        if (enableCart) {
            
            if (enableCart.cartPrice <= 0) {
                session.flash({
                    alert: `<span class="text-center">Votre panier est vide ! </span>`
                })
                return response.route('home')
            }

            const cart_lines = await Database.table('cart_lines').where('cart_id', enableCart.id) // on recupere les produit du panier

            //on effectue un trie des produits
            for (let i in cart_lines) {
                const current_prod = await Product.find(cart_lines[i].product_id)
                cart_lines[i].name = current_prod.name
                cart_lines[i].price = current_prod.price * cart_lines[i].quantity
                cart_lines[i].img = current_prod.imageUrl
            }
            
            
            let cities = (await City.all()).toJSON()

            for (let i in cities) {
                cities[i].district = await Database.table('districts').where('city_id', cities[i].id)
            }

            cities = cities.filter(el => {
                return el.district.length > 0
            })
            
            return view.render('front-office.addresseLivraison', {
                cart_lines: cart_lines,
                cart: enableCart,
                coordonnee: request.cookie('coordonnee'),
                cities: cities,
            })                        

        } else {

            response.clearCookie('cart_id')
            session.flash({
                alert: `<span class="text-center">Votre panier est vide ou a été perdu !</br>
                                             Recommencer votre achat </span>` })
            response.route('home')
        }
       
   }

    
    async getDistrict({ request , response }) {
        
        
        try {
            let data = request.get()
            const district = await Database.table('districts').where('city_id', data.city_id)
            return response.send(district)
        }catch(e){           
            response.redirect('back')
        }

    }


   async delivry_adressPost({ request,response,session }){

       let data = request.all()
       let city = await City.find(data.city)
       let district = null
       let delivry_price = null
           
       
       if (data.livraison === 'avec_livraison') {
            
            district = await District.findBy('name', data.district)
            
            delivry_price = await DeliveryPrice.findBy('district_id', district.id)
            if(!delivry_price){ 
                session.flash({
                    alert: `<span class="text-center">La livraison vers le lieux choisit <br/> n'est pas encore possible ! </span>`
                })

                return response.route('delivry_addressView')
            }
            delivry_price = delivry_price.price;
        }
        
        response.cookie('coordonnee',{
            fullname:data.fullname,
            address:data.address,
            district:data.district,
            city:city.name,
            phone: data.phone,
            livraison: data.livraison === 'avec_livraison' ? true : false,
            delivry_price : delivry_price ? delivry_price : 0
        })            

        response.route('payments')
   }

    
    async paymentsView({ view, request , response , session}) {
       
        /**
         * On verifie si l'utilisateur a un panier
         * enregistrer dans son cookie et
         * si ce dernier est valide et
         * on le recupere si oui
         */
        let enableCart = null

        let cart_id = request.cookie('cart_id', 0)
        if (cart_id)
            enableCart = await Cart.find(cart_id)

        if (enableCart) {

            if (enableCart.cartPrice <= 0) {

                session.flash({
                    alert: `<span class="text-center">Votre panier est vide ! </span>`
                })

                return response.route('home')
            }

            if ( !request.cookie('coordonnee', 0)) {
                session.flash({
                    alert: `<span class="text-center">Veuillez renseigner vos coordonnée ! </span>`
                })

                return response.route('delivry_addressView')

            }

            const cart_lines = await Database.table('cart_lines').where('cart_id', enableCart.id) // on recupere les produit du panier

            //on effectue un trie des produits
            for (let i in cart_lines) {
                const current_prod = await Product.find(cart_lines[i].product_id)
                cart_lines[i].name = current_prod.name
                cart_lines[i].price = current_prod.price * cart_lines[i].quantity
                cart_lines[i].img = current_prod.imageUrl
            }
            
            return view.render('front-office.payments', {
                cart_lines: cart_lines,
                cart: enableCart,
                coordonnee: request.cookie('coordonnee')
            })
        
               
        } else {

            response.clearCookie('cart_id')
            session.flash({
                alert: `<span class="text-center">Votre panier est vide ou a été perdu !</br>
                                             Recommencer votre achat </span>` })
            response.route('home')
        }
   }
    

    async commmande_register({ response, session, request }) {       

       let find = 0, code = "", enableCode = null        
        do {
                find++;
                let characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let charactersLength = characters.length;
                for (let i = 0; i < 10; i++) {
                    code += characters.substr(Math.floor((Math.random() * charactersLength) + 1), 1);
            }
            enableCode = await Order.find(code)
        } while (enableCode && find < 10)


        if (!enableCode) {                      
            
            let cart_id = request.cookie('cart_id', 0)
            let enableCart = null
            if (cart_id)
                enableCart = await Cart.find(cart_id)
            
            
            if (enableCart) {

                if (enableCart.cartPrice <= 0) {
                    session.flash({
                        alert: `<span class="text-center">Votre panier est vide ! </span>`
                    })
                    return response.route('home')
                }

                if (!request.cookie('coordonnee', 0)) {
                    session.flash({
                        alert: `<span class="text-center">Veuillez renseigner vos coordonnée ! </span>`
                    })

                    return response.route('delivry_addressView')

                }

                const order = new Order()
                order.id = code
                order.livraison = request.cookie('coordonnee').livraison

                enableCart.order_id = order.id

                const deliveryAddress = new DeliveryAddress()

                deliveryAddress.order_id = order.id
                deliveryAddress.fullname = request.cookie('coordonnee').fullname
                deliveryAddress.address = request.cookie('coordonnee').address
                deliveryAddress.district = request.cookie('coordonnee').district
                deliveryAddress.country = "Bénin"
                deliveryAddress.city = request.cookie('coordonnee').city
                deliveryAddress.phone = request.cookie('coordonnee').phone

                const payment = new Payment()


                code = ""
                find = 0
                enableCode = null
                do {
                    find++;
                    let characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
                    let charactersLength = characters.length;
                    for (let i = 0; i < 10; i++) {
                        code += characters.substr(Math.floor((Math.random() * charactersLength) + 1), 1);
                    }
                    enableCode = await Payment.find(code)
                } while (enableCode && find < 10)


                if (!enableCode) {
                    payment.id = code
                    payment.order_id = order.id                    
                    payment.paymentId = order.id
                }

                let cart_lines = await Database.table('cart_lines')
                    .where('cart_id', enableCart.id)
                    .update('order_id', order.id)
                await enableCart.save()
                await order.save()
                await deliveryAddress.save()
                await payment.save()

                return response.route('recut')                                    

            }else {
                    session.flash({
                        alert: `<span class="text-center">Votre panier est vide ou a été perdu !</br>
                                             Recommencer votre achat </span>` })
                response.clearCookie('cart_id')
                return response.route('home')
            }
           
       } else {           
           response.clearCookie('cart_id')                     
           session.flash({ alert: `<span>Une Erreur est survenue !</br> Veuiller nous contacter </span>` })
           return response.redirect(request.header('referer'))
        }
        
    }
    
    async recutView({ view , request , session , response}) {

        /**
        * On verifie si l'utilisateur a un panier
        * enregistrer dans son cookie et
        * si ce dernier est valide et
        * on le recupere si oui
        */
        let enableCart = null

        let cart_id = request.cookie('cart_id', 0)
        if (cart_id)
            enableCart = await Cart.find(cart_id)

        
        if (enableCart) {

            let user_payment = await Payment.findBy('order_id', enableCart.order_id)
            
            if (!user_payment) {
                session.flash({ alert: 'Veuillez Payer vos achats' })
                return response.route('payments')
            }           

            const order = await Order.find(enableCart.order_id)
            const deliveryAddress = await DeliveryAddress.findBy('order_id',order.id)
            const payment = await Payment.findBy('order_id', order.id)
            
            
            let district = await District.findBy('name', deliveryAddress.district)
            let delivry_price = (await DeliveryPrice.findBy('district_id', district.id)).price

            let cart_lines = await Database.table('cart_lines')
                                            .where('cart_id', enableCart.id)

            let recut_cart_lines = ""
            
            for (let i = 0; i < cart_lines.length; i++) {

                const line = cart_lines[i]

                const product = await Product.find(line.product_id)
                
                recut_cart_lines += `<tr ${i >= 3 ? ' class="morePages" ' : '' }>
                                        <td>  ${line.quantity}  </td> 
                                        <td> 
                                            <div class="col-12 m-0"> 
                                                <div class="row"> 
                                                    <div styl="width: 70px;"> 
                                                        <img src="${product.imageUrl}" 
                                                             class="md:w-1/4 w-24 h-24" > 
                                                    </div> 
                                                    <div class="pl-2"> 
                                                        <p>                                                             
                                                            ${product.name}
                                                        </p>
                                                    </div> 
                                                </div> 
                                            </div> 
                                        </td> 
                                        <td class="text-right"> 
                                            ${product.price}FCFA 
                                        </td> 
                                        <td class="text-right"> 
                                            ${product.price * line.quantity}FCFA 
                                        </td> 
                                    </tr>`
            }
            

            let recut = `<div id="recut"
                              class="flex flex-col justify-between items-center pt-3 pb-2 mb-3  border-bottom bg-white w-full"
                              
                              >
                                    <div class="p-2 bg-gray-100"> 
                                        <div class="flex justify-between md:flex-row flex-col"> 
                                            <small class="col-md-7 md:text-left text-center my-1"> 
                                                Order code : <strong>  ${order.id}  </strong> 
                                                | Delivery country : <strong>   ${deliveryAddress.country}   </strong>                                                 
                                                | Livraison : <strong> ${order.livraison ? 'avec livraison' : 'sans livraison' } </strong>
                                                |
                                                <span class="text-center text-secondary">Not shipped</span> 
                                            </small> 
                                            <small class="col-md-5 md:text-right text-center my-1"> ${order.created_at.toLocaleDateString()} </small>
                                        </div> 
                                    </div>
                                    <div class="text-green-500 flex w-full">
                                        <h1 class="mx-auto my-2">JIFA GROUP</h1>
                                    </div
                                    <div class="md:w-4/5 w-full md:p-0 p-2">

                                        <div class="flex justify-between sm:flex-row flex-col">
                                            
                                            <div class="col-md-6 text-left  my-1">
                                                
                                                    <div class="col-12"> ${deliveryAddress.fullname} </div>
                                                    <div class="col-12">Delivery address :</div>
                                                    <small class="col-12">
                                                        ${deliveryAddress.address}  , 
                                                        ${deliveryAddress.city} ,                                                         
                                                        ${deliveryAddress.district}   
                                                        <br> 
                                                        ${deliveryAddress.phone}
                                                    </small>
                                                
                                            </div>

                                            <div class="col-md-6  sm:text-right text-center my-1">
                                                ${order.livraison ? '<h6 class="flex sm:text-right text-">Frais de livraison :<span class="text-primary">' + delivry_price + 'FCFA</span></h6> ' : ''}
                                                
                                                <h6 class="flex "> 
                                                    Cout achat : 
                                                    <span class="text-primary"> 
                                                        ${enableCart.cartPrice} FCFA 
                                                    </span> 
                                                </h6> 
                                                <h6 class="flex sm:text-right text-center">
                                                    Total Paid :
                                                    <span class="text-primary">
                                                        ${enableCart.cartPrice + (order.livraison ? delivry_price : 0) } FCFA
                                                    </span>
                                                </h6>
                                            </div>
                                            
                                        </div>
                                        
                                        <div class="flex"> 
                                            
                                            <div class="offset- col-5"> 
                                                <div class="row"> 
                                                    <h6 class="col-12">Payment :</h6> 
                                                    <small class="col-12"> 
                                                        <!--Payment method : <em> ${payment.paymentMethod} </em> <br--> 
                                                        Payment ID : ${payment.paymentId} <br> 
                                                    </small> 
                                                </div> 
                                            </div>
                                            
                                        </div>

                                        <div class="row py-4"> 
                                            <div class="col-12"> 
                                                <h6 class="col-12 text-center">Cart</h6> 
                                                <table class="table table-bordered table-striped p-2"> 
                                                    <thead> 
                                                        <tr> 
                                                            <th>Quantity</th> 
                                                            <th>Product</th> 
                                                            <th class="text-right">Price</th> 
                                                            <th class="text-right">Subtotal</th> 
                                                        </tr> 
                                                    </thead> 
                                                    <tbody> 
                                                        ${recut_cart_lines}
                                                    </tbody> 
                                                </table> 
                                            </div> 
                                    </div>`

            return view.render('front-office.recut', { recut: recut , name: order.id })
        } else {
            response.clearCookie('cart_id')
            session.flash({ alert: 'Veuillez effectuer au moins achats' })
            return response.route('store')
        }
        
    }

    async shoppingEnd({ response }) {
        
        response.clearCookie('cart_id')        
        response.route('home')
    }

    async searchProduct({ request , response }) {

        try {
            let data = request.get()

            let products = (await Product.all()).toJSON()
                .filter(el => {
                    return el.onStore
                })
                .filter(el => {
                    if (el.name.toLowerCase().includes(data.search.toLowerCase()))
                        return true
                })

            return response.send(products)
        } catch (e) {
            response.redirect('back')
        }
    }
       
    async api_get_products({ response }) {
        let products = (await Product.all()).toJSON()
            .filter(el => {
            return el.onStore
            })
        return response.send(products)
    }
    
}

module.exports = BtqController
