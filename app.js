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
            'Update an employee manager',
            'View employees by manager',
            'View employees by department',  
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

        if(answers.choices === "Update an employee manager"){
            updateManager();
        };

        if(answers.choices === "View employees by manager"){
            viewEmployeeByManager();
        };

       if(answers.choices === "View employees by department"){
            viewEmployeeByDepartment()
        };
       
        if(answers.choices === "Delete a department"){
            removeDepartment();
        };

        if(answers.choices === "Delete a role"){
            removeRole();
        };

        if(answers.choices === "Delet an employee"){
            removeEmployee();
        };
        
        if(answers.choices === "View department budgets"){
            viewBudgets();
        }
         if(answers.choices === "Quit"){
            pool.end();
        }

    });


};



//====================================get all departments================================
async function getDepartments(){
    const sql = `SELECT id AS id, department_name As name FROM departments`
    const result = await pool.query(sql);
    console.table(result[0]);
    init()
}

//=================================get single department=======================================
async function getDepartment(id){
    const [rows] = await pool.query(`
    SELECT * 
    FROM departments
    WHERE id = ?
    `, [id])
    return rows[0];
}


//=================================get all roles================================================
async function getRoles(){
    const sql = `SELECT roles.id, roles.title,roles.salary, departments.department_name AS department
                  FROM roles
                  INNER JOIN departments ON roles.department_id = departments.id`;
    const result = await pool.query(sql);

    console.table(result[0]);
    init()
}

//==================================get all employees===============================================
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

//================================insert departmenet to departments==================================
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


//===========================================Add a role============================================
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

//=========================================add a new employee=======================================
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
    name: first_name + " " + last_name,
    value: id
    }) 
    });
