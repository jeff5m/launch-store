const User = require('../models/User')

module.exports = {
  registerForm(req, res) {
    return res.render("user/register")
  },
  async post(req, res) {

    const keys = Object.keys(req.body)

    return console.log(req.body)

    for (key of keys) {
      if (req.body[key] == '') {
        return res.send('Please, fill all the fields')
      }
    }

    // check if user exists
    let { email, cpf_cnpj, password, passwordRepeat} = req.body
    
    cpf_cnpj = cpf_cnpj.replace(/\D/g, '')

    const user = await User.findOne({ where: {email}, or: {cpf_cnpj}})

    if(user) {
      return res.send('User already exists')
    }

    if (password != passwordRepeat) {
      return res.send('Passwords are not the same! Try again')
    }

    return res.send('passed!!')
  }
}
