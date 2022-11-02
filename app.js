import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const cTable = require('console.table');
import inquirer from 'inquirer';




//connect to mysql
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
}).promise();

//get departments from mysql query
export async function getDepartments(){
const result = await pool.query("SELECT * FROM departments")
return result[0];
}

//get single department from mysql query 
export async function getDepartment(id){
const [rows] = await pool.query(`
SELECT * 
FROM departments
WHERE id = ?
`, [id])
return rows[0];
}

//insert departmenet to departments function
export async function createDepartment(department_name){
const [result] = await pool.query(`
INSERT INTO departments (department_name)
VALUES(?)
`,[department_name])
const id = result.insertId;
return getDepartment(id);
}

const result = await createDepartment('test');
console.log(result);