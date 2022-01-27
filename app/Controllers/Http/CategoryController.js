'use strict'

const Database = use('Database')
const Category = use('App/Models/Category')

class CategoryController {
    async adminIndex({ request, view }){
        const referer = request.header('referer')
        const sort1 = request.input('sort1')? request.input('sort1'): 'updated_at'
        const sort2 = request.input('sort2')? request.input('sort2'): 'updated_at'
        let onDesc = request.input('onDesc')? request.input('onDesc'): 1


        const categories = (await Category.all()).toJSON().sort((category1, category2) => {
            let x, y
            if(sort2==="name"){
                x = category1[sort2].toLowerCase();
                y = category2[sort2].toLowerCase();
                onDesc = 1

            }else{
                x = category1[sort2]
                y = category2[sort2]
            }
            
            if(x < y) { return (-1*onDesc) }
            if(x > y) { return (1*onDesc) }

        }).sort((category1, category2) => {
            let x, y
            if(sort1==="name"){
                x = category1[sort1].toLowerCase();
                y = category2[sort1].toLowerCase();
                onDesc = 1

            }else{
                x = category1[sort1]
                y = category2[sort1]
            }
            
            if(x < y) { return (-1*onDesc) }
            if(x > y) { return (1*onDesc) }
        })

        const perPage = request.input('perPage')? request.input('perPage'): 20
        const pages = Array(Math.ceil(categories.length / perPage)).fill(0).map((x, i) => i + 1);
        const page = request.input('page')? request.input('page') > pages.length? pages.length: 
                        request.input('page') : 1

        const categoriesToView = []
        const start = (page-1)*perPage
        const end = start+perPage

        for (let i = start; i < end; i++) {
            const category = categories[i]
            if(category){
                categoriesToView.push(category)
            }
        }

        return view.render('/admin/categories', {
            categories: categoriesToView,
            sort1: sort1, sort2: sort2, onDesc: onDesc,
            page: page, pages: pages, perPage: perPage,
            sideMenu: 'categories'
        })
    }


    async adminAdd({ request, session, response }){
        const name = request.input('name')
        const category = await Category.findBy('name', name)

        if(category){
            session.flash({ errorNotif: 'Category '+category.name+' is already exist !'})

        }else{
            const newCategory = new Category()

            let find = 0, code = "", enableCode = null
            do{
                find++;
                let characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
                let charactersLength = characters.length;

                for (let i=0; i < 6; i++) {
                    code += characters.substr(Math.floor((Math.random() * charactersLength) + 1), 1);
                }

                enableCode = await Category.findBy('id', code)
            }while(enableCode && find < 10)

            if(!enableCode){
                newCategory.id = code
                newCategory.name = name
                await newCategory.save()
                session.flash({ successNotif: 'Category '+newCategory.name+' added !'})

            }else{
                session.flash({ errorNotif: 'An error has occured!!! Please try again.'})
            }
        }

        return response.redirect('/admin/categories')
        
    }


    async adminUpdateView({ params, request, session, response, view }) {
        const category = await Category.find(params.id)
        
        const referer = request.header('referer')
        const filter = request.input('filter')? request.input('filter'): 'all'
        const sort1 = request.input('sort1')? request.input('sort1'): 'updated_at'
        const sort2 = request.input('sort2')? request.input('sort2'): 'updated_at'
        let onDesc = request.input('onDesc')? request.input('onDesc'): 1

        const products = (await Database.table('products').where('category_id', category.id))
                                        .filter( product => {
            if(filter === 'onStore'){
                return product.onStore

            }else if(filter === 'notOnStore'){
                return !product.onStore

            }else{
                return true
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

        return view.render('/admin/category/update', {
            category: category,
            products: productsToView,
            filter:filter, sort1: sort1, sort2: sort2, onDesc: onDesc,
            page: page, pages: pages, perPage: perPage,
            sideMenu: 'categories'
        })
    }


    async adminUpdate({ params, request, session, response }){
        const name = await request.input('name')
        const category = await Category.find(params.id)

        if(category.name === name) {
            session.flash({ successNotif: 'Category '+category.name+' is updated !'})

        }else{
            const categoryExist = await Category.findBy('name', name)

            if(categoryExist){
                session.flash({ errorNotif: 'Category '+categoryExist.name+' is already exist !'})
                
            }else{
                category.name = name
                await category.save()
                session.flash({ successNotif: 'Category '+category.name+' is updated !'})
            }
        }

        return response.redirect('/admin/category/update/'+category.id)

    }


    async adminDelete({ params, request, session, response}){
        const referer = request.header('referer')
        
        const category = await Category.find(params.id)

        if(category){
            await category.delete()
            session.flash({ successNotif: 'Category '+category.name+' is deleted !'})

            return response.redirect(referer)
        }else{
            session.flash({ errorNotif: 'An error has occured!!!'})

            return response.redirect(referer)
        }
    }


    async adminSelect({ request, session, response}){
        const referer = request.header('referer')
        const inputs = request.post()
        const action = request.input('action')

        let done = 0
        let select = 0
        let notif = ""

        for (const key in inputs) {
            if(request.input(key)==="on"){
                const category = await Category.find(key)

                if(category){
                    if(action==="deleteCategories"){
                        await category.delete()
                        done++
                    }
                    select++
                }
            }
        }

        if(action==="deleteCategories"){
            notif = done+" categories of "+select+" are deleted !"
        }

        session.flash({ successNotif: notif })
        return response.redirect(referer)

    }
}

module.exports = CategoryController
