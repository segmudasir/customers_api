# Mudasir Customers API

This API allows you to get Orders, Products, Customers.

Base URL = https://customers-ecom-api.onrender.com

## Endpoints

- [Customers](#Customers)
- [Products](#Products)


## Customers

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
| 404 Not Found   | If specific ID or CustomerName or Country or City does not exists you will get this error. |

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

## Products

### Get Products

**`/products`**

Method: GET
Returns a list of Products.


This endpoint uses pagination to handle the returned results. Paginating the results ensures responses are easier to handle. Each response will indicate the total number of results, the current page, and the total number of pages.

**Parameters**

| Name        | Type    | In    | Required | Description                                                                                                | 
| ----------- | ------- | ----- | -------- | -----------------------------------------------------------------------------------------------------------| 
| `list`      | string  | query | Yes      | Specifies the list you want to retrieve. Must be one of: favourite-books, non-fiction, wishlist, fiction.  | 
| `page`      | integer | query | No       | Specifies the page you wish to retrive from the entire result set.                                         | 

**Status codes**

| Status code | Description |
|-----------------|-----------------------------------------------------|
| 200 OK          | Indicates a successful response.                    |
| 400 Bad Request | Indicates that the parameters provided are invalid. |

Example response:

```
{
    "status": "OK",
    "num_results": 17,
    "page": 1,
    "total_pages": 4,
    "results": [
        {
            "title": "Crush It!: Why NOW Is the Time to Cash In on Your Passion",
            "category": [
                "non-fiction"
            ],
            "type": "audio",
            "author": "Gary Vaynerchuk",
            "release_year": 2010,
            "rating": "7"
        },
        ...
    ]
]
```


## API Authentication

Some endpoints require authentication. 

The endpoints that require authentication expect the API key to be provided as a query parameter named `api-key`.
