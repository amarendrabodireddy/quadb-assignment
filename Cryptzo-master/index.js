const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const { Sequelize, DataTypes } = require("sequelize");
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3009;

//Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use("/", express.static(__dirname + "/public")); 

const isProduction = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL;

console.log(databaseUrl);
console.log(process.env.DATABASE_URL);
console.log(process.env.LOCAL_DATABASE_URL);

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: isProduction ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {}
});

const Ticker = sequelize.define("Ticker", {
  name: { type: DataTypes.STRING },
  last: { type: DataTypes.FLOAT },
  buy: { type: DataTypes.FLOAT },
  sell: { type: DataTypes.FLOAT },
  volume: { type: DataTypes.FLOAT },
  base_unit: { type: DataTypes.STRING },
});

const fetchData = async () => {
  try {
    const response = await axios.get(
      "https://api.wazirx.com/api/v2/tickers",
    );
    const data = response.data;
    // console.log(data);
    const top10 = Object.values(data).slice(0, 10);
    // console.log(top10);

    await Ticker.sync({ force: true });
    for (const item of top10) {
      await Ticker.create({
        name: item.name,
        last: item.last,
        buy: item.buy,
        sell: item.sell,
        volume: item.volume,
        base_unit: item.base_unit,
      });
    }
  } catch (err) {
    console.log("there is an error : ", err);
  }
};

app.get("/api/tickers", async (req, res) => {
  try {
    const tickers = await Ticker.findAll();
    console.log(tickers);
    console.log(process.env.DATABASE_URL);
    res.send(tickers);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching data");
  }
});

//start server
app.listen(port, () => {
  console.log(`Server is up 👾🧮🚀✅ and is running on https://localhost: ${port}`);
  fetchData();
});
