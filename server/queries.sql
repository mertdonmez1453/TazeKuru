USE tazekuru_db;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255),
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone_number BIGINT,
  email VARCHAR(100),
  registration_date DATE,
  rating FLOAT,
  loyalty_points FLOAT
);


CREATE TABLE address (
    address_id      INT PRIMARY KEY,
    user_id         INT,
    city            VARCHAR(100),
    street          VARCHAR(100),
    neighbourhood   VARCHAR(100),
    description     VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE product (
    product_id      INT PRIMARY KEY,
    seller_id       INT,
    name            VARCHAR(150),
    description     TEXT,
    price           DECIMAL(10,2),
    upload_date     DATE,
    photo           VARCHAR(255),
    quantity        INT,
    is_available    BOOLEAN,
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
);

CREATE TABLE cart (
    cart_id         INT PRIMARY KEY,
    buyer_id        INT,
    created_at      DATE,
    total_amount    DECIMAL(10,2),
    FOREIGN KEY (buyer_id) REFERENCES users(user_id)
);


CREATE TABLE orders (
    order_id        INT PRIMARY KEY,
    buyer_id        INT,
    seller_id       INT,
    order_date      DATE,
    total_price     DECIMAL(10,2),
    status          VARCHAR(50),
    delivery_time   DATE,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id),
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
);

CREATE TABLE payment (
    payment_id      INT PRIMARY KEY,
    order_id        INT,
    user_id         INT,
    method          VARCHAR(50),
    payment_date    DATE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE review (
    review_id       INT PRIMARY KEY,
    order_id        INT,
    product_id      INT,
    buyer_id        INT,
    rating          FLOAT,
    comment         TEXT,
    review_date     DATE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id),
    FOREIGN KEY (buyer_id) REFERENCES users(user_id)
);