//add employee's prompt
    inquirer.prompt([
    {
        type: 'input',
        name:'first_name',
        message: "What is the employee's first name?",
        },
    {
        type: 'input',
        name:'last_name',
        message: "What is the employee's last name?",
        },
    {
        type: 'list',
        name:'role',
        message: "What is the employee's role?",
        choices: choiceRole,
        },
    {
        type: 'list',
        name:'manager',
        message: "Who is the employee's manager?",
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

//========================================upadate role==============================================
async function updateRole(){
    const choiceEmployee = [];
    //get all the employee list
    const employees = await pool.query('SELECT * FROM employees');
    employees[0].forEach(({first_name, last_name, id}) => {
    choiceEmployee.push({
    name: first_name + " " + last_name,
    value: id
    });
    });

    //get all the role list to make choice of employee's role
    const choiceRole = [];
    const roles = await pool.query('SELECT * FROM roles');
    roles[0].forEach(({title, id}) => {
    choiceRole.push({
    name: title,
    value: id
    });
    });


    inquirer.prompt([
    {
    type: 'list',
    name:'choiceEmployee',
    message: "Which employee's role do you want to update?",
    choices: choiceEmployee,
    },
    {
    type: 'list',
    name:'choiceRole',
    message: "Which role do you want to assign the selected employee?",
    choices: choiceRole,
    }
    ])
    .then(answer => {

    const sql = `UPDATE employees 
                SET role_id = ? 
                WHERE id = ?`;
    pool.query(sql, [answer.choiceRole, answer.choiceEmployee]);
    console.log("successfully updated employee's role!");
    init();

    })
}

//=====================================update manager===============================================

async function updateManager(){

  const choiceEmployee = [];
    //get all the employee list
    const employees = await pool.query('SELECT * FROM employees');
    employees[0].forEach(({first_name, last_name, id}) => {
    choiceEmployee.push({
    name: first_name + " " + last_name,
    value: id
    });
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
    name: first_name + " " + last_name,
    value: id
    }) 
    });

 inquirer.prompt([
    {
    type: 'list',
    name:'choiceEmployee',
    message: "Which employee would you like to update?",
    choices: choiceEmployee,
    },
    {
    type: 'list',
    name:'choiceManager',
    message: "Who is the employee's manager?",
    choices: choiceManager,
    }
    ])
    .then(answer => {
     let manager_id = answer.choiceManager !== 0 ? answer.choiceManager: null;
    const sql = `UPDATE employees 
                SET manager_id = ? 
                WHERE id = ?`;
    pool.query(sql, [manager_id, answer.choiceEmployee]);
    console.log("successfully updated employee's manager!");
 
    init();

    })
}

//=================================view all employee by manager=====================================

async function viewEmployeeByManager(){

//get the list of all employee with employee_id to make the choices of employee's manager
    const choiceManager =[
    {
    name:'None',
    value: 0
    }
   ];
    const result = await pool.query(`SELECT manager.id, CONCAT (manager.first_name, " ", manager.last_name) AS manager
                  FROM employees
                  INNER JOIN employees manager on employees.manager_id = manager.id`);
    
// console.log(result);
    result[0].forEach(({manager, id}) => {
    choiceManager.push({
    name: manager,
    value: id
    }) 
    });


 inquirer.prompt([
   {
    type: 'list',
    name:'choiceManager',
    message: "Which Manager do you want to view Employees for?",
    choices: choiceManager,
    }

])
 .then( async (answer) => {
     let manager_id = answer.choiceManager !== 0 ? answer.choiceManager: null;
    const sql = `SELECT employees.id, employees.first_name, employees.last_name,roles.title, departments.department_name AS department, roles.salary, CONCAT (manager.first_name, " ", manager.last_name) AS manager
                  FROM employees
                  LEFT JOIN employees manager ON employees.manager_id = manager.id
                  INNER JOIN roles ON employees.role_id = roles.id
                  INNER JOIN departments ON roles.department_id = departments.id
                  WHERE employees.manager_id = ?`;
  

   const result = await pool.query(sql,manager_id);
  
    console.table(result[0]);
    init();

    })

}


//=============================View All Employees By Departments================================

async function viewEmployeeByDepartment(){
    const departmentArr =[];
    const sql = `SELECT department_name As department FROM departments`;
    const result = await pool.query(sql);

    result[0].forEach(({department, id}) => {
    departmentArr.push({
    name: department,
    value: id
    }) 
    });

inquirer.prompt([
   {
    type: 'list',
    name:'choiceDepartment',
    message: "Which Department do you want to view Employees for?",
    choices: departmentArr,
    }

])
 .then( async (answer) => {

      const sql = `SELECT employees.id, employees.first_name, employees.last_name,roles.title, departments.department_name AS department, roles.salary, CONCAT (manager.first_name, " ", manager.last_name) AS manager
                  FROM employees
                  INNER JOIN employees manager ON employees.manager_id = manager.id
                  INNER JOIN roles ON employees.role_id = roles.id
                  LEFT JOIN departments ON roles.department_id = departments.id
                  WHERE roles.department_id = ?;`;


      const result = await pool.query(sql, answer.choiceDepartment);

      console.table(result[0]);
    init();

})
}



//===========================================Remove================================================
//Delete a Department
async function removeDepartment(){
    const choiceDepartment = [];
    //get all the employee list
    const departments = await pool.query('SELECT * FROM departments');
    console.log(departments[0]);
    departments[0].forEach(({department_name, id}) => {
    choiceDepartment.push({
    name: department_name,
    value: id
    });
    });

       inquirer
        .prompt([
          {
            name: 'choiceEmployee',
            type: 'list',
            message: 'Which department would you like to remove?',
            choices: choiceDepartment
          }
        ])
        .then((answer) => {
         let sql = `DELETE FROM departments WHERE departments.id = ?`;
         pool.query(sql, answer.choiceEmployee);
         console.log(`successfully delete a department!`)

         init();
          });
}

//Delete a Role
async function removeRole(){
    const choiceRole = [];
    //get all the employee list
    const roles = await pool.query('SELECT * FROM roles');
  
    roles[0].forEach(({title, id}) => {
    choiceRole.push({
    name: title,
    value: id
    });
    });

       inquirer
        .prompt([
          {
            name: 'choiceRole',
            type: 'list',
            message: 'Which role would you like to remove?',
            choices: choiceRole
          }
        ])
        .then((answer) => {
         
          let sql = `DELETE FROM roles WHERE roles.id = ?`;
         pool.query(sql, answer.choiceRole);
         console.log(`successfully delete a role!`)

         init();
          });

}


// Delete an Employee
async function removeEmployee(){
     const choiceEmployee = [];
    //get all the employee list
    const employees = await pool.query('SELECT * FROM employees');
    employees[0].forEach(({first_name, last_name, id}) => {
    choiceEmployee.push({
    name: first_name + " " + last_name,
    value: id
    });
    });

      inquirer
        .prompt([
          {
            name: 'choiceEmployee',
            type: 'list',
            message: 'Which employee would you like to remove?',
            choices: choiceEmployee
          }
        ])
        .then((answer) => {
         
          let sql = `DELETE FROM employees WHERE employees.id = ?`;
         pool.query(sql, answer.choiceEmployee);
         console.log(`successfully delete an employee!`)

         init();
          });
  };


//=======================================viewBudgets===============================================
async function viewBudgets(){
  console.log('Showing budget by department...\n');

  const sql = `SELECT department_id AS id, 
                      departments.department_name AS department,
                      SUM(salary) AS budget
               FROM  roles  
               JOIN departments ON roles.department_id = departments.id GROUP BY  department_id`;

  const res = await pool.query(sql)

    console.table(res[0]);
  init();
};