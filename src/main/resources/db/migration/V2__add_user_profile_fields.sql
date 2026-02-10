ALTER TABLE users
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(60),
  ADD COLUMN IF NOT EXISTS last_name  VARCHAR(60),
  ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500);

-- Eski kayıtlar boş kalmasın
UPDATE users SET first_name = 'User' WHERE first_name IS NULL;
UPDATE users SET last_name  = 'User' WHERE last_name  IS NULL;

ALTER TABLE users
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name  SET NOT NULL;
