'use strict'

const Database = use('Database')
const Product = use('App/Models/Product')
const Category = use('App/Models/Category')
const Helpers = use('Helpers')
const Drive = use('Drive')


class ProductController {

    async adminView({ params, request, session, response, view }){
        const referer = request.header('referer')
        const code = params.code? params.code : 'all'
        const filter = request.input('filter')? request.input('filter'): 'noMatter'
        const sort1 = request.input('sort1')? request.input('sort1'): 'updated_at'
        const sort2 = request.input('sort2')? request.input('sort2'): 'updated_at'
        let onDesc = request.input('onDesc')? request.input('onDesc'): 1

        const categories = (await Category.all()).toJSON()

        const products = (await Product.all()).toJSON().filter( product => {
            if(code === 'onStore'){
                return product.onStore

            }else if(code === 'notOnStore'){
                return !product.onStore

            }else{
                return true
            }

        }).filter( product => {
            if(filter==='noMatter'){
                return true
                
            }else if(filter==='noCategory'){
                return product.category_id === null

            }else{
                return product.category_id === filter
            }

        }).sort((product1, product2) => {
            let x, y
            
            if(sort2==="name"){
                x = product1.name.toLowerCase();
                y = product2.name.toLowerCase();
                onDesc = 1

            }else{
                x = product1[sort2]
                y = product2[sort2]
            }
            
            if(x < y) { return (-1*onDesc) }
            if(x > y) { return (1*onDesc) }

        }).sort((product1, product2) => {
            let x, y
            
            if(sort1==="name"){
                x = product1.name.toLowerCase();
                y = product2.name.toLowerCase();
                onDesc = 1

            }else{
                x = product1[sort1]
                y = product2[sort1]
            }
            
            if(x < y) { return (-1*onDesc) }
            if(x > y) { return (1*onDesc) }

        })

        const perPage = request.input('perPage')? request.input('perPage'): 20
        const pages = Array(Math.ceil(products.length / perPage)).fill(0).map((x, i) => i + 1);
        const page = request.input('page')? request.input('page') > pages.length? pages.length: 
                        request.input('page') : 1

        const productsToView = []
        
        if(products.length > 0){
            const start = (page-1)*perPage
            const end = start+perPage

            for (let i = start; i < end; i++) {
                const product = products[i]
                if(product){
                    product.category = await Category.find(product.category_id)
                    productsToView.push(product)
                }
            }

        }

        return view.render('admin/productses', {
            categories: categories,
            products: productsToView,
            sideMenu: 'products',
            code: code,
            filter:filter, sort1: sort1, sort2: sort2, onDesc: onDesc,
            page: page, pages: pages, perPage: perPage
        })

    }


    async adminViewGet({ request, response, view }){
        
    }

    async adminAddView({ request, view }){
        const referer = request.header('referer')
        const categories = (await Category.all()).toJSON().sort((category1, category2) => {
            const x = category1.name.toLowerCase()
            const y = category2.name.toLowerCase()

            if(x < y) { return (-1) }
            if(x > y) { return (1) }
        })

        return view.render('/admin/product/add', {
            categories: categories,
            sideMenu: 'products',
            referer: referer
        })
    }
    

    async adminAdd({ request, session, response }) {
        
        let find = 0, code = "", enableCode = null
        do{
            find++
            let characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
            let charactersLength = characters.length

            for (let i=0; i < 6; i++) {
                code += characters.substr(Math.floor((Math.random() * charactersLength) + 1), 1);

            }

            enableCode = await Product.find(code)

        }while(enableCode && find < 10)

        if(!enableCode){
            const newProduct = new Product()
            newProduct.id = code
            newProduct.name = request.input('name')
            newProduct.description = request.input('description')
            newProduct.price = request.input('price')
            newProduct.quantity = request.input('quantity')
            const category_id = request.input('category_id')
            if(category_id){
                newProduct.category_id = category_id
            }

            await newProduct.save();
            const product = await Product.find(code)

            session.flash({ successNotif: 'Product Added !!! Add an image'})
            return response.redirect('/admin/product/update/'+product.id)

        }else{
            session.flash({ errorNotif: 'An error has occured!!! Please try again.'})
            return response.redirect('/admin/product/add')
        }
        
    }


    async adminUpdateView({ params, response, view }) {
        const product = await Product.find(params.id)
        
        const categories = (await Category.all()).toJSON().sort((category1, category2) => {
            const x = category1.name.toLowerCase()
            const y = category2.name.toLowerCase()

            if(x < y) { return (-1) }
            if(x > y) { return (1) }
        })

        //

        if(product){

            return view.render('admin/product/update', {
                product: product,
                categories: categories,
                sideMenu: 'products',
            })
            
        }else{
            return response.redirect('/admin/products')
        }

    }


