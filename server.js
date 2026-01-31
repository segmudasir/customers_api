const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path'); // for images of Orders
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Serve images folder statically
app.use('/images', express.static(path.join(__dirname, 'images')));


// Change the path here to your actual DB file
const db = new sqlite3.Database('./SQL_Customer.db', (err) => {
  if (err) {
    console.error('Could not connect to database', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});



// =================== Add Customer =================== //
app.post('/customers/add', (req, res) => {
  const { CustomerID, CustomerName, Gender, Age, Address, City, PostalCode, Country } = req.body;

  // Validate required fields
  if (!CustomerID || !CustomerName || !Gender || Age == null || !Address || !City || !PostalCode || !Country) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Check if customer already exists
  db.get('SELECT * FROM customers WHERE CustomerID = ?', [CustomerID], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {
      return res.status(400).json({
        Message: `Failed - Customer with ID ${CustomerID} already exists.`
      });
    }

    // Insert new customer
    const sql = `
      INSERT INTO customers(CustomerID, CustomerName, Gender, Age, Address, City, PostalCode, Country)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [CustomerID, CustomerName, Gender, Age, Address, City, PostalCode, Country], function(err) {
      if (err) return res.status(500).json({ error: err.message });

      res.status(201).json({
        Message: "Customer added successfully",
        CustomerID: CustomerID
      });
    });
  });
});

// =================== GET Customers =================== //
app.get('/customers', (req, res) => {
  let query = 'SELECT * FROM customers WHERE 1=1';
  const params = [];

  if (req.query.CustomerID) {
    query += ' AND CustomerID = ?';
    params.push(req.query.CustomerID);
  }

  if (req.query.CustomerName) {
    query += ' AND CustomerName = ?';
    params.push(req.query.CustomerName);
  }

  if (req.query.City) {
    query += ' AND City = ?';
    params.push(req.query.City);
  }

  if (req.query.Gender) {
    query += ' AND Gender = ?';
    params.push(req.query.Gender);
  }

  if (req.query.Country) {
    query += ' AND Country = ?';
    params.push(req.query.Country);
  }

  query += ' ORDER BY CustomerID ASC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    // Check for all filters individually
    if ((req.query.CustomerID || req.query.CustomerName || req.query.City || req.query.Gender || req.query.Country) && rows.length === 0) {
      return res.status(404).json({ error: `Customer not found` });
    }

    res.json(rows);
  });
});

// =================== Update Customer =================== //
app.put('/customers/update', (req, res) => {
  const { CustomerID, ...fieldsToUpdate } = req.body;

  if (!CustomerID) {
    return res.status(400).json({ error: "CustomerID is required" });
  }

  const keys = Object.keys(fieldsToUpdate);
  if (keys.length === 0) {
    return res.status(400).json({ error: "No update fields provided" });
  }

  db.get('SELECT * FROM customers WHERE CustomerID = ?', [CustomerID], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: `Customer with ID ${CustomerID} not found` });

    const setClause = keys.map(field => `${field} = ?`).join(', ');
    const values = keys.map(field => fieldsToUpdate[field]);
    values.push(CustomerID);

    const sql = `UPDATE customers SET ${setClause} WHERE CustomerID = ?`;

    db.run(sql, values, function(err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        message: "Following properties of customer updated successfully",
        ...fieldsToUpdate
      });
    });
  });
});

// =================== DELETE Customer =================== //
app.delete('/customers/delete', (req, res) => {
  const { CustomerID } = req.body;

  if (!CustomerID) {
    return res.status(400).json({ error: "CustomerID is required" });
  }

  db.run('DELETE FROM customers WHERE CustomerID = ?', [CustomerID], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ error: `Customer with ID ${CustomerID} not found` });
    }

    res.json({
      message: "Customer deleted successfully",
      CustomerID: CustomerID
    });
  });
});



// =================== Add Products =================== //
app.post('/products/add', (req, res) => {
  const { ProductID, ProductName, Price, ImagePath } = req.body;

  if (!ProductID || !ProductName || Price == null) {
    return res.status(400).json({
      error: "ProductID, ProductName, and Price are required"
    });
  }

  db.get(
    'SELECT * FROM Products WHERE ProductID = ?',
    [ProductID],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (row) {
        return res.status(400).json({
          Message: `Failed - Product with ID ${ProductID} already exists.`
        });
      }

      const sql = `
        INSERT INTO Products (ProductID, ProductName, Price, ImagePath)
        VALUES (?, ?, ?, ?)
      `;

      db.run(sql, [ProductID, ProductName, Price, ImagePath], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({
          Message: "Product added successfully",
          ProductID: ProductID,
        });
      });
    }
  );
});

// =================== Get Products =================== //
app.get('/products', (req, res) => {
  let query = 'SELECT * FROM Products WHERE 1=1';
  const params = [];

  if (req.query.ProductID) {
    query += ' AND ProductID = ?';
    params.push(req.query.ProductID);
  }

  if (req.query.ProductName) {
    query += ' AND ProductName = ?';
    params.push(req.query.ProductName);
  }

  query += ' ORDER BY ProductID ASC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (req.query.ProductID && rows.length === 0) {
      return res.status(404).json({ error: `Product with ID ${req.query.ProductID} not found` });
    }

    res.json(rows);
  });
});

// =================== Update Products =================== //
app.put('/products/update', (req, res) => {
  const { ProductID, ...fieldsToUpdate } = req.body;

  if (!ProductID) {
    return res.status(400).json({ error: "ProductID is required" });
  }

  const keys = Object.keys(fieldsToUpdate);
  if (keys.length === 0) {
    return res.status(400).json({ error: "No update fields provided" });
  }

  // Check if product exists
  db.get('SELECT * FROM Products WHERE ProductID = ?', [ProductID], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: `Product with ID ${ProductID} not found` });

    // Prepare only fields that are actually changing
    const setClause = [];
    const values = [];
    const updatedFields = {};

    keys.forEach(field => {
      if (row[field] !== fieldsToUpdate[field]) {
        setClause.push(`${field} = ?`);
        values.push(fieldsToUpdate[field]);
        updatedFields[field] = fieldsToUpdate[field];
      }
    });

    if (setClause.length === 0) {
      return res.json({
        message: "No changes were made",
        ProductID
      });
    }

    values.push(ProductID);
    const sql = `UPDATE Products SET ${setClause.join(', ')} WHERE ProductID = ?`;

    db.run(sql, values, function(err) {
      if (err) return res.status(500).json({ error: err.message });

      // Build final response: merge message + updated fields at top level
      const response = { message: "Product updated successfully and following properties were updated", ...updatedFields };
      res.json(response);
    });
  });
});


// =================== Delete Product =================== //
app.delete('/products/delete', (req, res) => {
  const { ProductID } = req.body;

  if (!ProductID) {
    return res.status(400).json({ error: "ProductID is required" });
  }
 
  db.run('DELETE FROM Products WHERE ProductID = ?', [ProductID], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ error: `Product with ID ${ProductID} not found` });
    }

    res.json({
      message: "Product deleted successfully",
      ProductID: ProductID
    });
  });
});



// Authentication then API CLient registtation then all methods that uses Authentication.
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const parts = authHeader.split(' ');

  if (parts[0] !== 'Bearer' || !parts[1]) {
    return res.status(401).json({ error: "Invalid authorization format" });
  }

  const accessToken = parts[1];

  db.get(
    'SELECT Name, Email FROM Users WHERE AccessToken = ?',
    [accessToken],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: "Invalid access token" });

      req.user = user; // attach the user
      next();
    }
  );
}

//API Client Registration
app.post('/users', (req, res) => {
  const { Name, Email } = req.body;

  // Validate required fields individually
  if (!Name && !Email) {
    return res.status(400).json({
      error: "Name and Email are required"
    });
  }

  if (!Name) {
    return res.status(400).json({
      error: "Name is required"
    });
  }

  if (!Email) {
    return res.status(400).json({
      error: "Email is required"
    });
  }

  // Check if email already exists
  db.get(
    'SELECT * FROM Users WHERE Email = ?',
    [Email],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (row) {
        return res.status(409).json({
          error: "API client already registered. Try a different email."
        });
      }

      // Generate random 9-digit access token
      const accessToken = Math.floor(100000000 + Math.random() * 900000000).toString();

      // Insert user
      const sql = `
        INSERT INTO Users (Name, Email, AccessToken)
        VALUES (?, ?, ?)
      `;

      db.run(sql, [Name, Email, accessToken], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        return res.status(201).json({
          accessToken: accessToken
        });
      });
    }
  );
});

// =================== Retrieve Access Token =================== //
app.post('/accesstoken', (req, res) => {
  const { Email } = req.body;

  if (!Email) {
    return res.status(400).json({ error: "Email is required" });
  }

  db.get(
    'SELECT AccessToken FROM Users WHERE Email = ?',
    [Email],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      if (!row) {
        return res.status(404).json({ error: "Email not registered" });
      }

      // Return the existing access token
      res.status(200).json({
        Email: Email,
        accessToken: row.AccessToken
      });
    }
  );
});

// =================== Delete Access Token (Delete User Row) =================== //
app.delete('/deletetoken', (req, res) => {
  const { Email } = req.body;

  if (!Email) {
    return res.status(400).json({ error: "Email is required" });
  }

  db.run('DELETE FROM Users WHERE Email = ?', [Email], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ error: "Email does not exist" });
    }

    res.json({
      message: `User has been deleted successfully`
    });
  });
});



// =================== Add Order (Protected) =================== //
app.post('/orders/add', authenticateToken, (req, res) => {
  const { CustomerName, Product, Price, Quantity, OrderDate } = req.body;

  // Field-by-field validation
  if (!CustomerName) {
    return res.status(400).json({ error: "CustomerName is mandatory" });
  }

  if (!Product) {
    return res.status(400).json({ error: "Product is mandatory" });
  }

  if (Price === undefined || Price === null) {
    return res.status(400).json({ error: "Price is mandatory" });
  }

  if (Quantity === undefined || Quantity === null) {
    return res.status(400).json({ error: "Quantity is mandatory" });
  }

  if (!OrderDate) {
    return res.status(400).json({ error: "OrderDate is mandatory" });
  }

  // Calculate TotalAmount
  const TotalAmount = parseFloat((Price * Quantity).toFixed(2));

  // Get latest OrderID and increment
  db.get('SELECT MAX(OrderID) AS maxID FROM orders', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    let newOrderID = 1001;
    if (row && row.maxID) {
      newOrderID = row.maxID + 1;
    }

    const sql = `
      INSERT INTO orders
      (OrderID, CustomerName, Product, Price, Quantity, OrderDate, TotalAmount)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      sql,
      [newOrderID, CustomerName, Product, Price, Quantity, OrderDate, TotalAmount],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        res.status(201).json({
          message: "Order added successfully",
          OrderID: newOrderID,
          TotalAmount
        });
      }
    );
  });
});


