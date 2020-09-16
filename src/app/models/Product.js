const db = require('../../config/db')

module.exports = {
  create(values) {
    const query = `
    INSERT INTO products (
      category_id,
      user_id,
      name,
      description,
      old_price,
      price,
      quantity,
      status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `
    return db.query(query, values)
  }
}