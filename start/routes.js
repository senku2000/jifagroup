'use strict'

const AdminController = require('../app/Controllers/Http/AdminController')
const UserController = require('../app/Controllers/Http/UserController')

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')


Route.get('/', ({ response }) => {
    response.redirect('/home')
})

Route.get('/home', 'BtqController.home').as('home')

Route.get('/store/:category_id?','BtqController.store').as('store')
Route.get('/add-to-caret/', 'BtqController.addToCaret').as('addToCaret')
Route.get('/your-caret', 'BtqController.view_caret').as('viewCaret')

Route.post('/delete-prods-from-cart', 'BtqController.delFromCart').as('delFromCart')
Route.post('/add-product-quantity', 'BtqController.addQuantity').as('addQuantity')
Route.post('/decrease-product-quantity', 'BtqController.decreaseQuantity').as('decreaseQuantity')

Route.get('/addresse-de-livraison', 'BtqController.delivry_addressView').as('delivry_addressView')

Route.post('/addresse-de-livraison', 'BtqController.delivry_adressPost').as('delivry_adressPost')

Route.get('/payments', 'BtqController.paymentsView').as('payments')

Route.post('/commande-registration', 'BtqController.commmande_register').as('commmande_register')

Route.get('/recut-de-commande', 'BtqController.recutView').as('recut')

Route.post('/shopping-end', 'BtqController.shoppingEnd').as('shopping-end')
Route.post('/send-message', 'MailController.sendMail').as('sendMail')

Route.get('/get-district-api', 'BtqController.getDistrict').as('getDistrict')
Route.get('/search-product', 'BtqController.searchProduct').as('search-product')
Route.get('/view-product/:id?', 'BtqController.viewProduct').as('view-product')
Route.get('/api-get-product', 'BtqController.api_get_products').as('api_get_products')

Route.get('/admin', ({ response }) => {
        response.route('login')
})

Route.get('/admin/auth/login', 'UserController.loginView').as('login')
Route.post('/admin/auth/login', 'UserController.login').validator('LoginUser')


Route.get('/admin/auth/secret', 'UserController.secretView')
Route.post('/admin/auth/secret', 'UserController.secret')

Route.get('/admin/auth/superuser', 'UserController.superUser')
Route.post('/admin/auth/superuser', 'UserController.createSuperUser').validator('CreateUser')


Route.group(() => {
    Route.get('/dashboard', 'AdminController.dashboard').as('dash')

    Route.get('/orders/:menu?', 'OrderController.adminIndex').as('orders')
    Route.get('/orders/:menu?', 'OrderController.adminSelect').as('orders')
    Route.get('/order/view/:id', 'OrderController.adminView').as('viewOrder')
    Route.get('/order/delete/:id', 'OrderController.adminDelete').as('deleteOrder')

    Route.get('/categories', 'CategoryController.adminIndex').as('categories')
    Route.post('/categories', 'CategoryController.adminAdd').as('categories').validator('CategoryCreate')
    Route.post('/categories/select', 'CategoryController.adminSelect').as('categoriesSelect')
    
    Route.get('/category/update/:id', 'CategoryController.adminUpdateView').as('updateCategory')
    Route.post('/category/update/:id', 'CategoryController.adminUpdate').as('updateCategory')
         .validator('CategoryCreate')
    Route.get('/category/delete/:id', 'CategoryController.adminDelete').as('categoryDelete')

    Route.get('/products', ({response}) => {
        response.route('products', {code: 'all'})
    })
    Route.post('/products/addStore', 'ProductController.adminAddProductsStore').as('productsAddStore')
    Route.get('/products/:code?', 'ProductController.adminView').as('products')
    Route.post('/products/:code?', 'ProductController.adminSelect').as('products')
    
    Route.get('/product/add', 'ProductController.adminAddView' ).as('addProduct')
    Route.post('/product/add', 'ProductController.adminAdd').validator('ProductCreate')
    Route.get('/product/update/:id', 'ProductController.adminUpdateView').as('updateProduct')
    Route.post('/product/update/:id', 'ProductController.adminUpdate').as('updateProduct')
            .validator('ProductCreate')
    Route.get('/product/delete/:id', 'ProductController.adminDelete').as('deleteProduct')
    Route.post('/product/image/update/:id', 'ProductController.adminUploadImage').as('uploadProductImage')
    Route.get('/product/image/remove/:id', 'ProductController.adminRemoveImage').as('removeProductImage')
    Route.get('/product/putStore/:id', 'ProductController.onStore').as('onStore')
    Route.get('/product/removeStore/:id', 'ProductController.offStore').as('offStore')


    Route.get('/zones', 'ZoneController.index').as('zones')

    Route.get('/zones/cities', 'CityController.adminCitiesView').as('cities')
    Route.post('/zones/cities', 'CityController.adminSelect')

    Route.post('/zones/city/add', 'CityController.adminAddCity').as('adminAddCity').validator('CityCreate')
    Route.get('/zones/city/update/:id', 'CityController.adminUpdateCityView').as('adminUpdateCity')
    Route.post('/zones/city/update/:id', 'CityController.adminUpdateCity').as('adminUpdateCity')
            .validator('CityCreate')
    Route.get('/zones/city/delete/:id', 'CityController.adminDeleteCity').as('adminDeleteCity')

            
    Route.get('/zones/districts', 'DistrictController.adminDistrictsView').as('adminDistricts')
    Route.post('/zones/districts', 'DistrictController.adminAddDistrict').as('adminDistricts')
            .validator('DistrictCreate')
    Route.post('/zones/districts/select', 'DistrictController.adminSelect').as('adminSelectDistricts')

    Route.post('/zones/district/add', 'DistrictController.adminAddDistrict').as('adminAddDistrict')
            .validator('DistrictCreate')
    Route.get('/zones/district/update/:id', 'DistrictController.adminUpdateDistrictView')
            .as('adminUpdateDistrict')
    Route.post('/zones/district/update/:id', 'DistrictController.adminUpdateDistrict')
            .as('adminUpdateDistrict').validator('DistrictCreate')
    Route.get('/zones/district/delete/:id', 'DistrictController.adminDeleteDistrict').as('adminDeleteDistrict')


    Route.get('/zones/delivery-prices', 'DeliveryPriceController.adminDeliveryPricesView')
            .as('adminDeliveryPrices')
    Route.post('/zones/delivery-prices', 'DeliveryPriceController.adminSelect').as('adminDeliveryPrices')
    
    Route.get('/zones/delivery-price/add', 'DeliveryPriceController.adminAddDeliveryPriceView')
            .as('adminAddDeliveryPrice')
    Route.post('/zones/delivery-price/add', 'DeliveryPriceController.adminAddDeliveryPrice')
            .as('adminAddDeliveryPrice').validator('DeliveryPriceForm')
    Route.post('/zones/delivery-price/update/:id', 'DeliveryPriceController.adminUpdateDeliveryPrice')
            .as('adminUpdateDeliveryPrice').validator('DeliveryPriceForm')
    Route.get('zones/delivery-price/delete/:id', 'DeliveryPriceController.adminDeleteDeliveryPrice')
                .as('adminDeleteDeliveryPrice')
        

    Route.get('/auth/logout', async({ auth, response }) =>{
        await auth.logout();
        return response.redirect('/admin/auth/login')
    })

}).prefix('/admin').middleware('auth')



