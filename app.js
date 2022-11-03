import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();
import cTable from 'console.table';
import inquirer from 'inquirer';


//connect to mysql
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

init();
function init(){
  inquirer.prompt([
    {
    type:'list',
    name:'choices',
    message: 'What would like to do?',
    choices: ['View all departments',
            'View all roles',
            'View all employees',
            'Add a Department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Update employee managers',
            'View employee by manager',
            'View employee by department',  
            'Delete a department',
            'Delete a role',
            'Delet an employee',
            'View department budgets',
            'Quit']
    }
    ])
     .then((answers) =>{
if(answers.choices === "View all departments"){
getDepartments();
};

if(answers.choices === "View all roles"){
getRoles();
};

if(answers.choices === "View all employees"){
getEmployees();
};

if(answers.choices === "Add a Department"){
createDepartment();
};

if(answers.choices === "Add a role"){
createRole();
};

if(answers.choices === "Add an employee"){
createEmployee();
};

if(answers.choices === "Update an employee role"){
updateRole();
};

});


};



//get departments from mysql query
async function getDepartments(){
    const sql = `SELECT id AS id, department_name As name FROM departments`
    const result = await pool.query(sql);
    console.table(result[0]);
    init()
}

//get single department from mysql query 
async function getDepartment(id){
    const [rows] = await pool.query(`
    SELECT * 
    FROM departments
    WHERE id = ?
    `, [id])
    return rows[0];
}


//get roles from mysql query
async function getRoles(){
    const sql = `SELECT roles.id, roles.title,roles.salary, departments.department_name AS department
                  FROM roles
                  INNER JOIN departments ON roles.department_id = departments.id`;
    const result = await pool.query(sql);

    console.table(result[0]);
    init()
}

//get all employees from mysql query
async function getEmployees(){
    const sql = `SELECT employees.id, employees.first_name, employees.last_name,roles.title, departments.department_name AS department, roles.salary, CONCAT (manager.first_name, " ", manager.last_name) AS manager
                  FROM employees
                  LEFT JOIN roles ON employees.role_id = roles.id
                  LEFT JOIN departments on roles.department_id = departments.id
                  LEFT JOIN employees manager on employees.manager_id = manager.id
    `;
    const result = await pool.query(sql);

    console.table(result[0]);
    init()
}

//insert departmenet to departments
function createDepartment(){
    inquirer.prompt([
    {
    type: 'input',
    name:'addDept',
    message: 'What is the name of the department?',
    validate: addDept => {
            if (addDept) {
                return true;
            } else {
                console.log('Please enter a department');
                return false;
            }
    }
    }
    ])
    .then(answer => {
    const sql = `
    INSERT INTO departments (department_name)
    VALUES(?)
    `
    pool.query(sql,answer.addDept);
   console.log(`Successfully inserted ${answer.addDept} department!`)
init();
    })
}


//Add a role to roles
async function createRole(){

//get the list of all department with department_id to make the choices object list
    var dept = [];
    const result = await pool.query("SELECT id AS id, department_name As name FROM departments");

    result[0].forEach(dep =>{
    let qObj = {
        name: dep.name,
        value: dep.id
    }

    dept.push(qObj); 
    });

    inquirer.prompt([
    {
    type: 'input',
    name:'title',
    message: 'What is the name of the role?',
    },
    {
    type: 'number',
    name:'salary',
    message: 'What is the salary of the role?',
    },{
    type: 'list',
    name:'dept',
    message: 'Which department does the role belong to?',
    choices: dept,
    }

    ])
    .then(answer => {
    const sql = `INSERT INTO ROLES (title, salary, department_id) VALUES (?, ?, ?)`;
    pool.query(sql, [answer.title, answer.salary,answer.dept]);

    console.log(`Successfully inserted ${answer.title} role!`)
init();
    })
}

//add a new employee
async function createEmployee(){
//get the list of all roles with role_id to make the choices of employee's role
    const choiceRole =[];
    const roleResult = await pool.query("SELECT * FROM roles");
    
    roleResult[0].forEach(({title, id}) => {
    choiceRole.push({
    name: title,
    value: id
    }) 
    });

//get the list of all employee with employee_id to make the choices of employee's manager
    const choiceManager =[
    {
    name:'None',
    value: 0
    }
   ];
    const result = await pool.query("SELECT * FROM employees");
    
    result[0].forEach(({first_name, last_name, id}) => {
    choiceManager.push({
    name: first_name + "" + last_name,
    value: id
    }) 
    });
//add employee's prompt
    inquirer.prompt([
    {
        type: 'input',
        name:'first_name',
        message: "what is the employee's first name?",
        },
    {
        type: 'input',
        name:'last_name',
        message: "what is the employee's last name?",
        },
    {
        type: 'list',
        name:'role',
        message: "what is the employee's role?",
        choices: choiceRole,
        },
    {
        type: 'list',
        name:'manager',
        message: "who is the employee's manager?",
        choices: choiceManager,
        },
    ])
    .then(answer => {
//manager id is 0, should return null
    let manager_id = answer.manager !== 0 ? answer.manager: null;
    const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`;
        pool.query(sql, [answer.first_name, answer.last_name,answer.role, manager_id]);

        console.log(`Successfully inserted ${answer.first_name} ${answer.last_name} to employees!`)
    init();

   })
}

//upadate role
async function updateRole(){









}