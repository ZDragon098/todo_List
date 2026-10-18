const express = require("express");
const app = express();


function log(req, res, next) {
  console.log(req.method, req.url);
  next();
}
const todoRoutes = require("./routes/todoRoutes");
app.use(log);
app.use(express.static("public"));
app.use(express.json());
app.use("/todos", todoRoutes);
app.listen(3000, () => console.log("Chạy tại http://localhost:3000"));