    async adminUpdate({ params, request, session, response}){
        const product = await Product.find(params.id)

        product.name = request.input('name')
        product.description = request.input('description')
        product.price = request.input('price')
        product.quantity = request.input('quantity')
        product.imageUrl = request.input('imageUrl')

        const category_id = request.input('category_id')
        if(category_id){
            product.category_id = category_id
        }

        await product.save()

        session.flash({ successNotif: product.name+' updated !'})
        return response.route('updateProduct', {id: product.id})
    }


    async adminDelete({ params, request, session, response }){
        const referer = request.header('referer')

        const product = await Product.find(params.id)

        if(product.imageUrl){
            await Drive.delete(Helpers.tmpPath('../public/'+product.imageUrl))
            const imageExist = await Drive.exists(Helpers.tmpPath('../public/'+product.imageUrl))

            if(imageExist){ 
                session.flash({
                    errorNotif: 'An error has occured!!! : '+product.name+' not delete\nPlease try again.'
                })

            }else{
                await product.delete()
                session.flash({ successNotif: product.name+' has successfuly deleted !'})
            }

        }else{
            await product.delete()
            session.flash({ successNotif: product.name+' has successfuly deleted !'})
        }

        return response.redirect(referer)

    }


    async adminUploadImage({ request, params, session, response}){
        const image = request.file('image', {
            allowedExtensions: ['jpg', 'png', 'jpeg']
        })
        const product = await Product.find(params.id)

        if(image){
            const date = new Date()
            const imageName = date.getTime().toString()+'.'+image.extname
            await image.move(Helpers.tmpPath('../public/uploads/images/products/'), {
                name: imageName
            })

            if(image.moved()){
                product.imageUrl = 'uploads/images/products/'+imageName
                await product.save()

                session.flash({ successNotif: 'Image of '+product.name+' is uploaded !'})
               
            }else{
                session.flash({ errorNotif: 'Uploaded is failled !!!'})

            }

        }else{
            session.flash({ errorNotif: 'Uploaded is failled !!!'})
        }

        return response.route('updateProduct', {id: product.id})
    }


    async adminRemoveImage({ params, session, response }){
        const product = await Product.find(params.id)
        await Drive.delete(Helpers.tmpPath('../public/'+product.imageUrl))
        const imageExist = await Drive.exists(Helpers.tmpPath('../public/'+product.imageUrl))

        if(imageExist){ 
            session.flash({ errorNotif: 'Removed image of '+product.name+' is failled !!!'})

        }else{
            product.imageUrl = null
            await product.save()

            session.flash({ successNotif: 'Image of '+product.name+' is successfuly removed !'})
        } 
        return response.route('updateProduct', {id: product.id})
    }

    
    async onStore({ params, request, session, response}){
        const referer = request.header('referer')

        const product = await Product.find(params.id)
        if(!product.name){
            session.flash({ errorNotif: product.name+" don't have name !!! \nGive it name"})

        }else if(product.price<=0){
            session.flash({ errorNotif: product.name+" must have higther price than 0 !!!"})

        }else if(!product.imageUrl){
            session.flash({ errorNotif: product.name+" don't have an image \nUpload an image !!!"})

        }else{
            product.onStore = true
            await product.save()

            session.flash({
                successNotif: product.name+" is successfuly put on store !\nClick on 'View on site' to see it"
            })
        }

        return response.redirect(referer)
    }


    async offStore({ params, request, session, response}){
        const referer = request.header('referer')

        const product = await Product.find(params.id)
        product.onStore = false
        await product.save()

        session.flash({
            successNotif: product.name+" is removed on store !!!"
        })

        return response.redirect(referer)
    }


    async adminSelect({ request, session, response}){
        const inputs = request.post()
        const referer = request.header('referer')
        const action = request.input('action')

        let done = 0
        let select = 0
        let notif = ""

        for(let input in inputs){
            if(request.input(input) === "on"){
                const product = await Product.find(input)
                
                if(product){
                    if(action==="addStore"&&product.name&&product.price>0&&product.imageUrl&&!product.onStore){
                        product.onStore = true
                        await product.save()
                        done++

                    }else if(action==="removeStore" && product.onStore){
                        product.onStore = false
                        await product.save()
                        done++
                        
                    }else if(action==="deleteProducts"){
                        if(product.imageUrl){
                            await Drive.delete(Helpers.tmpPath('../public/'+product.imageUrl))
                            const imageExist = await Drive.exists(Helpers.tmpPath('../public/'+product.imageUrl))
                
                            if(!imageExist){
                                await product.delete()
                                done++
                            }
                
                        }else{
                            await product.delete()
                            done++
                        }
                    }
                    select++
                }
            }
        }

        if(action==="addStore"){ 
            notif = done+" products of "+select+" are successfuly put on store !" 
        }else if(action==="removeStore"){
            notif = done+" products of "+select+" are successfuly removed from the store !"
        }else if(action==="deleteProducts"){
            notif = done+" products of "+select+" are deleted !"
        }

        session.flash({ successNotif: notif })
        return response.redirect(referer)
    }

}

module.exports = ProductController
