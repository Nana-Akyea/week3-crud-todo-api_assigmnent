const express = require('express');
const app = express();
const cors = require('cors');
const logRequest = require('./middlewares/logger');
const validateTodo = require('./middlewares/validator');
const errorHandler = require('./middlewares/errorHandler');
const { validatePatchTodo } = require('./middlewares/validatePatch');
app.use(express.json()); // Parse JSON bodies

const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from this origin
  optionsSuccessStatus: 200, 
};

app.use(cors(corsOptions));
app.use(logRequest);

let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: true },
  { id: 3, task: 'Test API', completed: true },
  { id: 4, task: 'Deploy API', completed: false },
  { id: 5, task: 'Document API', completed: false },
];

// GET Completed Todos
app.get('/todos/completed', (req, res) => {
    const completedTodos = todos.filter((todo) => todo.completed === true);
    res.json(completedTodos);
});

app.get('/', (req, res) => {
  res.send('Welcome to the Todo API! Use /todos to access the list of todos.');
});

app.get('/todos', (req, res) => {
  res.json(todos); // Send all todos as JSON
});

// GET by ID – Read
app.get('/todos/:id', (req, res, next) => {
  try {
  const id = parseInt(req.params.id);
  if(isNaN(id)) {
    throw new Error('Invalid ID format');
  }
  const todo = todos.find((t) => t.id === id); // Send a single todo as JSON
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  res.json(todo);
} catch (error) {
  next(error);
}
});

// POST New – Create
app.post('/todos', validateTodo, (req, res, next) => {
  try {
  const { task, completed } = req.body;
  if (!task || task.length < 3 || task.length > 100) {    // Validate input
    return res.status(400).json({ error: 'Task must be between 3 and 100 characters' });
  }
  const newTodo = { id: todos.length + 1, ...req.body};
  todos.push(newTodo);
  res.status(201).json(newTodo); // Echo back
} catch (error) {
  next(error)};
});


// PATCH Update – Partial
app.patch('/todos/:id', validatePatchTodo, (req, res, next) => {
  try{
  const todo = todos.find((t) => t.id === parseInt(req.params.id)); // Array.find()
  if (!todo) return res.status(404).json({ message: 'Todo not found' });
  Object.assign(todo, req.body); // Merge: e.g., {completed: true}
  res.status(200).json(todo);
  } catch (error) {
    next(error);
  } 
});

// DELETE Remove
app.delete('/todos/:id', (req, res, next) => {
  try {
  const id = parseInt(req.params.id);
  const initialLength = todos.length;
  todos = todos.filter((t) => t.id !== id); // Array.filter() – non-destructive
  if (todos.length === initialLength)
    return res.status(404).json({ error: 'Not found' });
  res.status(204).send(); // Silent success
  } catch (error) {
    next(error);
  }
});

app.get('/todos/completed', (req, res, next) => {
  try {
    const completed = todos.filter((t) => t.completed);
    res.json(completed); // Custom Read!
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000; 

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
