import { useState, useEffect, useMemo } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

export default function ProjectsPage() {
  const { user: me } = useAuthStore()
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all | planning | active | completed | on_hold
  const [toasting, setToasting] = useState(null)
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProject, setNewProject] = useState({
    title: '', description: '', status: 'planning', worker_ids: []
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [projRes, usersRes] = await Promise.all([
        api.get('/projects/'),
        api.get('/auth/users/')
      ])
      setProjects(projRes.data)
      setUsers(usersRes.data)
    } catch {
      toast('danger', 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  const toast = (type, text) => {
    setToasting({ type, text })
    setTimeout(() => setToasting(null), 3000)
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const { data } = await api.post('/projects/', newProject)
      setProjects([data, ...projects])
      setShowAddModal(false)
      setNewProject({ title: '', description: '', status: 'planning', worker_ids: [] })
      toast('success', `Project "${data.title}" deployed successfully.`)
    } catch (err) {
      toast('danger', err.response?.data?.detail || 'Failed to deploy project.')
    } finally {
      setCreating(false)
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      const { data } = await api.patch(`/projects/${id}/`, { status })
      setProjects(projects.map(p => p.id === id ? data : p))
      toast('success', 'Project status updated.')
    } catch {
      toast('danger', 'Failed to update status.')
    }
  }

  const filtered = useMemo(() => {
    let list = projects
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    }
    if (filter !== 'all') {
      list = list.filter(p => p.status === filter)
    }
    return list
  }, [projects, search, filter])

  const statusColors = {
    planning: 'var(--purple-400)',
    active: 'var(--success-color)',
    completed: 'var(--text-secondary)',
    on_hold: 'var(--warning-color)'
  }

  const getInitials = (u) => ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')) || u.username?.[0]?.toUpperCase() || '?'

  return (
    <div className="page-layout">
      <Navbar />
      <main className="main-content">
        <div className="container">

          <div className="page-header">
            <div>
              <h1 className="page-title">Projects</h1>
              <p className="page-subtitle">Deploy and manage workflow projects</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={fetchData}>
                ↺ Refresh
              </button>
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                + Deploy Project
              </button>
            </div>
          </div>

          {toasting && (
            <div className={`alert alert-${toasting.type}`} style={{ marginBottom: 20 }}>
              {toasting.type === 'success' ? '✓' : '⚠'} {toasting.text}
            </div>
          )}

          <div className="filter-bar">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                className="form-input search-input"
                placeholder="Search projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="tabs" style={{ marginBottom: 0 }}>
              {['all', 'planning', 'active', 'completed', 'on_hold'].map(f => (
                <button
                  key={f}
                  className={`tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f.replace('_', ' ').charAt(0).toUpperCase() + f.replace('_', ' ').slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Loading projects...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🚀</div>
              <h3>No projects found</h3>
              <p>Click "Deploy Project" to start your first project.</p>
            </div>
          ) : (
            <div className="projects-grid">
              {filtered.map(p => (
                <div key={p.id} className="project-card" style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', fontFamily: 'var(--font-display)' }}>{p.title}</h3>
                    <select 
                      value={p.status}
                      onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                      style={{
                        background: 'rgba(255,255,255,0.05)', border: 'none', color: statusColors[p.status],
                        fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer'
                      }}
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px', flex: 1 }}>
                    {p.description || 'No description provided.'}
                  </p>
                  
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>ASSIGNED WORKERS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {p.workers_details?.length > 0 ? p.workers_details.map(w => (
                        <div key={w.id} className="worker-badge" style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          background: 'rgba(255,255,255,0.05)', padding: '4px 10px',
                          borderRadius: '100px', fontSize: '12px'
                        }}>
                          <div style={{
                            width: '16px', height: '16px', borderRadius: '50%',
                            background: w.profile?.avatar_color || '#7c3aed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', color: '#fff'
                          }}>
                            {getInitials(w)}
                          </div>
                          {w.first_name || w.username}
                        </div>
                      )) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No workers assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Project Modal */}
          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">Deploy New Project</h2>
                  <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                </div>
                <form onSubmit={handleCreateProject}>
                  <div className="form-group">
                    <label className="form-label">Project Title</label>
                    <input className="form-input" required value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" rows="3" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select className="form-select" value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value})}>
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Assign Workers</label>
                    <div style={{
                      maxHeight: '150px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)',
                      padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)'
                    }}>
                      {users.filter(u => u.is_active).map(u => (
                        <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={newProject.worker_ids.includes(u.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setNewProject(prev => ({
                                ...prev, 
                                worker_ids: checked ? [...prev.worker_ids, u.id] : prev.worker_ids.filter(id => id !== u.id)
                              }))
                            }}
                          />
                          <div style={{
                            width: '20px', height: '20px', borderRadius: '50%',
                            background: u.profile?.avatar_color || '#7c3aed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#fff'
                          }}>
                            {getInitials(u)}
                          </div>
                          <span>{u.first_name} {u.last_name} (@{u.username})</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                            {u.profile?.designation}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={creating}>
                      {creating ? <><span className="btn-spinner"/> Deploying...</> : 'Deploy Project'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>

      <style>{`
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
      `}</style>
    </div>
  )
}
