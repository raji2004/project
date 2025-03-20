/*
  # Add sample lecture resources

  1. Changes
    - Insert sample lecture resources for each department
    - Include a mix of PDFs, videos, and links
*/

-- Add sample resources for Software Engineering
INSERT INTO lecture_resources (department_id, title, description, url, type)
SELECT 
  d.id,
  'Introduction to Software Design Patterns',
  'Learn about essential design patterns in software engineering',
  'https://example.com/swe-patterns.pdf',
  'pdf'
FROM departments d WHERE d.code = 'SWE'
UNION ALL
SELECT 
  d.id,
  'Clean Code Principles',
  'Video lecture on writing maintainable code',
  'https://example.com/clean-code',
  'video'
FROM departments d WHERE d.code = 'SWE';

-- Add sample resources for Computer Science
INSERT INTO lecture_resources (department_id, title, description, url, type)
SELECT 
  d.id,
  'Data Structures and Algorithms',
  'Comprehensive guide to fundamental CS concepts',
  'https://example.com/dsa.pdf',
  'pdf'
FROM departments d WHERE d.code = 'CS'
UNION ALL
SELECT 
  d.id,
  'Operating Systems Architecture',
  'Deep dive into OS concepts',
  'https://example.com/os-video',
  'video'
FROM departments d WHERE d.code = 'CS';

-- Add sample resources for Data Science
INSERT INTO lecture_resources (department_id, title, description, url, type)
SELECT 
  d.id,
  'Machine Learning Fundamentals',
  'Introduction to ML concepts and applications',
  'https://example.com/ml-basics',
  'link'
FROM departments d WHERE d.code = 'DS'
UNION ALL
SELECT 
  d.id,
  'Statistical Analysis in Python',
  'Hands-on tutorial for data analysis',
  'https://example.com/stats-python',
  'video'
FROM departments d WHERE d.code = 'DS';