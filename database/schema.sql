USE smart_parking_shop;

-- ============================================================
-- RESET DATABASE
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS parking_bookings;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS parking_slots;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;


-- ============================================================
-- 1. USERS
-- ============================================================

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,

    phone VARCHAR(20) UNIQUE,

    password VARCHAR(255) NOT NULL,

    role VARCHAR(20) DEFAULT 'USER',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 2. VEHICLES
-- ============================================================

CREATE TABLE vehicles (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    vehicle_number VARCHAR(30) UNIQUE NOT NULL,

    vehicle_type VARCHAR(30),

    vehicle_model VARCHAR(100),

    vehicle_color VARCHAR(30),

    vehicle_size VARCHAR(20),

    CONSTRAINT fk_vehicle_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ============================================================
-- 3. PARKING SLOTS
-- ============================================================

CREATE TABLE parking_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,

    slot_number VARCHAR(20) UNIQUE NOT NULL,

    floor VARCHAR(20),

    section VARCHAR(20),

    slot_size VARCHAR(20) NOT NULL,

    vehicle_type VARCHAR(30),

    price_per_hour DECIMAL(10,2),

    status VARCHAR(20) DEFAULT 'AVAILABLE',

    latitude DECIMAL(10,7),

    longitude DECIMAL(10,7)
);


-- ============================================================
-- 4. PARKING BOOKINGS
-- ============================================================

CREATE TABLE parking_bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    vehicle_id INT NOT NULL,

    slot_id INT NOT NULL,

    booking_date DATE NOT NULL,

    entry_time DATETIME,

    exit_time DATETIME,

    duration_hours DECIMAL(8,2),

    amount DECIMAL(10,2),

    status VARCHAR(30) DEFAULT 'BOOKED',

    CONSTRAINT fk_booking_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),

    CONSTRAINT fk_booking_vehicle
        FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(id),

    CONSTRAINT fk_booking_slot
        FOREIGN KEY (slot_id)
        REFERENCES parking_slots(id)
);


-- ============================================================
-- 5. PAYMENTS
-- ============================================================

CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,

    booking_id INT NULL,

    order_id INT NULL,

    user_id INT NOT NULL,

    amount DECIMAL(10,2) NOT NULL,

    payment_method VARCHAR(30),

    payment_status VARCHAR(30),

    transaction_id VARCHAR(100) UNIQUE,

    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_booking
        FOREIGN KEY (booking_id)
        REFERENCES parking_bookings(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_payment_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);


-- ============================================================
-- 6. PRODUCTS
-- ============================================================

CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,

    name VARCHAR(150) NOT NULL,

    category VARCHAR(100),

    description TEXT,

    price DECIMAL(10,2) NOT NULL,

    stock INT DEFAULT 0,

    image VARCHAR(255),

    status VARCHAR(20) DEFAULT 'ACTIVE'
);


-- ============================================================
-- 7. CART
-- ============================================================

CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT NOT NULL DEFAULT 1,

    UNIQUE KEY uq_cart (user_id, product_id),

    CONSTRAINT fk_cart_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cart_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE
);


-- ============================================================
-- 8. ORDERS
-- ============================================================

CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,

    user_id INT NOT NULL,

    total_amount DECIMAL(10,2) NOT NULL,

    order_status VARCHAR(30) DEFAULT 'PLACED',

    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
);


-- ============================================================
-- 9. ORDER ITEMS
-- ============================================================

CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,

    order_id INT NOT NULL,

    product_id INT NOT NULL,

    quantity INT NOT NULL,

    price DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_order_item_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_item_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
);


-- ============================================================
-- 10. USERS DATA
-- ============================================================

INSERT INTO users (name, email, phone, password, role)
VALUES
('John Doe', 'john@example.com', '9876543210', '123456', 'USER'),
('Admin', 'admin@example.com', '9876543211', 'admin123', 'ADMIN'),
('Alice', 'alice@example.com', '9876543212', '123456', 'USER'),
('Bob', 'bob@example.com', '9876543213', '123456', 'USER'),
('Charlie', 'charlie@example.com', '9876543214', '123456', 'USER'),
('David', 'david@example.com', '9876543215', '123456', 'USER'),
('Emma', 'emma@example.com', '9876543216', '123456', 'USER'),
('Frank', 'frank@example.com', '9876543217', '123456', 'USER'),
('George', 'george@example.com', '9876543218', '123456', 'USER'),
('Henry', 'henry@example.com', '9876543219', '123456', 'USER'),
('POJAPPAN H', 'poochih642@gmail.com', '9876543220', '123456', 'USER'),
('SIVALINGAM N', 'sivalingam@example.com', '9876543221', '123456', 'USER');


-- ============================================================
-- 11. VEHICLES DATA
-- ============================================================

