const express = require("express");
//db.js
const db = require("./db");
//router.js
const userRoutes = require("./router");

const PORT = Number(process.env.PORT) || 4000;

//speical permissions
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000"; 

const app = express();

//cors
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

//   JSON body
app.use(express.json());

//router.js
app.use("/api", userRoutes);

app.listen(PORT, () => {
  console.log(`we are running at port ${PORT}`);
});