// Dependencies
const inquirer = require("inquirer");
const db = require("./db");
const Table = require("cli-table3");

const viewEmployeeQuery = `SELECT
emp.id AS "ID",
emp.first_name,
emp.last_name,
CASE
WHEN mgr.first_name IS NULL THEN 'Manager'
ELSE CONCAT(mgr.first_name, ' ', mgr.last_name)
END AS "Manager",
role.title AS role,
role.salary AS salary,
dept.name AS department
FROM
employee AS emp
LEFT JOIN
employee AS mgr ON emp.manager_id = mgr.id
INNER JOIN
role ON emp.role_id = role.id
INNER JOIN
department AS dept ON role.department_id = dept.id
`;

// TEST RENDER APP

// const renderApp = async function () {
//   await inquirer.prompt([
//     {
//       type: "list",
//       name: "claEmployeeTracker",
//       message: "What would you like to do ?",
//       choices: [
//         "View all the employees.",
//         "Add a new employee.",
//         "Update employee role.",
//         new inquirer.Separator(),
//         "View all roles.",
//         "Add role.",
//         new inquirer.Separator(),
//         "View all departments.",
//         "Add department.",
//         new inquirer.Separator(),
//       ],
//     },
//   ]);
// };

// renderApp();

//Prompt fuctions===================

// Function to view employees

const viewEmployee = function () {
  // Execute the SQL query to fetch employee data
  db.query(viewEmployeeQuery, (err, { rows }) => {
    if (err) {
      console.error(err);
      return;
    }

    // Create a new table instance with column headers
    const table = new Table({
      head: [
        "ID",
        "First Name",
        "Last Name",
        "Role",
        "Department",
        "Salary",
        "Manager",
      ],
      colWidths: [5, 15, 15, 15, 15],
    });

    // Loop through each row of the result and add it to the table
    rows.forEach((row) => {
      table.push([
        row.ID,
        `${row.first_name}`,
        `${row.last_name}`,
        `${row.role}`,
        `${row.department}`,
        `${row.salary}`,
        `${row.Manager}`,
      ]);
    });
    // Display the table in the console
    console.log(table.toString());
  });
};

// viewEmployee();
// Fuction to add employee
const addEmployee = function () {
  //DATA
  let roles = [];
  let managers = [];

  //Database query to get roles from role table
  db.query("SELECT * FROM role", (err, { rows }) => {
    rows.forEach((row) => {
      roles.push(row.title);
    });
  });

  //Database query to get managers from employee
  db.query("SELECT * FROM employee LIMIT 4", (err, { rows }) => {
    rows.forEach((row) => {
      managers.push(row.first_name + " " + row.last_name);
    });
  });

  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "What is the employee's first name ?",
        validate: (input) => {
          if (input === "" || input.length > 30) {
            return "Can not be empty or more then 30 characters";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "lastName",
        message: "What is the employee's last name ?",
        validate: (input) => {
          if (input === "" || input.length > 30) {
            return "Can not be empty or more then 30 characters";
          }
          return true;
        },
      },
      {
        type: "list",
        name: "employeeRole",
        message: "What is the employee's role ? ",
        choices: roles,
      },
      {
        type: "list",
        name: "employeeManager",
        message: "Who is the employee's manager ? ",
        choices: managers,
      },
    ])
    .then((answers) => {
      // Data
      // Get the index of the selected manager and role, and add 1 to match database IDs
      const managerId = managers.indexOf(answers.employeeManager) + 1;
      const roleId = roles.indexOf(answers.employeeRole) + 1;
      // Capitalize the first letter of the first and last names
      const firstNameUppercase =
        answers.firstName[0].toUpperCase() + answers.firstName.slice(1);
      const lastNameUppercase =
        answers.lastName[0].toUpperCase() + answers.lastName.slice(1);
      // Insert the new employee into the database
      db.query(
        `INSERT INTO employee(first_name,last_name,role_id,manager_id) VALUES('${firstNameUppercase}','${lastNameUppercase}',${roleId},${managerId})`,
        (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log("Employee added successfully!");
        }
      );
    });
};

const updateEmployeeRole = function () {
  let employees = [];
  let roles = [];

  // Fetch employees from the database
  db.query("SELECT * FROM employee", (err, { rows: employeesRows }) => {
    if (err) {
      console.error(err);
      return;
    }

    employeesRows.forEach((row) => {
      employees.push(row.first_name + " " + row.last_name);
    });

    // Fetch roles from the database
    db.query("SELECT * FROM role", (err, { rows: rolesRows }) => {
      if (err) {
        console.error(err);
        return;
      }

      rolesRows.forEach((row) => {
        roles.push(row.title);
      });

      inquirer
        .prompt([
          {
            type: "list",
            name: "employeeList",
            message: "Which employee's role would you like to update ?",
            choices: employees,
          },
          {
            type: "list",
            name: "roleList",
            message:
              "Which role do you want to assign to the selected employee ?",
            choices: roles,
          },
        ])
        .then((answers) => {
          const employeeName = answers.employeeList;
          const roleName = answers.roleList;

          // Find the employee ID based on the selected employee name
          const employeeId = employeesRows.find(
            (row) => row.first_name + " " + row.last_name === employeeName
          ).id;

          // Find the role ID based on the selected role name
          const roleId = rolesRows.find((row) => row.title === roleName).id;

          // Update the employee's role in the database
          db.query(
            `UPDATE employee SET role_id = ${roleId} WHERE id = ${employeeId}`,
            (err) => {
              if (err) {
                console.error(err);
                return;
              }
              console.log(
                `Successfully updated ${employeeName}'s role to ${roleName}`
              );
            }
          );
        });
    });
  });
};

// viewEmployee();
// addEmployee();
// updateEmployeeRole();