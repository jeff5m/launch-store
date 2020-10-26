const express = require('express')
const routes = express.Router()

const HomeController = require('../app/controllers/HomeController')

const products = require('./products')
const users = require('./users')

routes.get('/', HomeController.index)

routes.use('/products', products)
routes.use('/users', users)

routes.get('/ads/create', (req,res) => {
  return res.redirect('/products/create')
})

module.exports = routes
