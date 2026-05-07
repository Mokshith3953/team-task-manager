import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from './Navbar';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsRes = await api.get('/api/projects');
        setProjects(projectsRes.data);
        const allTasks = [];
        for (const project of projectsRes.data) {
          const tasksRes = await api.get(`/api/tasks/project/${project._id}`);
          allTasks.push(...tasksRes.data);
        }
        setTasks(allTasks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const now = new Date();
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done');

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 className="page-title">Dashboard</h1>
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{projects.length}</div>
                <div className="stat-label">Projects</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{tasks.length}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#6B7280' }}>{tasks.filter(t => t.status === 'To Do').length}</div>
                <div className="stat-label">To Do</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#D97706' }}>{tasks.filter(t => t.status === 'In Progress').length}</div>
                <div className="stat-label">In Progress</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#059669' }}>{tasks.filter(t => t.status === 'Done').length}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-number" style={{ color: '#DC2626' }}>{overdueTasks.length}</div>
                <div className="stat-label">Overdue</div>
              </div>
            </div>

            <div className="grid-2">
              <div>
                <div className="section-header">
                  <h2 className="section-title">My Projects</h2>
                  <Link to="/projects" className="btn btn-primary btn-sm">+ New Project</Link>
                </div>
                {projects.length === 0 ? (
                  <div className="empty-state"><p>No projects yet. Create one to get started.</p></div>
                ) : (
                  projects.map(project => (
                    <div key={project._id} className="card">
                      <div className="card-header">
                        <h3 className="card-title">
                          <Link to={`/tasks/${project._id}`}>{project.name}</Link>
                        </h3>
                        <span className="text-muted" style={{ fontSize: '0.8rem' }}>{project.members.length} member(s)</span>
                      </div>
                      {project.description && (
                        <p className="text-muted" style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{project.description}</p>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div>
                <div className="section-header">
                  <h2 className="section-title">Overdue Tasks</h2>
                </div>
                {overdueTasks.length === 0 ? (
                  <div className="empty-state"><p>No overdue tasks. Great job!</p></div>
                ) : (
                  overdueTasks.map(task => (
                    <div key={task._id} className="card" style={{ borderLeft: '3px solid #EF4444' }}>
                      <div className="card-title">{task.title}</div>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#DC2626' }}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
