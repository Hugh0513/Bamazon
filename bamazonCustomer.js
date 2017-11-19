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
  queryAllProducts();
  console.log("");
  console.log("****************************************");
  console.log("*          Welcome to bamazon          *");
  console.log("****************************************");
  console.log("");
});

// Display all products
function queryAllProducts() {

  connection.query("SELECT * FROM products WHERE stock_quantity > 0", function(err, res) {

    console.log("ID   | ITEM(PRICE)");
    console.log("-----+-----------------------------");
    for (var i = 0; i < res.length; i++) {
      var id = res[i].item_id.toString() + "     ";
      console.log(id.substr(0,4) + " | " + res[i].product_name + " ($" + res[i].price + ")");
    }
    console.log("-----+-----------------------------");
    //connection.end();
    runSearch(res);
  });
}

function runSearch(res) {
  inquirer
    .prompt([
        {
          name: "id",
          type: "input",
          message: "Which item do you want?　(Input ID)"
        },
        {
          name: "quantity",
          type: "input",
          message: "How many?"
        }
      ])
    .then(function(answer) {
      var ID = parseInt(answer.id);
      var quantity = parseInt(answer.quantity);
      var isID = false;
      for (var i = 0; i < res.length; i++) { 
        if (ID === parseInt(res[i].item_id)) {
          isID = true;
          break;
        }
      }
      if (!isID) {
        console.log("The entered ID does'nt exist.");
        queryAllProducts();
      }
      else if (quantity <= 0 || isNaN(quantity)) {
        console.log("The entered quantity is not correct.");
        runSearch(res); 
      }
      else {
        runSearchProduct(answer.id, answer.quantity, res);
      }
    });
}


function runSearchProduct(item_id, quantity, res) {
  for (var i = 0; i < res.length; i++) { 
    if (res[i].item_id == item_id) { // if "===", it doen't match... 
      if (res[i].stock_quantity >= quantity){ // The order is Acceptable
        var stock = res[i].stock_quantity - quantity; // stock quantity after processsing the order
        var sales = res[i].product_sales + (res[i].price * quantity);
        updateDB(item_id, stock, sales);
      }
      else { // There is not enough stock
        console.log("Insufficient quantity!")
        runSearch(res);
      }
      break;
      //console.log("ID: " + res[i].item_id + " || Prodauct Name: " + res[i].product_name + " || Price: $" + res[i].price);
    }
  }

}

function updateDB(item_id, stock,sales) {
  var query = connection.query(
    // UPDATE products SET quantity=100 WHERE flavor='Rocky Road';
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: stock,
        product_sales: sales
      },
      {
        item_id: item_id
      }
    ],
    function(err, res) {
      console.log("Your order is confirmed and complete!\n");
      console.log("Your payment is $" + sales.toFixed(2) + ".\n");
      ifContinue();
    }
  );

  //connection.end();
}


// Continue or Exit
function ifContinue() {
  inquirer
    .prompt([
      {
        name: "isContinue",
        type: "list",
        message: "Keep shopping?",
    choices: ["Yes", "No"]
      }
    ])
    .then(function(answers) {
      if (answers.isContinue === "Yes") {
        queryAllProducts();
      } 
      else{
        console.log("\nThank you for your shopping!");
        connection.end();
      }
    });
};
