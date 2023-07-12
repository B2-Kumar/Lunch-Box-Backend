const express = require('express')
const app = express()
const port = 5000
const mongoDB = require("./db");
mongoDB();
const cors = require("cors")
const { v4: uuid } = require("uuid");
const bodyparser = require('body-parser')
const stripe = require("stripe")("sk_test_51NJwRvSJu8nZs0KVHqnPLubSVMMpRWCCiT317uF8CBkteGJsZ9dgJ30V5ejxeSuC5ocQ9qic9G9luuw0zoZeR2PG00bHT6eG8J");

app.use(cors());
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  )
  next();
})

app.get('/', (req, res) => {
  res.send('Hello World!!')
})

app.use('/api', require("./Routes/CreatUser"));
app.use('/api', require("./Routes/DisplayData"));
app.use('/api', require("./Routes/OrderData"));

app.post("/payment", async (req, res) => {
  console.log("Request:", req.body);

  let error, status

  try {

    const { product, token } = req.body

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id
    })

    const key = uuidv4()

    const charge = await stripe.charges.create(
      {
        amount: product.price * 100,
        currency: "usd",
        customer: customer.id,
        receipt_email: token.email,
        description: `purchase the ${product.name}`,
        shipping: {
          name: token.card.name,
          address: {
            line1: token.card.address_line1,
            line2: token.card.address_line2,
            city: token.card.address_city,
            country: token.card.address_country,
            postal_code: token.card.address_zip,
          },
        },
      },
      {
        key,
      }
    );

    console.log("charge:", { charge });
    status = "success";

  } catch (error) {
    console.log(error)
    status = "failure"
  }

  res.json({ error, status });

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
