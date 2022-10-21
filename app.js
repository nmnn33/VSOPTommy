const PORT = process.env.PORT || 3000;
var express = require("express");
var app = express();    //express-moduuli
require("dotenv").config(); /* Haetaan ympäristömuuttujat .env tiedostosta */
const mongoose = require("mongoose");

//Bodyparser käyttöön REST-tyyppisten lomakkeiden asiointiin.
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Variables
var DbKäyttäjä = process.env.DB_USER    //From .env käyttis ja salasana
var DbSalasana = process.env.DB_PASS    //From .env käyttis ja salasana
//Tässä on meidän linkki MongoDB Atlakseen
const uri = "mongodb+srv://" + DbKäyttäjä + ":" + DbSalasana + "@cluster0.pbknvna.mongodb.net/VSOP_database?retryWrites=true&w=majority";


// Connecto to db
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Määritellään Inventory-niminen Schema, eli tietomalli taulukkoon tallennettavista olioista.
const InventorySchema = new mongoose.Schema({

    productName: String,
    productDescription: String,
    productType: String,
    quantity: Number,
    image: String,
    productDate: Date
});

//Määritellään InventorySchema => Model
const Inventory = mongoose.model(
    "Inventory",
    InventorySchema,
    "inventory"
);

// Määritellään Orders-niminen Schema, eli tietomalli taulukkoon tallennettavista olioista.
const OrdersSchema = new mongoose.Schema({

    firstName: String,
    lastName: String,
    phoneNumber: String,
    customerEmail: String,
    productsInfo: {
        type: Map,
        of: String,
        ref: "Inventory"
    },
    quantity: Number,
    price: Number,
    orderDate: Date,
    deliveryAddress: String,
    deliveryPostalCode: String,
    deliveryCity: String,
    billingAddress: String,
    billingPostalCode: String,
    billingCity: String,
    status: String,
    inventory_image: String
});

//Määritellään OrdersSchema => Model
const Orders = mongoose.model(
    "Orders",
    OrdersSchema,
    "orders"
);

//Polut alla
app.get("/", function (req, res) {
    res.send("Moro VSOP")
    console.log("Pääsivu")
});

//consoleen tuo kaikki Inventory dokumentit
app.get("/findInventory", function (req, res) {
    res.send('Find.')
    Inventory.find({}, null, { limit: 50 }, function (err, results) {
        if (err) {
            console.log("Järjestelmässä tapahtui virhe", 500);
        }
        // Muuten lähetetään tietokannan tulokset selaimelle 
        else {
            console.log(results + "From find")
            res.json(results);
        }
    });
});

//consoleen tuo yhden Inventory dokumentin productName mukaan, joka saadaan url
app.get("/findOneInventory/:productName", function (req, res) {
    res.send('FindProductname.')
    Inventory.find({ productName: req.params.productName }, function (err, results) {
        if (err) {
            console.log("Järjestelmässä tapahtui virhe", 500);
        }
        // Muuten lähetetään tietokannan tulokset selaimelle 
        else {
            console.log(results + "From findOne")
        }
    });
});

//Lisää yhden tuotteen Inventoryyn.
app.post("/addProduct", function (req, res) {
    var productNameAdd = req.body.name;
    var productDescriptionAdd = req.body.description;
    var productTypeAdd = req.body.type;
    var quantityAdd = req.body.quantity;
    var imageAdd = req.body.image;
    var datetime = new Date();
    console.log(datetime);

    const product = new Inventory({
        productName: productNameAdd,
        productDescription: productDescriptionAdd,
        productType: productTypeAdd,
        quantity: quantityAdd,
        image: imageAdd,
        productDate: datetime
    });
    try {
        console.log(product);
        product.save();
        res.send('Product added:' + productNameAdd)
    }
    catch (error) {
        console.log({ message: error.message });
    }
});

//consoleen tuo kaikki Orders dokumentit
app.get("/findOrders", function (req, res) {
    res.send('Find.')
    Orders.find({}, null, { limit: 50 }, function (err, results) {
        if (err) {
            console.log("Järjestelmässä tapahtui virhe", 500);
        }
        // Muuten lähetetään tietokannan tulokset selaimelle 
        else {
            console.log(results)
        }
    });
});

//consoleen tuo yhden order _id mukaan, joka saadaan url
app.get("/findOneOrders/:productName", function (req, res) {
    res.send('FindProductname.')
    Orders.find({ productName: req.params.productName }, function (err, results) {
        if (err) {
            console.log("Järjestelmässä tapahtui virhe", 500);
        }
        // Muuten lähetetään tietokannan tulokset selaimelle 
        else {
            console.log(results + "From findOne")
        }
    });
});

//Lisää yhden tilauksen, jossa on tällä kertaa vielä vain yksi tuote.
app.post("/addOrder", function (req, res) {
    var idString = req.body.inventory_id.toString();
    var ordertime = new Date();

    const newOrder = new Orders({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        customerEmail: req.body.customerEmail,
        productsInfo: {},
        quantity: req.body.quantity,
        price: req.body.price,
        orderDate: ordertime,
        deliveryAddress: req.body.deliveryAddress,
        deliveryPostalCode: req.body.deliveryPostalCode,
        billingAddress: req.body.billingAddress,
        billingPostalCode: req.body.billingPostalCode,
        status: req.body.status,
        inventory_image: req.body.inventory_image,
    });
    newOrder.productsInfo.set("productName", req.body.inventory_productName, "productId", idString);
    try {
        console.log(newOrder);
        newOrder.save();
        res.send('Ordered by:' + req.body.firstName)
    }
    catch (error) {
        console.log({ message: error.message });
    }
});

// Päivittää Id:n perusteella yhden order dokumentin nimen Junioriksi
app.put("updateOrder/:id", function (req, res) {
    var id = req.params.id;

    Orders.findByIdAndUpdate(id, { $set: { "productName": 'dallas' } }, function (err, results) {
        // Tietokantavirheen käsittely 
        if (err) {
            console.log(err);
            res.json("Järjestelmässä tapahtui virhe.", 500);
        } // Tietokanta ok, mutta poistettavaa ei löydy. Onko kyseessä virhe vai ei on semantiikkaa
        else if (results == null) {
            res.json("id vastaavaa tiedostoa ei löydetty.", 200);
        } // Viimeisenä tilanne jossa kaikki ok
        else {
            console.log(results);
            res.json("Muutettu " + id + " " + results.name, 200);
        }
    });
});

// Poistaa Id:n perusteella yhden order dokumentin
app.delete("/deleteOrder/:id", function (req, res) {
    // Poimitaan id talteen ja välitetään se tietokannan poisto-operaatioon
    var id = req.params.id;

    Orders.findByIdAndDelete(id, function (err, results) {
        // Tietokantavirheen käsittely 
        if (err) {
            console.log(err);
        } // Tietokanta ok, mutta poistettavaa ei löydy. Onko kyseessä virhe vai ei on semantiikkaa
        else if (results == null) {
            console.log("Jotain meni pieleen" + "\n" + err);
        } // Viimeisenä tilanne jossa kaikki ok
        else {
            console.log(results);
            res.send("Poistettu tilaus: " + id);
        }
    });
});

//Web-palvelin
app.listen(PORT, function () {
    console.log("Portti avattu, serveri pystyssä: " + PORT);
});