'use strict'

class DistrictCreate {
  get rules () {
    return {
      'name': 'required',
      'city_id': 'required'
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

module.exports = DistrictCreate
