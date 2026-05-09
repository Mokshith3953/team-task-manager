const express = require('express');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'Admin'
      ? {}
      : { $or: [{ owner: req.user.id }, { 'members.user': req.user.id }] };
    const projects = await Project.find(filter).populate('owner members.user');
    res.json(projects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  const { name, description, members } = req.body;
  try {
    const project = new Project({ name, description, owner: req.user.id, members });
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const isOwner = project.owner.toString() === req.user.id;
    const isProjectAdmin = project.members.some(
      m => m.user.toString() === req.user.id && m.role === 'admin'
    );
    if (!isOwner && !isProjectAdmin && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const isOwner = project.owner.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
