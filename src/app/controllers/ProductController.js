const { formatPrice, date } = require('../../lib/utils')
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

		return res.redirect(`/products/${productId}/edit`)
		
	},
	async	show(req,res) {

		let results = await Product.find(req.params.id)
		const product = results.rows[0]

		if (!product) 
			return res.send('Product not found!')

		const { day, hour, minutes, month } = date(product.updated_at)
		
		product.published = {
			day: `${day}/${month}`,
			hour: `${hour}h${minutes}min`
		}

		product.old_price = formatPrice(product.old_price)
		product.price = formatPrice(product.price)

		results = await Product.files(product.id)
		const files = results.rows.map(file => ({
			...file,
			src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
		}))
	
		return res.render('products/show', { product, files })
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

		results = await Product.files(product.id)
		let files = results.rows
		files = files.map(file => ({
			...file,
			src: `${req.protocol}://${req.headers.host}${file.path.replace('public','')}`
		}))   // put return of arrow function between () to return an object

		return res.render('products/edit.njk', { product, categories, files })
	},
	async put(req, res) {
		const keys = Object.keys(req.body)

		for (let key of keys) {
			if (req.body[key] == '' && key != 'removed_files')
				return res.send('Please, fill all the fields!')
		}

		if (req.files.length != 0) {
			const newFilesPromise = req.files.map(file => 
				File.create({...file, product_id: req.body.id}))

			await Promise.all(newFilesPromise)
		}

		if (req.body.removed_files) {
			const removedFiles = req.body.removed_files.split(",")
			const lastIndex = removedFiles.length - 1
			removedFiles.splice(lastIndex, 1)

			const removedFilesPromise = removedFiles.map(id => File.delete(id))

			await Promise.all(removedFilesPromise)
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

		return res.redirect(`/products/${req.body.id}`)
	},
	async delete(req, res) {
		await	Product.delete(req.body.id)

		return res.redirect(`/products/create`)
	}
}