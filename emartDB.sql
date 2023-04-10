-- CREATE DATABASE

CREATE DATABASE emart;

-- CREATE TYPES

CREATE TYPE role AS ENUM('User','Seller','Admin');
CREATE TYPE is_active AS ENUM('True','False');
CREATE TYPE track_order AS ENUM('In Process','Placed','Shipped','Delivered','Cancelled');
CREATE TYPE pay_method AS ENUM('Cash On Delivery','Online');
CREATE TYPE pay_status AS ENUM('Success','In Progress','Failed');

-- CREATE USER TABLE

CREATE TABLE users (user_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
full_name VARCHAR(255) NOT NULL, 
email TEXT NOT NULL UNIQUE CHECK(email ~* '^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$'), 
pwd TEXT NOT NULL, 
role role DEFAULT 'User' NOT NULL, 
user_status is_active DEFAULT 'True', 
created_by VARCHAR(255) NOT NULL, 
created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
updated_by VARCHAR(255) NOT NULL, 
updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL);

-- Create a function that updates the updated_on column of a table

CREATE OR REPLACE FUNCTION update_updated_on_tables()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_on = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger on the users table that calls the update_updated_on_tables() function whenever an update occurs

CREATE TRIGGER update_users_updated_on
    BEFORE UPDATE
    ON  users
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_on_tables();

-- CREATE ADDRESS TABLE

CREATE TABLE addresses (address_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
user_id INT, 
apartment TEXT NOT NULL,
street TEXT NOT NULL,
landmark TEXT NOT NULL, 
city TEXT NOT NULL,
state TEXT NOT NULL, 
pin_code VARCHAR(255) NOT NULL,
address_type TEXT NOT NULL,
CONSTRAINT user_id FOREIGN KEY(user_id) REFERENCES users(user_id),
created_by VARCHAR(255) NOT NULL, 
created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
updated_by VARCHAR(255) NOT NULL, 
updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL);

-- Create a trigger on the addresses table that calls the update_updated_on_tables() function whenever an update occurs

CREATE TRIGGER update_addresses_updated_on
    BEFORE UPDATE
    ON  addresses
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_on_tables();

-- CREATE PRODUCTS TABLE

CREATE TABLE products (product_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
user_id int, 
product_name VARCHAR(255) NOT NULL,
descriptions TEXT NOT NULL,
price DECIMAL NOT NULL, 
product_qty BIGINT NOT NULL,
picture TEXT NOT NULL,
CONSTRAINT user_id FOREIGN KEY(user_id) REFERENCES users(user_id)
created_by VARCHAR(255) NOT NULL, 
created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
updated_by VARCHAR(255) NOT NULL, 
updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL);

-- Create a trigger on the products table that calls the update_updated_on_tables() function whenever an update occurs

CREATE TRIGGER update_products_updated_on
    BEFORE UPDATE
    ON  products
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_on_tables();

-- CREATE ORDERS TABLE

CREATE TABLE orders (order_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
user_id int,
CONSTRAINT user_id FOREIGN KEY(user_id) REFERENCES users(user_id),
created_by VARCHAR(255) NOT NULL, 
created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
updated_by VARCHAR(255) NOT NULL, 
updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL);

-- Create a trigger on the orders table that calls the update_updated_on_tables() function whenever an update occurs

CREATE TRIGGER update_orders_updated_on
    BEFORE UPDATE
    ON  orders
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_on_tables();

-- CREATE order_details TABLE

CREATE TABLE order_details (order_details_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
order_id int,
address_id int,
product_id int,
CONSTRAINT order_id FOREIGN KEY(order_id) REFERENCES orders(order_id),
CONSTRAINT address_id FOREIGN KEY(address_id) REFERENCES addresses(address_id),
CONSTRAINT product_id FOREIGN KEY(product_id) REFERENCES products(product_id),
ordered_qty INT NOT NULL,
unit_price DECIMAL NOT NULL,
order_status track_order DEFAULT 'In Process',
created_by VARCHAR(255) NOT NULL, 
created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
updated_by VARCHAR(255) NOT NULL, 
updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL);

-- Create a trigger on the order_details table that calls the update_updated_on_tables() function whenever an update occurs

CREATE TRIGGER update_order_details_updated_on
    BEFORE UPDATE
    ON  order_details
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_on_tables();

-- CREATE CARTS TABLE

CREATE TABLE carts (cart_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
user_id int,
CONSTRAINT user_id FOREIGN KEY(user_id) REFERENCES users(user_id),
created_by VARCHAR(255) NOT NULL, 
created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
updated_by VARCHAR(255) NOT NULL, 
updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL);

-- Create a trigger on the carts table that calls the update_updated_on_tables() function whenever an update occurs

CREATE TRIGGER update_carts_updated_on
    BEFORE UPDATE
    ON  carts
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_on_tables();

-- CREATE cart_details TABLE

CREATE TABLE cart_details (cart_details_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
cart_id int,
product_id int,
CONSTRAINT cart_id FOREIGN KEY(cart_id) REFERENCES carts(cart_id),
CONSTRAINT product_id FOREIGN KEY(product_id) REFERENCES products(product_id),
cart_product_qty INT NOT NULL,
unit_price DECIMAL NOT NULL,
created_by VARCHAR(255) NOT NULL,
created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
updated_by VARCHAR(255) NOT NULL,
updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL);

-- Create a trigger on the cart_details table that calls the update_updated_on_tables() function whenever an update occurs

CREATE TRIGGER update_cart_details_updated_on
    BEFORE UPDATE
    ON  cart_details
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_on_tables();

-- CREATE payment TABLE

CREATE TABLE payment (payment_id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
order_id int,
CONSTRAINT order_id FOREIGN KEY(order_id) REFERENCES orders(order_id),
payment_method pay_method DEFAULT 'Cash On Delivery',
total_amount DECIMAL NOT NULL,
payment_status pay_status DEFAULT 'In Progress',
created_by VARCHAR(255) NOT NULL, 
created_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
updated_by VARCHAR(255) NOT NULL, 
updated_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL);

-- Create a trigger on the payment table that calls the update_updated_on_tables() function whenever an update occurs

CREATE TRIGGER update_payment_updated_on
    BEFORE UPDATE
    ON  payment
    FOR EACH ROW
EXECUTE PROCEDURE update_updated_on_tables();