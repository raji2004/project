/*
  # Add default departments

  1. Changes
    - Insert default academic departments
      - Software Engineering
      - Computer Science
      - Information Technology
      - Data Science
      - Cybersecurity
      - Artificial Intelligence
*/

INSERT INTO departments (code, name)
VALUES
  ('SWE', 'Software Engineering'),
  ('CS', 'Computer Science'),
  ('IT', 'Information Technology'),
  ('DS', 'Data Science'),
  ('CYB', 'Cybersecurity'),
  ('AI', 'Artificial Intelligence')
ON CONFLICT (code) DO NOTHING;