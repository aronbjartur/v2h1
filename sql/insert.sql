-- GBT GRunnur þannig við erum með að minnsta lagi 50 færslur í töflum.
-- 'admin' með passwordið 'password123'.

--------------------------------------------------
-- Inntak í töflur: users, accounts, categories,
-- payment_methods, transactions og budgets.
--------------------------------------------------

-- Users (3 notendur)
INSERT INTO users (username, email, password, admin)
VALUES 
  ('admin', 'admin@example.com', 'password123', true),
  ('jonas', 'jonas@example.com', 'laungis123', false),
  ('katrin', 'katrin@example.com', 'draumur456', false);

-- Accounts (reikningar, 1 á notanda)
INSERT INTO accounts (user_id, account_name, balance)
VALUES
  (1, 'Aðalreikningur', 5000.00),
  (2, 'Jónas reikningur', 2500.00),
  (3, 'Katríns reikningur', 3000.00);

-- Categories (6 flokkar)
INSERT INTO categories (name)
VALUES
  ('matur'),
  ('íbúð'),
  ('samgöngur'),
  ('afþreying'),
  ('laun'),
  ('annar');

-- Payment methods (3 greiðslumáti)
INSERT INTO payment_methods (name)
VALUES
  ('reiðufé'),
  ('kreditkort'),
  ('bankamillifærsla');

-- Transactions fyrir admin (notandi 1, reikningur 1) – 10 færslur
INSERT INTO transactions (account_id, user_id, payment_method_id, transaction_type, category, amount, description)
VALUES
  (1, 1, 1, 'income', 'laun', 6000.00, 'Laun fyrir mánuðinn'),
  (1, 1, 2, 'expense', 'matur', 150.00, 'Morgunmatur'),
  (1, 1, 3, 'expense', 'samgöngur', 50.00, 'Strætó miða'),
  (1, 1, 1, 'expense', 'íbúð', 1200.00, 'Leiga'),
  (1, 1, 2, 'expense', 'afþreying', 200.00, 'Kvöldbíó'),
  (1, 1, 3, 'expense', 'annar', 100.00, 'Óvænt útgjöld'),
  (1, 1, 1, 'income', 'laun', 300.00, 'Bonus'),
  (1, 1, 2, 'expense', 'matur', 100.00, 'Næturmatur'),
  (1, 1, 3, 'expense', 'samgöngur', 75.00, 'Taksi'),
  (1, 1, 1, 'expense', 'íbúð', 1150.00, 'Heildar leiga');

-- Transactions fyrir Jónas (notandi 2, reikningur 2) – 10 færslur
INSERT INTO transactions (account_id, user_id, payment_method_id, transaction_type, category, amount, description)
VALUES
  (2, 2, 1, 'income', 'laun', 4000.00, 'Laun'),
  (2, 2, 2, 'expense', 'matur', 120.00, 'Frokostur'),
  (2, 2, 3, 'expense', 'samgöngur', 40.00, 'Taksi'),
  (2, 2, 1, 'expense', 'íbúð', 900.00, 'Leiga'),
  (2, 2, 2, 'expense', 'afþreying', 180.00, 'Veisla'),
  (2, 2, 3, 'expense', 'annar', 80.00, 'Annað'),
  (2, 2, 1, 'income', 'laun', 200.00, 'Viðbót'),
  (2, 2, 2, 'expense', 'matur', 90.00, 'Kvöldmatur'),
  (2, 2, 3, 'expense', 'samgöngur', 55.00, 'Strætó'),
  (2, 2, 1, 'expense', 'íbúð', 950.00, 'Leiga');

-- Transactions fyrir Katrín (notandi 3, reikningur 3) – 10 færslur
INSERT INTO transactions (account_id, user_id, payment_method_id, transaction_type, category, amount, description)
VALUES
  (3, 3, 1, 'income', 'laun', 5000.00, 'Laun'),
  (3, 3, 2, 'expense', 'matur', 130.00, 'Morgunmatur'),
  (3, 3, 3, 'expense', 'samgöngur', 60.00, 'Strætó'),
  (3, 3, 1, 'expense', 'íbúð', 1100.00, 'Leiga'),
  (3, 3, 2, 'expense', 'afþreying', 150.00, 'Kvöldforrit'),
  (3, 3, 3, 'expense', 'annar', 70.00, 'Annað'),
  (3, 3, 1, 'income', 'laun', 250.00, 'Viðbót'),
  (3, 3, 2, 'expense', 'matur', 95.00, 'Hádegismatur'),
  (3, 3, 3, 'expense', 'samgöngur', 45.00, 'Taksi'),
  (3, 3, 1, 'expense', 'íbúð', 1050.00, 'Leiga');

-- Budgets (2 færslur á notanda, samtals 6 færslur)
INSERT INTO budgets (user_id, category, monthly_limit)
VALUES
  (1, 'matur', 400.00),
  (1, 'íbúð', 1300.00),
  (2, 'matur', 350.00),
  (2, 'samgöngur', 150.00),
  (3, 'matur', 450.00),
  (3, 'íbúð', 1200.00);