const { formatPrice } = require('../../lib/utils')
const Category = require('../models/Category')
const Product = require('../models/Product')
const File = require('../models/File')

module.exports = {
  create(req, res) {
    Category.all().then((results) => {
      const categories = results.rows
  
    	return res.render('products/create.njk', { categories })

    }).catch((err) => {
      throw new Error(err)
    })
	},
	
  async post(req, res) {

    const keys = Object.keys(req.body)

		for (let key of keys) {
			if (req.body[key] == '') {
				return res.send('Please, fill all the fields!');
			}
		}
		
		if (req.files.length == 0) {
			return res.send('Please, send at least one image')
		}	
		
		req.body.price = req.body.price.replace(/\D/g, '')
		
		const values = [
			req.body.category_id,
			req.body.user_id || 1,
			req.body.name,
			req.body.description,
			req.body.old_price || req.body.price,
			req.body.price,
			req.body.quantity,
			req.body.status || 1,
    ]
  
  	let results = await Product.create(values)
		const productId = results.rows[0].id

		const filesPromise = req.files.map(file => File.create({...file, product_id: productId}))

		await Promise.all(filesPromise)

		return res.redirect(`/products/${productId}`)
		
	},
	async edit(req, res) {
		let results = await Product.find(req.params.id)

		const product = results.rows[0]		

		if (!product) 
			return res.send('Product not found')

		product.old_price = formatPrice(product.old_price)
		product.price = formatPrice(product.price)

		results = await Category.all()
		const categories = results.rows

		return res.render('products/edit.njk', { product, categories })
	},
	async put(req, res) {
		const keys = Object.keys(req.body)

		for (let key of keys) {
			if (req.body[key] == '')
				return res.send('Please, fill all the fields!')
		}

		req.body.price = req.body.price.replace(/\D/g,'')

		if (req.body.old_price != req.body.price) {
			const oldProductPrice = await Product.find(req.body.id)

			req.body.old_price = oldProductPrice.rows[0].price
		}

		const values = [
			req.body.category_id ,
			req.body.user_id || 1,
			req.body.name,
			req.body.description,
			req.body.old_price || req.body.price,
			req.body.price,
			req.body.quantity,
			req.body.status || 1,
			req.body.id
    ]

		await Product.update(values)

		return res.redirect(`/products/${req.body.id}/edit`)
	},
	async delete(req, res) {
		await	Product.delete(req.body.id)

		return res.redirect(`/products/create`)
	}
}