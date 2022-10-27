//Libraries ja semmoset
const mongoose = require("mongoose");

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

module.exports = InventorySchema;

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

module.exports = OrdersSchema;