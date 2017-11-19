DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;

USE bamazon;

CREATE TABLE products (
  item_id INT NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price DECIMAL(10,4) NULL,
  stock_quantity INT NULL,
  PRIMARY KEY (item_id)
);


ALTER TABLE products ADD product_sales INT default 0;

ALTER TABLE products DROP product_sales;

SELECT departments.department_id, departments.department_name, 
COALESCE(departments.over_head_costs,0), 
COALESCE(sum(products.product_sales),0) as product_sales, 
(COALESCE(sum(products.product_sales),0) - COALESCE(departments.over_head_costs,0)) as total_profit 
FROM departments 
LEFT JOIN products ON departments.department_name = products.department_name 
GROUP BY departments.department_id;
