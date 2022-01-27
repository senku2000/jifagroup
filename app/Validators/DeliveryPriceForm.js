'use strict'

class DeliveryPriceForm {
  get rules () {
    return {
      'city': 'required',
      'district': 'required',
      'price': 'required'
    }
  }

  get messages(){
    return {
      'required': '{{ field }} is required !',
    }
  }

  async fails(error){
    this.ctx.session.withErrors(error).flashAll();
    return this.ctx.response.redirect('back');
  }
}

module.exports = DeliveryPriceForm
