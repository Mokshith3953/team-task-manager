const express = require('express');
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId }).populate('assignedTo', 'name email role');
    res.json(tasks);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const { title, description, assignedTo, project, dueDate } = req.body;
  if (!title || !project) return res.status(400).json({ error: 'Title and project are required' });
  try {
    const task = new Task({
      title,
      description,
      assignedTo: assignedTo || undefined,
      project,
      dueDate: dueDate || undefined,
    });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const project = await Project.findById(task.project);
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.id;
    const isProjectOwner = project && project.owner.toString() === req.user.id;
    const isProjectAdmin = project && project.members.some(
      m => m.user.toString() === req.user.id && m.role === 'admin'
    );
    if (!isAssigned && !isProjectOwner && !isProjectAdmin && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const project = await Project.findById(task.project);
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user.id;
    const isProjectOwner = project && project.owner.toString() === req.user.id;
    const isProjectAdmin = project && project.members.some(
      m => m.user.toString() === req.user.id && m.role === 'admin'
    );
    if (!isAssigned && !isProjectOwner && !isProjectAdmin && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;