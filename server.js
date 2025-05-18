const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (Docker network hostname is "mongo")
mongoose.connect('mongodb://mongo:27017/todos', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Define Todo model
const Todo = mongoose.model('Todo', new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false }
}));

// Routes

// Get all todos
app.get('/api/todos', async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Add a new todo
app.post('/api/todos', async (req, res) => {
  try {
    const newTodo = new Todo({
      text: req.body.text,
      completed: false
    });
    await newTodo.save();
    res.status(201).json(newTodo);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create todo' });
  }
});

// Toggle completion
app.put('/api/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    todo.completed = !todo.completed;
    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete a todo
app.delete('/api/todos/:id', async (req, res) => {
  try {
    const result = await Todo.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Todo not found' });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
