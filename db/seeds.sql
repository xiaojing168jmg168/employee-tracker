INSERT INTO departments(department_name)
VALUES ('Engineering'),
       ('Finance'),
       ('Legal'),
       ('Sales');

INSERT INTO roles(title, salary, department_id)
VALUES('Lead Engineer', 1500000, 1),
('Software Engineer', 120000, 1),
('Account Manager', 160000, 2),
('Accountant', 125000, 2),
('Legal Team Lead', 250000, 3),
('Lawyer', 190000, 3),
('Sales Lead', 100000, 4),
('Salesperson', 80000, 4);

INSERT INTO employees(first_name, last_name, role_id, manager_id)
VALUES('John', 'Doe', 1, NULL),
('Mike', 'Chan', 2, 1),
('Bily', 'Greene', 3, NULL),
('Ashley', 'Cirillo', 4, 3),
('Kevin', 'Tupik', 5, Null),
('Samra', 'Till', 6, 5),
('Kunal', 'Brown', 7, NULL),
('Sarah', 'Lourd', 8, 7);
