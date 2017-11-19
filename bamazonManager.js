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
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "End Menu"]
      }
    ])
    .then(function(answer) {
      switch (answer.menu) {
        case "View Products for Sale":
          viewProducts();
          break;

        case "View Low Inventory":
          viewInventory();
          break;

        case "Add to Inventory":
          addInventory();
          break;

        case "Add New Product":
          addProduct();
          break;

        case "End Menu":
          connection.end();
          break;

      }
    });
};

// Display all products
function viewProducts() {
  connection.query("SELECT * FROM products WHERE stock_quantity > 0", function(err, res) {

    console.log("ID   | QUANTITY | ITEM(PRICE)");
    console.log("-----+----------+----------------------------");
    for (var i = 0; i < res.length; i++) {
      var id = res[i].item_id.toString() + "     ";      
      var stock = res[i].stock_quantity.toString() + "      ";
      console.log(id.substr(0,4) + " | " + stock.substr(0,6)+ "   | " + res[i].product_name + " ($" + res[i].price + ")");
    }
    console.log("-----+----------+----------------------------");
    //connection.end();
    selectMenu();
  });
}

// Display Inventory
function viewInventory() {
  connection.query("SELECT * FROM products ORDER BY stock_quantity LIMIT 5", function(err, res) {

    console.log("ID   | QUANTITY | ITEM(PRICE)");
    console.log("-----+----------+----------------------------");
    for (var i = 0; i < res.length; i++) {
      var id = res[i].item_id.toString() + "     ";      
      var stock = res[i].stock_quantity.toString() + "      ";
      console.log(id.substr(0,4) + " | " + stock.substr(0,6)+ "   | " + res[i].product_name + " ($" + res[i].price + ")");
    }
    console.log("-----+----------+----------------------------");
    //connection.end();
    selectMenu();
  });
}

// Display all products inventory before adding inventory
function addInventory() {
  connection.query("SELECT * FROM products", function(err, res) {

    console.log("ID   | QUANTITY | ITEM(PRICE)");
    console.log("-----+----------+----------------------------");
    for (var i = 0; i < res.length; i++) {
      var id = res[i].item_id.toString() + "     ";      
      var stock = res[i].stock_quantity.toString() + "      ";
      console.log(id.substr(0,4) + " | " + stock.substr(0,6)+ "   | " + res[i].product_name + " ($" + res[i].price + ")");
    }
    console.log("-----+----------+----------------------------");
    //connection.end();
    addInventoryProduct(res);
  });
}

// Add Inventory
function addInventoryProduct(res) {
  inquirer
    .prompt([
        {
          name: "id",
          type: "input",
          message: "Which item do you want to add Inventory to?　(Input ID)"
        },
        {
          name: "quantity",
          type: "input",
          message: "How many do you want to add?"
        }
      ])
    .then(function(answer) {
      var ID = parseInt(answer.id);
      var quantity = parseInt(answer.quantity);
      if (!(ID in res)) {
        console.log("The entered ID does'nt exist.");
        selectMenu();
      }
      else if (quantity <= 0 || isNaN(quantity)) {
        console.log("The entered quantity is not correct.");
        selectMenu(); 
      }
      else {
        for (var i = 0; i < res.length; i++) { 
          if (res[i].item_id == ID) { // if "===", it doen't match... 
            var stock = res[i].stock_quantity + quantity; // stock after adding
            break;
          }
        }
        addInventoryDB(answer.id, stock);
      }
    });
}

// Update inventory on database
function addInventoryDB(item_id, stock) {
  var query = connection.query(
    // UPDATE products SET quantity=100 WHERE flavor='Rocky Road';
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: stock
      },
      {
        item_id: item_id
      }
    ],
    function(err, res) {
      console.log("The quantity is added!\n");
      selectMenu();
    }
  );

  //connection.end();
}

function getDepartments() {
  connection.query("SELECT department_name FROM departments", function(err, res) {
    var departmentsArray = new Array;
    for (var i = 0; i < res.length; i++) {
      var name = res[i].department_name;
      departmentsArray.push(name);
    }
    return departmentsArray;
  });
}

// Create product
function addProduct() {

  var departmentsArray = [];
  connection.query("SELECT department_name FROM departments", function(err, res) {
    for (var i = 0; i < res.length; i++) {
      var name = res[i].department_name;
      departmentsArray.push(name);
    }
  });

  inquirer
    .prompt([
        {
          name: "product_name",
          type: "input",
          message: "Input product name."
        },
        /*
        {
          name: "department_name",
          type: "input",
          message: "Input department name."
        },
        */
        {
          name: "department_name",
          type: "list",
          message: "Input department name.",
          choices: departmentsArray
        },
        {
          name: "price",
          type: "input",
          message: "Input price."
        },
        {
          name: "quantity",
          type: "input",
          message: "Input stock quantity."
        }
      ])
    .then(function(answer) {
      var product_name = answer.product_name.trim();
      var department_name = answer.department_name;
      var price = parseFloat(answer.price);
      var quantity = parseInt(answer.quantity);
      if (product_name === "")  {
        console.log("The entered product name is not correct.");
        selectMenu();
      }
      else if (department_name === "") {
        console.log("The entered department name is not correct.");
        selectMenu(); 
      }
      else if (price <= 0 || isNaN(price)) {
        console.log("The entered price is not correct.");
        selectMenu(); 
      }
      else if (quantity <= 0 || isNaN(quantity)) {
        console.log("The entered quantity is not correct.");
        selectMenu(); 
      }
      else {
        addProductDB(product_name, department_name, price, quantity);
      }
    });
}


// Insert the product into database
function addProductDB(product_name, department_name, price, quantity) {
  var query = connection.query(
    "INSERT INTO products SET ?",
    {
      product_name: product_name,
      department_name: department_name,
      price: price,
      stock_quantity: quantity
    },
    function(err, res) {
      //console.log(res.affectedRows + " Product inserted!\n");
      console.log("Product inserted!\n");
      selectMenu();
    }
  );

  //connection.end();
}