// =================== GET Orders (Protected) =================== //
app.get('/orders', authenticateToken, (req, res) => {
  let query = 'SELECT * FROM orders WHERE 1=1';
  const params = [];

  if (req.query.OrderID) {
    query += ' AND OrderID = ?';
    params.push(req.query.OrderID);
  }

  if (req.query.CustomerName) {
    query += ' AND CustomerName = ?';
    params.push(req.query.CustomerName);
  }

  query += ' ORDER BY OrderID ASC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows.length === 0) {
      return res.status(404).json({ error: `Order not found` });
    }

    // If only one order requested by ID, return object instead of array
    if (req.query.OrderID && rows.length === 1) {
      return res.json(rows[0]);
    }

    // Otherwise return array of orders
    res.json(rows);
  });
});



// =================== Update Order (Protected) =================== //
app.put('/orders/update', authenticateToken, (req, res) => {
  const { OrderID, ...fieldsToUpdate } = req.body;

  // Validate required OrderID
  if (!OrderID) {
    return res.status(400).json({ error: "OrderID is required" });
  }

  // Validate that at least one field is provided
  const keys = Object.keys(fieldsToUpdate);
  if (keys.length === 0) {
    return res.status(400).json({ error: "No update fields provided" });
  }

  // Check if order exists
  db.get('SELECT * FROM orders WHERE OrderID = ?', [OrderID], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: `Order with ID ${OrderID} not found` });

    // Prepare SET clause and values, only for fields that are actually changing
    const setClause = [];
    const values = [];
    const updatedFields = {}; // to keep only fields that actually changed

    keys.forEach(field => {
      if (row[field] !== fieldsToUpdate[field]) {
        setClause.push(`${field} = ?`);
        values.push(fieldsToUpdate[field]);
        updatedFields[field] = fieldsToUpdate[field]; // track for response
      }
    });

    // If nothing is changing
    if (setClause.length === 0) {
      return res.json({
        message: "No changes were made",
      });
    }

    values.push(OrderID); // WHERE OrderID = ?
    const sql = `UPDATE orders SET ${setClause.join(', ')} WHERE OrderID = ?`;

    db.run(sql, values, function(err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        message: "Order updated successfully and following properties have been updated",
        ...updatedFields // spread updated fields at top level
      });
    });
  });
});


// =================== DELETE Order (Protected) =================== //
app.delete('/orders/delete', authenticateToken, (req, res) => {
  const { OrderID } = req.body;

  if (!OrderID) {
    return res.status(400).json({ error: "OrderID is required" });
  }

  const deletedBy = req.user.Email; // who is deleting

  db.run('DELETE FROM orders WHERE OrderID = ?', [OrderID], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ error: `Order with ID ${OrderID} not found` });
    }

    res.json({
      message: "Order deleted successfully", 
    });
  });
});




app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});



