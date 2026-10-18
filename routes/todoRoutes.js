const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const FILE = path.join(__dirname, "..", "data", "todos.json");

function readTodos() {
  return JSON.parse(fs.readFileSync(FILE, "utf-8"));
}

function writeTodos(todos) {
  fs.writeFileSync(FILE, JSON.stringify(todos, null, 2));
}

function checkTitle(req, res, next) {
  if (!req.body.title) {
    return res.status(400).json({ "Error": "Not Found" });
  }
  next();
}

const todos = readTodos();
router.post("/", checkTitle, (req, res) => {
  const todo = {
    // "..." Dùng để rải phần tử của mảng ra: Vd [1,2,5] => (1,2,5);
    // "map" Dùng để lấy mỗi key trong mảng
    id: todos.length ? Math.max(...todos.map(t => t.id)) + 1 : 1,
    title: req.body.title,
    description: req.body.description,
    topic: req.body.topic,
    deadline: req.body.deadline,
    time: req.body.time,
    done: req.body.done || false
  }

  todos.push(todo);
  writeTodos(todos);
  res.status(201).json(todo);
})

router.get("/", (req, res) => {
  res.status(200).json(todos);
})

router.get("/:id", (req, res) => {
  let todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "Not found" });
  res.status(200).json(todo);
})

router.patch("/:id", (req, res) => {
  let todo = todos.find(t => t.id === Number(req.params.id));
  if (!todo) return res.status(404).json({ error: "Not found" });
  Object.assign(todo, req.body);
  writeTodos(todos);
  res.status(200).json(todo);
})

router.delete("/:id", (req, res) => {
  let idx = todos.findIndex(t => t.id === Number(req.params.id));
  if (idx < 0) return res.status(404).json({ "error": "Not Found" });
  todos.splice(idx, 1);
  writeTodos(todos);
  res.status(200).end();
})

module.exports = router;
