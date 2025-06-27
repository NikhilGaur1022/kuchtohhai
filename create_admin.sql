-- First, sign up a new user through the application with these credentials:
-- Email: admin@dentalreach.com
-- Password: Choose a strong password

-- Then run these SQL commands to make them an admin:
UPDATE profiles
SET role = 'admin'
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'admin@dentalreach.com'
); 