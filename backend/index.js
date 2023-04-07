const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const express = require("express");
require('./models/index')
const bodyParser = require("body-parser");
const cors = require("cors");
const product = require("./routes/productRoute");//imported product route 
const cart = require("./routes/cartRoute");
 const user = require("./routes/userRoute");
 const order = require("./routes/orderRoute");
// const payment = require("./routes/paymentRoute");
const app = express();
let corsOptions={
  origin:"http://localhost:8080",
  credentials: true,
};
app.use(cors(corsOptions))
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/product", product);//product route
app.use("/api/cart", cart);
app.use("/api/user", user);
 app.use("/api/order", order);
// app.use("/api/payment", payment);

app.listen(process.env.PORT, () => {
  console.log(`Server is working on http://localhost:${process.env.PORT}`);
});
