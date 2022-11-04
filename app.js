//Asetukset
const PORT = process.env.PORT || 3000;
var express = require("express");
var app = express();    //express-moduuli
const mongoose = require("mongoose");
require("dotenv").config(); /* Haetaan ympäristömuuttujat .env tiedostosta */


//Bodyparser käyttöön REST-tyyppisten lomakkeiden asiointiin.
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Modelit Components/mongoDB.js tiedostosta
var schema1 = require('./Components/mongoDB.js');
//Määritellään InventorySchema => Model
const Inventory = mongoose.model(
    "Inventory",
    schema1,
    "inventory"
);
//Määritellään OrdersSchema => Model
const Orders = mongoose.model(
    "Orders",
    schema1,
    "orders"
);


//Polut alla
app.get("/", function (req, res) {
    res.send("Moro VSOP")
    console.log("Pääsivu")
});

//consoleen tuo kaikki Inventory dokumentit
app.get("/findInventory", function (req, res) {
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
    Inventory.find({ productName: "Simply Audio device" }, function (err, results) {
        if (err) {
            console.log("Järjestelmässä tapahtui virhe", 500);
            console.log(req.params.productName);
        }
        // Muuten lähetetään tietokannan tulokset selaimelle 
        else {
            console.log(results + "From findOne");
            console.log(req.params.productName);
            res.json(results);
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
    Orders.find({}, null, { limit: 50 }, function (err, results) {
        if (err) {
            console.log("Järjestelmässä tapahtui virhe", 500);
        }
        // Muuten lähetetään tietokannan tulokset selaimelle 
        else {
            console.log(results)
            res.json(results);
        }
    });
});

//consoleen tuo yhden order _id mukaan, joka saadaan url
app.get("/findOneOrders/:id", function (req, res) {
    Orders.findById({ _id: req.params.id }, function (err, results) {
        if (err) {
            console.log("Järjestelmässä tapahtui virhe", 500);
        }
        // Muuten lähetetään tietokannan tulokset selaimelle 
        else {
            console.log(results + "From findOne");
            res.json(results);
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

// Päivittää Id:n perusteella yhden order dokumentin nimen Junioriksi (ei toimi vielä)
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