INSERT INTO vehicles
(user_id, vehicle_number, vehicle_type, vehicle_model, vehicle_color, vehicle_size)
VALUES

(1, 'TN09AB1234', 'Car', 'Hyundai i20', 'White', 'Medium'),

(2, 'TN07CD5678', 'Car', 'Honda City', 'Black', 'Medium'),

(3, 'TN10EF2468', 'Car', 'Maruti Swift', 'Red', 'Small'),

(4, 'TN11GH1357', 'Car', 'Tata Nexon', 'Blue', 'Medium'),

(5, 'TN12JK3690', 'SUV', 'Hyundai Creta', 'Grey', 'Large'),

(6, 'TN13LM4826', 'Car', 'Kia Seltos', 'White', 'Large'),

(7, 'TN14NP5739', 'Car', 'Toyota Glanza', 'Silver', 'Medium'),

(8, 'TN15QR6812', 'SUV', 'Mahindra XUV700', 'Black', 'Large'),

(9, 'TN16ST7943', 'Car', 'Volkswagen Polo', 'Blue', 'Small'),

(10, 'TN17UV8051', 'Electric Car', 'Tata Nexon EV', 'Green', 'Large'),

(11, 'TN38AB1234', 'Car', 'Hyundai i20', 'Blue', 'Medium'),

(12, 'TN38CD5678', 'Car', 'Maruti Swift', 'Red', 'Medium');


-- ============================================================
-- 12. PARKING SLOTS
-- ============================================================

INSERT INTO parking_slots
(
    slot_number,
    floor,
    section,
    slot_size,
    vehicle_type,
    price_per_hour,
    status,
    latitude,
    longitude
)
VALUES

(
    'A-01',
    'Ground',
    'A',
    'Small',
    'Car',
    30.00,
    'AVAILABLE',
    12.1931000,
    79.0835700
),

(
    'A-02',
    'Ground',
    'A',
    'Medium',
    'Car',
    40.00,
    'AVAILABLE',
    12.1931100,
    79.0835800
),

(
    'A-03',
    'Ground',
    'A',
    'Large',
    'SUV',
    50.00,
    'OCCUPIED',
    12.1931200,
    79.0835900
),

(
    'A-04',
    'Ground',
    'A',
    'Medium',
    'Car',
    40.00,
    'OCCUPIED',
    12.1931300,
    79.0836000
),

(
    'B-01',
    'Ground',
    'B',
    'Medium',
    'Car',
    40.00,
    'AVAILABLE',
    12.1931400,
    79.0836100
),

(
    'B-02',
    'Ground',
    'B',
    'Large',
    'SUV',
    50.00,
    'OCCUPIED',
    12.1931500,
    79.0836200
),

(
    'B-03',
    'Ground',
    'B',
    'Medium',
    'Electric Car',
    45.00,
    'AVAILABLE',
    12.1931600,
    79.0836300
),

(
    'C-01',
    'First',
    'C',
    'Medium',
    'Car',
    40.00,
    'AVAILABLE',
    12.1931700,
    79.0836400
),

(
    'C-02',
    'First',
    'C',
    'Large',
    'SUV',
    50.00,
    'AVAILABLE',
    12.1931800,
    79.0836500
),

(
    'D-01',
    'First',
    'D',
    'Medium',
    'Electric Car',
    45.00,
    'AVAILABLE',
    12.1931900,
    79.0836600
);


-- ============================================================
-- 13. PRODUCTS
-- ============================================================

INSERT INTO products
(name, category, description, price, stock, image, status)
VALUES

(
    'Premium Car Cover',
    'Car Accessories',
    'Water resistant premium car cover',
    899.00,
    20,
    'car-cover.jpg',
    'ACTIVE'
),

(
    'Car Vacuum Cleaner',
    'Car Accessories',
    'Portable rechargeable vacuum cleaner',
    1499.00,
    15,
    'car-vacuum.jpg',
    'ACTIVE'
),

(
    'Dashboard Camera',
    'Electronics',
    'Full HD car dash camera',
    2499.00,
    10,
    'dash-camera.jpg',
    'ACTIVE'
),

(
    'Digital Tyre Inflator',
    'Car Accessories',
    'Digital tyre inflator with pressure display',
    1299.00,
    25,
    'tyre-inflator.jpg',
    'ACTIVE'
),

(
    '360 Degree Mobile Holder',
    'Car Accessories',
    '360 degree dashboard mobile holder',
    499.00,
    40,
    'mobile-holder.jpg',
    'ACTIVE'
),

(
    'Car Air Purifier',
    'Electronics',
    'Compact USB car air purifier',
    1799.00,
    18,
    'air-purifier.jpg',
    'ACTIVE'
),

(
    'LED Interior Light',
    'Car Accessories',
    'Premium LED interior lighting kit',
    699.00,
    35,
    'led-light.jpg',
    'ACTIVE'
),

