'use strict'

const User = use('App/Models/User')

class UserController {
    
    async loginView({ response, view }){
        const users = (await User.all()).toJSON()

        if(users.length > 0){
            return view.render('/admin/auth/login')
        }else{
            return response.redirect('/admin/auth/secret')
        }

    }

    async login({ request, auth, response, session }){
        const { email, password } = request.all()

        try {
            await auth.attempt(email, password)
            return response.redirect('/admin/dashboard')
        } catch (error) {
            session.flash({ loginError: 'These credentials do not work.'})
            return response.redirect('/admin/auth/login')
            
        }
        
    }

    
    async secretView({ response, view }){
        const users = (await User.all()).toJSON()

        if(users.length > 0){
            return response.redirect('/home')

        }else{
            return view.render('admin/auth/secret')
        }

    }


    async secret({ request, response}){
        const users = (await User.all()).toJSON()
        const { password } = request.all()

        if(users.length > 0){
            return response.redirect('/home')
            
        }else{
            if(password === 'jifa5456'){
                return response.redirect('/admin/auth/superuser')
            }else{
                return response.redirect('/admin/auth/secret')
            }        
        }

    }


    async superUser({ response, view }){
        const users = (await User.all()).toJSON()

        if(users.length > 0){
            return response.redirect('/')
        }else{
            return view.render('admin/auth/superuser')
        }

    }


    async createSuperUser({ request, response, }){
        const users = (await User.all()).toJSON()

        if(users.length > 0){
            return response.redirect('/')

        }else{
            const user = await User.create(request.only(['username', 'email', 'password']))
            user.is_staff = true
            await user.save()

            return response.redirect('/admin/auth/login')
        }
        
    }
}

module.exports = UserController
