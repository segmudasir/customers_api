const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Change the path here to your actual DB file
const db = new sqlite3.Database('./SQL_Customer.db', (err) => {
  if (err) {
    console.error('Could not connect to database', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});


// =================== GET Orders =================== //
app.get('/orders', (req, res) => {
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

    if (req.query.OrderID && rows.length === 0) {
      return res.status(404).json({ error: `Order with ID ${req.query.OrderID} not found` });
    }

    res.json(rows);
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

  query += ' ORDER BY CustomerID ASC';

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (req.query.CustomerID && rows.length === 0) {
      return res.status(404).json({ error: `Customer with ID ${req.query.CustomerID} not found` });
    }

    res.json(rows);
  });
});
// =================== POST Add Customer =================== //
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

      res.json({
        Message: "Customer added successfully",
        CustomerID: CustomerID
      });
    });
  });
});

// =================== POST Add Order =================== //
app.post('/orders/add', (req, res) => {
  const { OrderID, CustomerName, Product, Price, Quantity, OrderDate, TotalAmount } = req.body;

  if (!OrderID || !CustomerName || !Product || Price == null || Quantity == null || !OrderDate || TotalAmount == null) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.get('SELECT * FROM orders WHERE OrderID = ?', [OrderID], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {
      return res.status(400).json({
        Message: `Failed - Order with ID ${OrderID} already exists.`
      });
    }

    const sql = `
      INSERT INTO orders(OrderID, CustomerName, Product, Price, Quantity, OrderDate, TotalAmount)
      VALUES(?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [OrderID, CustomerName, Product, Price, Quantity, OrderDate, TotalAmount], function(err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        Message: "Order added Successfully",
        OrderID: OrderID
      });
    });
  });
});



// =================== PUT Update Order =================== //
app.put('/orders/update', (req, res) => {
  const { OrderID, ...fieldsToUpdate } = req.body;

  if (!OrderID) {
    return res.status(400).json({ error: "OrderID is required" });
  }

  const keys = Object.keys(fieldsToUpdate);
  if (keys.length === 0) {
    return res.status(400).json({ error: "No update fields provided" });
  }

  db.get('SELECT * FROM orders WHERE OrderID = ?', [OrderID], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: `Order with ID ${OrderID} not found` });

    const setClause = keys.map(field => `${field} = ?`).join(', ');
    const values = keys.map(field => fieldsToUpdate[field]);
    values.push(OrderID);

    const sql = `UPDATE orders SET ${setClause} WHERE OrderID = ?`;

    db.run(sql, values, function(err) {
      if (err) return res.status(500).json({ error: err.message });

      res.json({
        message: "Following properties of order updated successfully",
        ...fieldsToUpdate
      });
    });
  });
});

// =================== PUT Update Customer =================== //
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

// =================== DELETE Order =================== //
app.delete('/orders/delete', (req, res) => {
  const { OrderID } = req.body;

  if (!OrderID) {
    return res.status(400).json({ error: "OrderID is required" });
  }

  db.run('DELETE FROM orders WHERE OrderID = ?', [OrderID], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) {
      return res.status(404).json({ error: `Order with ID ${OrderID} not found` });
    }

    res.json({
      message: "Order deleted successfully",
      OrderID: OrderID
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


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
