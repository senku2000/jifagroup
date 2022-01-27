'use strict'

class AdminController {
    async dashboard({ view }){
        return view.render('/admin/dashboard', {
            sideMenu: 'dashboard'
        })
    }
    
}

module.exports = AdminController
