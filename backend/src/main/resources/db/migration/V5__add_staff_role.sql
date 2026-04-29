-- V5__add_staff_role.sql

-- This is a sample script to promote a user to STAFF.
-- In a real application, this would be done via an admin panel.

UPDATE users 
SET role = 'STAFF' 
WHERE email = 'admin@livepass.com';
