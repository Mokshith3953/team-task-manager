import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from './Navbar';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [addingMemberFor, setAddingMemberFor] = useState(null);
  const [newMemberId, setNewMemberId] = useState('');
  const [error, setError] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchProjects = async () => {
    const res = await api.get('/api/projects');
    setProjects(res.data);
  };

  useEffect(() => {
    const init = async () => {
      await fetchProjects();
      const usersRes = await api.get('/api/users');
      setUsers(usersRes.data);
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/projects', { name, description, members: selectedMembers });
      setName('');
      setDescription('');
      setSelectedMembers([]);
      await fetchProjects();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create project');
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    try {
      await api.delete(`/api/projects/${projectId}`);
      await fetchProjects();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete project');
    }
  };

  const handleAddMember = async (projectId) => {
    if (!newMemberId) return;
    const project = projects.find(p => p._id === projectId);
    const existingIds = project.members.map(m => m.user?._id || m.user);
    try {
      await api.put(`/api/projects/${projectId}`, { members: [...existingIds, newMemberId] });
      setAddingMemberFor(null);
      setNewMemberId('');
      await fetchProjects();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add member');
    }
  };

  const toggleMember = (userId) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  return (
    <>
      <Navbar />
      <div className="container">
        <h1 className="page-title">Projects</h1>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="grid-2">
          <div>
            <h2 className="section-title" style={{ marginBottom: '1rem' }}>Create Project</h2>
            <div className="card">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Project Name</label>
                  <input type="text" placeholder="My Project" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea placeholder="What's this project about?" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                {users.filter(u => u._id !== currentUser.id).length > 0 && (
                  <div className="form-group">
                    <label>Add Members</label>
                    <div className="member-checklist">
                      {users.filter(u => u._id !== currentUser.id).map(u => (
                        <label key={u._id} className="member-check-item">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(u._id)}
                            onChange={() => toggleMember(u._id)}
                          />
                          <span>{u.name} <span className="text-muted">({u.role})</span></span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <button type="submit" className="btn btn-primary">Create Project</button>
              </form>
            </div>
          </div>

          <div>
            <div className="section-header">
              <h2 className="section-title">My Projects</h2>
            </div>
            {projects.length === 0 ? (
              <div className="empty-state"><p>No projects yet. Create one to get started.</p></div>
            ) : (
              projects.map(project => (
                <div key={project._id} className="project-item">
                  <div className="project-info">
                    <div className="project-name">
                      <Link to={`/tasks/${project._id}`}>{project.name}</Link>
                    </div>
                    {project.description && <p className="project-desc">{project.description}</p>}
                    <div className="member-tags">
                      <span className="member-tag owner-tag">{project.owner?.name} (owner)</span>
                      {project.members.map(m => (
                        <span key={m.user?._id} className={`member-tag${m.role === 'admin' ? ' admin-tag' : ''}`}>
                          {m.user?.name} {m.role === 'admin' ? '(admin)' : '(member)'}
                        </span>
                      ))}
                    </div>

                    {addingMemberFor === project._id && (
                      <div className="add-member-row">
                        <select
                          value={newMemberId}
                          onChange={(e) => setNewMemberId(e.target.value)}
                          style={{ flex: 1 }}
                        >
                          <option value="">Select user...</option>
                          {users
                            .filter(u => u._id !== project.owner?._id && !project.members.find(m => (m.user?._id || m.user) === u._id))
                            .map(u => (
                              <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                        <button className="btn btn-primary btn-sm" onClick={() => handleAddMember(project._id)}>Add</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => { setAddingMemberFor(null); setNewMemberId(''); }}>Cancel</button>
                      </div>
                    )}
                  </div>

                  <div className="project-actions">
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => {
                        setAddingMemberFor(addingMemberFor === project._id ? null : project._id);
                        setNewMemberId('');
                      }}
                    >
                      + Member
                    </button>
                    <Link to={`/tasks/${project._id}`} className="btn btn-sm btn-secondary">View Tasks</Link>
                    {(currentUser.role === 'Admin' || project.owner?._id === currentUser.id) && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project._id)}>Delete</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Projects;