(
    'Bluetooth FM Transmitter',
    'Electronics',
    'Wireless Bluetooth FM transmitter',
    799.00,
    30,
    'fm-transmitter.jpg',
    'ACTIVE'
),

(
    'Car Cleaning Kit',
    'Car Care',
    'Complete car cleaning accessories kit',
    999.00,
    22,
    'cleaning-kit.jpg',
    'ACTIVE'
),

(
    'Emergency Car Tool Kit',
    'Safety',
    'Emergency roadside car tool kit',
    1599.00,
    12,
    'tool-kit.jpg',
    'ACTIVE'
);


-- ============================================================
-- 14. PARKING BOOKING DATA
-- ============================================================
-- Booking #1 -> Admin / User 10
-- Booking #2 -> User 10 additional demo booking
-- Booking #3 -> User 11
--
-- User 12 has a vehicle but no booking yet.
-- This allows testing "No Parking History" correctly.

INSERT INTO parking_bookings
(
    user_id,
    vehicle_id,
    slot_id,
    booking_date,
    entry_time,
    exit_time,
    duration_hours,
    amount,
    status
)
VALUES

(
    10,
    10,
    3,
    '2026-09-15',
    '2026-09-15 20:47:06',
    NULL,
    12.00,
    600.00,
    'ACTIVE'
),

(
    10,
    10,
    2,
    '2026-09-16',
    '2026-09-16 10:00:00',
    NULL,
    2.00,
    80.00,
    'ACTIVE'
),

(
    11,
    11,
    4,
    '2026-09-16',
    '2026-09-16 18:15:38',
    NULL,
    2.00,
    80.00,
    'ACTIVE'
);


-- ============================================================
-- 15. PAYMENT DEMO DATA
-- ============================================================

INSERT INTO payments
(
    booking_id,
    order_id,
    user_id,
    amount,
    payment_method,
    payment_status,
    transaction_id
)
VALUES

(
    1,
    NULL,
    10,
    600.00,
    'UPI',
    'SUCCESS',
    'TXN-DEMO-1001'
),

(
    3,
    NULL,
    11,
    80.00,
    'UPI',
    'SUCCESS',
    'TXN-DEMO-1101'
);


-- ============================================================
-- 16. FINAL STATUS UPDATE
-- ============================================================
-- A-03 -> Booking #1
-- A-04 -> Booking #3
-- A-02 -> Booking #2

UPDATE parking_slots
SET status = 'OCCUPIED'
WHERE slot_number IN ('A-02', 'A-03', 'A-04');


-- ============================================================
-- 17. VERIFY USERS
-- ============================================================

SELECT
    id,
    name,
    email,
    role
FROM users
ORDER BY id;


-- ============================================================
-- 18. VERIFY VEHICLES
-- ============================================================

SELECT
    id,
    user_id,
    vehicle_number,
    vehicle_type,
    vehicle_model,
    vehicle_color,
    vehicle_size
FROM vehicles
ORDER BY id;


-- ============================================================
-- 19. VERIFY PARKING SLOTS
-- ============================================================

SELECT
    id,
    slot_number,
    status,
    price_per_hour,
    latitude,
    longitude
FROM parking_slots
ORDER BY id;


-- ============================================================
-- 20. VERIFY BOOKINGS
-- ============================================================

SELECT
    id,
    user_id,
    vehicle_id,
    slot_id,
    booking_date,
    entry_time,
    exit_time,
    duration_hours,
    amount,
    status
FROM parking_bookings
ORDER BY id;


-- ============================================================
-- 21. VERIFY PAYMENTS
-- ============================================================

SELECT
    id,
    booking_id,
    user_id,
    amount,
    payment_method,
    payment_status,
    transaction_id
FROM payments
ORDER BY id;


-- ============================================================
-- 22. VERIFY PRODUCTS
-- ============================================================

SELECT
    id,
    name,
    category,
    price,
    stock,
    status
FROM products
ORDER BY id;


-- ============================================================
-- 23. SHOW TABLES
-- ============================================================

SHOW TABLES;


-- ============================================================
-- 24. VERIFY PARKING SLOT STRUCTURE
-- ============================================================

DESCRIBE parking_slots;


-- ============================================================
-- 25. VERIFY HISTORY DATA
-- ============================================================

SELECT
    b.id AS booking_id,
    b.user_id,
    u.name AS user_name,
    v.vehicle_number,
    v.vehicle_type,
    v.vehicle_model,
    p.slot_number,
    b.duration_hours,
    b.amount,
    b.status,
    b.booking_date,
    b.entry_time,
    b.exit_time
FROM parking_bookings b

JOIN users u
    ON b.user_id = u.id

JOIN vehicles v
    ON b.vehicle_id = v.id

JOIN parking_slots p
    ON b.slot_id = p.id

ORDER BY b.id;

Select * from users;