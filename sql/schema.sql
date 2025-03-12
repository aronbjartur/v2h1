DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS categories;

-- notendur
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  admin BOOLEAN DEFAULT false,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP
);

--reikningar, þannig fólk geymt á mismundandi reikningum
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  account_name VARCHAR(100) NOT NULL,
  balance NUMERIC(12,2) DEFAULT 0,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--flokarnir, tegund inngjalda og útgjalda
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL -- eins og matvörur, húsnæði, skólar, bílar eða ehv þannig
);

--greiðslumáti, penignar eða credit kort eða debit
CREATE TABLE IF NOT EXISTS payment_methods (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL
);

--færslurnar, inngjöldin og útgjöldin
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  payment_method_id INTEGER REFERENCES payment_methods(id),
  transaction_type VARCHAR(50) NOT NULL, -- inn og utgjöld
  category VARCHAR(50) NOT NULL references categories(name), -- eins og matvörur, húsnæði, skólar, bílar eða ehv þannig
  amount NUMERIC(10,2) NOT NULL,
  description TEXT
);


--mánaðar takmark annig eyðsla er ekki of mikil
CREATE TABLE IF NOT EXISTS budgets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL REFERENCES categories(name),
  monthly_limit NUMERIC(10,2) NOT NULL,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

