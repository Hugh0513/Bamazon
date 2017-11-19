var mysql = require("mysql");
var inquirer = require("inquirer");

// Connecting database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "localhost",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  //connection.end();
  selectMenu();
});

// Display Menu
function selectMenu() {
  inquirer
    .prompt([
      {
        name: "menu",
        type: "list",
        message: "What would you like to do?",
        choices: ["View Product Sales by Department", "Create New Department", "End Menu"]
      }
    ])
    .then(function(answer) {
      switch (answer.menu) {
        case "View Product Sales by Department":
          viewSales();
          break;

        case "Create New Department":
          addDepartment();
          break;

        case "End Menu":
          connection.end();
          break;
      }
    });
};

// Display Sales grouped by departments
function viewSales() {
  var sql_query = "SELECT departments.department_id, departments.department_name, "
 + "COALESCE(departments.over_head_costs,0) as over_head_costs, "
 + "COALESCE(sum(products.product_sales),0) as product_sales, "
 + "(COALESCE(sum(products.product_sales),0) - COALESCE(departments.over_head_costs,0)) as total_profit "
 + "FROM departments "
 + "LEFT JOIN products ON departments.department_name = products.department_name "
 + "GROUP BY departments.department_id"

  connection.query(sql_query, function(err, res) {

    //console.log(res);
    console.log("department_id | department_name           | over_head_costs | product_sales | total_profit ");
    console.log("--------------+---------------------------+-----------------+---------------+--------------");
    for (var i = 0; i < res.length; i++) {
      var id = res[i].department_id.toString() + "                ";      
      var name = res[i].department_name.toString() + "                           ";       
      var costs = res[i].over_head_costs.toString() + "                  ";       
      var sales = res[i].product_sales.toString() + "                  ";       
      var profit = res[i].total_profit.toString() + "                  ";      
      console.log(id.substr(0,14) + "|" + name.substr(0,27) + "|" + costs.substr(0,17) + "|" + sales.substr(0,15) + "|" + profit.substr(0,17));
    }
    console.log("--------------+---------------------------+-----------------+---------------+--------------");

    //connection.end();
    selectMenu();
  });
}

// Create Department
function addDepartment() {
  inquirer
    .prompt([
        {
          name: "department_name",
          type: "input",
          message: "Input department name."
        },
        {
          name: "over_head_costs",
          type: "input",
          message: "Input over head costs."
        }
      ])
    .then(function(answer) {
      var department_name = answer.department_name.trim();
      var over_head_costs = parseFloat(answer.over_head_costs);
      if (department_name === "") {
        console.log("The entered department name is not correct.");
        selectMenu(); 
      }
      else if (over_head_costs <= 0 || isNaN(over_head_costs)) {
        console.log("The entered over head costs is not correct.");
        selectMenu(); 
      }
      else {
        addDepartmentDB(department_name, over_head_costs);
      }
    });
}

// Insert the created department into database
function addDepartmentDB(department_name, over_head_costs) {
  var query = connection.query(
    "INSERT INTO departments SET ?",
    {
      department_name: department_name,
      over_head_costs: over_head_costs
    },
    function(err, res) {
      console.log("Department inserted!\n");
      selectMenu();
    }
  );

  //connection.end();
}

