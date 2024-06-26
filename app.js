const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const userRouter = require("./router/userRouter");
const expenseRouter = require("./router/expenseRouter");
const purchaseRouter = require("./router/purhaseMembershipRouter");
const premiumFeatures = require("./router/premiumFeaturesRouter");
const forgotPasswordRouter = require("./router/resetPassword");

const sequelize = require("./util/database");
const User = require("./models/userModel");
const Expense = require("./models/expenseModel");
const Order = require("./models/orders");

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use("/", userRouter);
app.use("/user/", userRouter);

app.use("/", expenseRouter);
app.use("/expense", expenseRouter);
app.use("/purchase", purchaseRouter);
app.use("/premium", premiumFeatures);
app.use("/password", forgotPasswordRouter);
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

sequelize
  .sync()
  .then((result) => {
    app.listen(4000);
  })
  .catch((err) => {
    console.log(err);
  });
