'use strict'

class ProductCreate {
  get rules () {
    return {
      'name': 'required',
      'description': 'required',
      'price': 'required',
      'quantity': 'required'
    }
  }

  get messages() {
    return{
      'required': '{{ field }} is required !',
    }
  }

  async fails(error){
    this.ctx.session.withErrors(error).flashAll();
    
    return this.ctx.response.redirect('back');
  }
}

module.exports = ProductCreate
