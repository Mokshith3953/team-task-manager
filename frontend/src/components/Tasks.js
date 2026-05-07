import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { useParams, Link } from 'react-router-dom';
import Navbar from './Navbar';

const statusClass = (status) => {
  const map = { 'To Do': 'badge-todo', 'In Progress': 'badge-inprogress', 'Done': 'badge-done' };
  return `badge ${map[status] || 'badge-todo'}`;
};

const Tasks = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [project, setProject] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchTasks = async () => {
    const res = await api.get(`/api/tasks/project/${projectId}`);
    setTasks(res.data);
  };

  useEffect(() => {
    const init = async () => {
      await fetchTasks();
      const [usersRes, projectsRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/projects'),
      ]);
      setUsers(usersRes.data);
      setProject(projectsRes.data.find(p => p._id === projectId) || null);
    };
    init();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/tasks', {
        title,
        description,
        assignedTo: assignedTo || undefined,
        project: projectId,
        dueDate: dueDate || undefined,
      });
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setDueDate('');
      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await api.put(`/api/tasks/${taskId}`, { status });
      await fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update task');
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/api/tasks/${taskId}`);
      await fetchTasks();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete task');
    }
  };

  const now = new Date();
  const isOwner = project?.owner?._id === currentUser.id;

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="breadcrumb">
          <Link to="/projects">← Projects</Link>
          <span className="page-title" style={{ margin: 0 }}>{project?.name || 'Tasks'}</span>
        </div>

        <div className="grid-2">
          <div>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>Create Task</h2>
            <div className="card">
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Task Title</label>
                  <input type="text" placeholder="Task name" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="Describe the task..." value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Assign To</label>
                  <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
                    <option value="">Unassigned</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </form>
            </div>
          </div>

          <div>
            <div className="section-header">
              <h2 className="section-title">Tasks ({tasks.length})</h2>
            </div>
            {tasks.length === 0 ? (
              <div className="empty-state"><p>No tasks yet. Create one to get started.</p></div>
            ) : (
              tasks.map(task => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'Done';
                const canModify = currentUser.role === 'Admin' || isOwner || task.assignedTo?._id === currentUser.id;
                return (
                  <div key={task._id} className={`task-item${isOverdue ? ' task-overdue' : ''}`}>
                    <div className="task-info">
                      <div className="task-title">{task.title}</div>
                      {task.description && <p className="task-meta">{task.description}</p>}
                      <div className="task-badges">
                        <span className={statusClass(task.status)}>{task.status}</span>
                        {task.assignedTo && (
                          <span className="task-meta" style={{ margin: 0 }}>→ {task.assignedTo.name}</span>
                        )}
                        {task.dueDate && (
                          <span className={isOverdue ? 'badge badge-overdue' : 'task-meta'} style={{ margin: 0 }}>
                            {isOverdue ? '⚠ Overdue: ' : 'Due: '}
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="task-actions">
                      <select
                        value={task.status}
                        onChange={(e) => updateStatus(task._id, e.target.value)}
                        className="status-select"
                        disabled={!canModify}
                      >
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>
                      {canModify && (
                        <button className="btn btn-danger btn-sm" onClick={() => deleteTask(task._id)}>Delete</button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Tasks;
