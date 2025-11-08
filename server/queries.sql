use tazekuru_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ad VARCHAR(50),
  email VARCHAR(100) UNIQUE,
  sifre VARCHAR(255)
);



