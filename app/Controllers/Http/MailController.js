'use strict'

const Mails = use('App/Models/Mail')

class MailController {

    async sendMail({ request, response, session }) {
        let data = request.all()
        
        let mail = Mails.create({
            senderName: data.name,
            senderEmail: data.email,
            message: data.message
        })
        
        session.flash({
            alert: `<span >Votre message a bien ete envoyer</span>`
        })
        return response.route('home')
        
    }
}

module.exports = MailController
