# Mudasir Customers API

This API has two tables Customers, Orders.<br> 

User can add Customers, Get Customers, Update Customer and Delete Customers. (CRUD) Operations.<br> 

User can Create Orders, Get Orders, Update Orders and Delete Orders. (CRUD) Operations.<br> 

But Orders endpoint requires User Authentication. <br>

User need to get Access token first by Name and Email Address, this will give you access token.<br><br>

Base URL = https://customers-ecom-api.onrender.com

## Endpoints

- [Customers](#customers)
- [API Authentication](#api-authentication)
- [Orders](#orders)


## Customers
**Add Customer<br>**

**`/customers/add`**

**Method:** POST  
Also called CREATE Request - In this Method something is added or posted on the Server. Therefore usually we require a body.

Example Body:
```
{
  "CustomerID": 92,
  "CustomerName": "Maria Anders",
  "Gender": "Female",
  "Age": 35,
  "Address": "Obere Str. 57",
  "City": "Berlin",
  "PostalCode": "12209",
  "Country": "Germany"
}
```

**Status codes**

| Status code | Description |
|-----------------|-----------------------------------------------------|
| 201 Created          | Indicates that request has been submitted successfully.                    |
| 400 Bad Request  | If record with this CustomerID e.g., 92 already exists. Then following message should appear "Failed - Customer with ID 92 already exists". |


Example response:

```
{
    "Message": "Customer added successfully",
    "CustomerID": 92
}
```
**Get all Customers<br>**

**`/customers`**

**Method:** GET  
Also called Retrieve Request - Returns the list of all Customers from Server.

**Parameters**

| Name        | Type    | Parameter    | Required | Description                                                                                                | 
| ----------- | ------- | ----- | -------- | -----------------------------------------------------------------------------------------------------------| 
| `CustomerID`| integer | Query | Optional      | If you specify the CustomerID it will return only that Customer Record. If not Provided it will return all Customers records.  | 
| `CustomerName`      | string  | Query | Optional      | This is optional parameter. If you want to get specific Customer by providing CustomerName.                                         | 
| `Country`      | string  | Query | Optional      | It can be one of the following: Argentina, Austria, Belgium, Brazil, Canada, Denmark, Finland, France, Germany, Ireland, Italy, Mexico, Norway, Poland, Portugal, Spain, Sweden, Switzerland, UK, USA, Venezuela.                                         | 
| `City`      | string  | Query | Optional      | It can be one of the following: Aachen, Albuquerque, Anchorage, Barcelona, Barquisimeto, Bergamo, Berlin, Bern, Boise, Brandenburg, Bruxelles, Buenos Aires, Butte, Campinas, Caracas, Charleroi, Cork, Cowes, Cunewalde, Elgin, Eugene, Frankfurt a.M., Genève, Graz, Helsinki, I. de Margarita, Kirkland, Köln, København, Lander, Leipzig, Lille, Lisboa, London, Luleå, Lyon, Madrid, Mannheim, Marseille, México D.F., Montréal, München, Münster, Nantes, Oulu, Paris, Portland, Reggio Emilia, Reims, Resende, Rio de Janeiro, Salzgurg, San Cristóbal, San Francisco, São Paulo, Seattle, Sevilla, Stavern, Strasbourg, Stuttgart, Toulouse, Torino, Tsawassen, Vancouver, Versailles, Walla, Walla Walla, Århus.                                         | 
| `Gender`      | string  | Query | Optional      | It can be Male or Female.                                         | 

**Status codes**

| Status code | Description |
|-----------------|-----------------------------------------------------|
| 200 OK          | Indicates a successful response.                    |

Example response:

```
[
    {
        "CustomerID": 1,
        "CustomerName": "Maria Anders",
        "Gender": "Female",
        "Age": 31,
        "Address": "Obere Str. 57",
        "City": "Berlin",
        "PostalCode": "12209",
        "Country": "Germany"
    },
    {
        "CustomerID": 2,
        "CustomerName": "Ana Trujillo",
        "Gender": "Female",
        "Age": 50,
        "Address": "Avda. de la Constitución 2222",
        "City": "México D.F.",
        "PostalCode": "05021",
        "Country": "Mexico"
    }
]
```
**Get Single Customer or multiple Customers using Querry Parameters:<br>**

**`/customers?CustomerID`** <br>
<br>
**Status codes**

| Status code | Description |
|-----------------|-----------------------------------------------------|
| 200 OK          | Indicates a successful response.                    |
| 404 Not Found   | If specific ID or CustomerName or Country or City does not exists you will get this error. |

Note: Enter wrong CustomerID suppose 93. You will get message "Customer not found".

**Update Customers<br>**

**`/customers/update`**

**Method:** PUT  
Also called Update Request - In this method something or some property is updated on the Server. Therefore we require parameters that need to be changed.

Example Body:
```
{
  "CustomerID": 92,
  "Age": 34,
  "City": "Warsaw",
  "PostalCode": "31-127",
  "Country": "Poland"
}
```

**Status codes**

| Status code | Description |
|-----------------|-----------------------------------------------------|
| 200 OK          | Indicates that request has been submitted successfully.                    |
| 404 Not found  | If CustomerID does not exists you will get this error. |


Example response:

```
{
    "message": "Following properties of customer updated successfully",
    "Age": 34,
    "City": "Warsaw",
    "PostalCode": "31-127",
    "Country": "Poland"
}
```
Note: In above example on these properties were updated. So only those properties will be shown which were updated.

**Delete Customers<br>**

**`/customers/delete`**

**Method:** Delete  
Also called Delete Request - In this method records are deleted from the the Server. We need Body and CustomerID to be sent in the body as JSON format.

Example Body:
```
{
  "CustomerID": 92
}
```

**Status codes**

| Status code | Description |
|-----------------|-----------------------------------------------------|
| 200 OK          | Indicates that record has been deleted successfully.                    |
| 404 Not found  | If CustomerID does not exists you will get this error. |


Example response:

```
{
    "message": "Customer deleted successfully",
    "CustomerID": 92
}
```

## API Authentication

Some endpoints may require authentication. To submit or view an order, you need to register your API client and obtain an access token.

The endpoints that require authentication expect a bearer token sent in the Authorization header.

Example:

Authorization: Bearer YOUR TOKEN

### Register a new API client

**`/users`**

**Method:** POST  

**Parameters**

The request body needs to be in JSON format.

| Name          | Type   | In   | Required | Description                            |
| ------------- | ------ | ---- | -------- | -------------------------------------- |
| `Name`  | string | body | Yes      | The name of the API client.            |
| `Email` | string | body | Yes      | The email address of the API client. * |


* The email address DOES NOT need to be real. The email will not be stored on the server.

**Status codes**

| Status code     | Description                                                                       |
|-----------------|-----------------------------------------------------------------------------------|
| 201 Created     | Indicates that the client has been registered successfully.                       |
| 400 Bad Request | Indicates that the parameters provided are invalid.                               |
| 409 Conflict    | Indicates that an API client has already been registered with this email address. |

Example request body:

```
{
   "Name": "Postman",
   "Email": "maddy@example.com"
}
```

The response body will contain the access token.
