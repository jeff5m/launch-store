CREATE TABLE "products" (
	"id" SERIAL PRIMARY KEY,
  "category_id" INT NOT NULL,
  "user_id" INT,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "old_price" INT,
  "price" INT NOT NULL,
  "quantity" INT DEFAULT 0,
  "status" INT DEFAULT 1,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "categories" (
	"id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL
);

INSERT INTO categories(name) VALUES ('comida'), ('eletrônicos'), ('automóveis');

CREATE TABLE "files" (
	"id" SERIAL PRIMARY KEY,
  "name" TEXT,
  "path" TEXT NOT NULL,
  "product_id" INT
);

ALTER TABLE "products" ADD FOREIGN KEY ("category_id") REFERENCES "categories"("id");
ALTER TABLE "files" ADD FOREIGN KEY ("product_id") REFERENCES "products"("id");

CREATE TABLE "users" (
	"id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "cpf_cnpj" INT UNIQUE NOT NULL,
  "cep" TEXT,
  "address" TEXT,
  "created_at" TIMESTAMP DEFAULT (now()),
  "updated_at" TIMESTAMP DEFAULT (now())
);

CREATE EXTENSION pgcrypto;

ALTER TABLE "products" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id");

-- procedure to get current date when update
CREATE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- trigger to procedure
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

