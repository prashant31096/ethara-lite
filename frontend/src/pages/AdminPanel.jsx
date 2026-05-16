import { useState, useEffect, useMemo } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import axios from 'axios'
import useAuthStore from '../store/authStore'

export default function AdminPanel() {
  const { user: me } = useAuthStore()
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all') // all | admin | user | inactive
  const [toasting, setToasting] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [designations, setDesignations] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [newUser, setNewUser] = useState({
    first_name: '', last_name: '', username: '', email: '',
    password: '', is_staff: false, designation: ''
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchUsers()
    api.get('/auth/designations/').then(r => setDesignations(r.data)).catch(() => {})
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/auth/users/')
      setUsers(data)
    } catch {
      toast('danger', 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  const toast = (type, text) => {
    setToasting({ type, text })
    setTimeout(() => setToasting(null), 3000)
  }

  const toggleStaff = async (u) => {
    setUpdating(u.id)
    try {
      const { data } = await api.patch(`/auth/users/${u.id}/update/`, { is_staff: !u.is_staff })
      setUsers(prev => prev.map(x => x.id === data.id ? data : x))
      toast('success', `${data.username} is now ${data.is_staff ? 'Admin' : 'User'}.`)
    } catch (err) {
      toast('danger', err.response?.data?.detail || 'Failed to update role.')
    } finally {
      setUpdating(null)
    }
  }

  const toggleActive = async (u) => {
    setUpdating(u.id)
    try {
      const { data } = await api.patch(`/auth/users/${u.id}/update/`, { is_active: !u.is_active })
      setUsers(prev => prev.map(x => x.id === data.id ? data : x))
      toast('success', `${data.username} ${data.is_active ? 'activated' : 'deactivated'}.`)
    } catch (err) {
      toast('danger', err.response?.data?.detail || 'Failed to update status.')
    } finally {
      setUpdating(null)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      const { data } = await api.post('/auth/users/create/', newUser)
      setUsers([data, ...users])
      setShowAddModal(false)
      setNewUser({
        first_name: '', last_name: '', username: '', email: '',
        password: '', is_staff: false, designation: ''
      })
      toast('success', `User ${data.username} created successfully.`)
    } catch (err) {
      toast('danger', err.response?.data?.detail || 'Failed to create user.')
    } finally {
      setCreating(false)
    }
  }

  const filtered = useMemo(() => {
    let list = users
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.first_name + ' ' + u.last_name).toLowerCase().includes(q)
      )
    }
    if (filter === 'admin')    list = list.filter(u => u.is_staff || u.is_superuser)
    if (filter === 'user')     list = list.filter(u => !u.is_staff && !u.is_superuser)
    if (filter === 'inactive') list = list.filter(u => !u.is_active)
    return list
  }, [users, search, filter])

  const stats = {
    total:    users.length,
    admins:   users.filter(u => u.is_staff || u.is_superuser).length,
    active:   users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
  }

  const initials = (u) =>
    ((u.first_name?.[0] || '') + (u.last_name?.[0] || '')) || u.username?.[0]?.toUpperCase() || '?'

  return (
    <div className="page-layout">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* Header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">Admin Panel</h1>
              <p className="page-subtitle">Manage users, roles and account status</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={fetchUsers} id="refresh-users-btn">
                ↺ Refresh
              </button>
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                + Add User
              </button>
            </div>
          </div>

          {/* Toast */}
          {toasting && (
            <div className={`alert alert-${toasting.type}`} style={{ marginBottom: 20 }}>
              {toasting.type === 'success' ? '✓' : '⚠'} {toasting.text}
            </div>
          )}

          {/* Stats */}
          <div className="stats-grid">
            {[
              { label: 'Total Users',    value: stats.total,    icon: '👥' },
              { label: 'Admins',         value: stats.admins,   icon: '⚡' },
              { label: 'Active',         value: stats.active,   icon: '✅' },
              { label: 'Inactive',       value: stats.inactive, icon: '🚫' },
            ].map(s => (
              <div className="stat-card" key={s.label}>
                <div className="stat-icon">{s.icon}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="filter-bar">
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                id="user-search"
                className="form-input search-input"
                placeholder="Search by name, username or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="tabs" style={{ marginBottom: 0 }}>
              {['all','admin','user','inactive'].map(f => (
                <button
                  key={f}
                  className={`tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                  id={`filter-${f}`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p>Loading users…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👤</div>
              <h3>No users found</h3>
              <p>Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => {
                    const isMe = u.id === me?.id
                    const isBusy = updating === u.id
                    return (
                      <tr key={u.id} className={!u.is_active ? 'row-inactive' : ''}>
                        <td>
                          <div className="user-cell">
                            <div
                              className="table-avatar"
                              style={{ background: u.profile?.avatar_color || '#7c3aed' }}
                            >
                              {initials(u)}
                            </div>
                            <div>
                              <span className="user-cell-name">
                                {u.first_name} {u.last_name}
                                {isMe && <span className="you-badge">you</span>}
                              </span>
                              <span className="user-cell-uname">@{u.username}</span>
                            </div>
                          </div>
                        </td>
                        <td className="email-cell">{u.email || '—'}</td>
                        <td>
                          <span className={`role-chip ${u.is_superuser ? 'superuser' : u.is_staff ? 'staff' : 'user'}`}>
                            {u.is_superuser ? '👑 Super Admin' : u.is_staff ? '⚡ Admin' : '👤 User'}
                          </span>
                        </td>
                        <td className="date-cell">{u.date_joined}</td>
                        <td>
                          <span className={`status-dot ${u.is_active ? 'active' : 'inactive'}`}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            {!isMe && !u.is_superuser && (
                              <>
                                <button
                                  className={`btn btn-sm ${u.is_staff ? 'btn-warning' : 'btn-primary'}`}
                                  onClick={() => toggleStaff(u)}
                                  disabled={isBusy}
                                  id={`toggle-staff-${u.id}`}
                                  title={u.is_staff ? 'Demote to User' : 'Promote to Admin'}
                                >
                                  {isBusy ? <span className="btn-spinner" /> : u.is_staff ? '↓ Demote' : '↑ Promote'}
                                </button>
                                <button
                                  className={`btn btn-sm ${u.is_active ? 'btn-danger' : 'btn-secondary'}`}
                                  onClick={() => toggleActive(u)}
                                  disabled={isBusy}
                                  id={`toggle-active-${u.id}`}
                                  title={u.is_active ? 'Deactivate' : 'Activate'}
                                >
                                  {isBusy ? <span className="btn-spinner" /> : u.is_active ? '🚫 Deactivate' : '✅ Activate'}
                                </button>
                              </>
                            )}
                            {(isMe || u.is_superuser) && (
                              <span className="protected-label">
                                {isMe ? '(your account)' : '(protected)'}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Add User Modal */}
          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">Add New User</h2>
                  <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                </div>
                <form onSubmit={handleCreateUser}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input className="form-input" required value={newUser.first_name} onChange={e => setNewUser({...newUser, first_name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input className="form-input" required value={newUser.last_name} onChange={e => setNewUser({...newUser, last_name: e.target.value})} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input className="form-input" required value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" type="email" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input className="form-input" type="password" required minLength={6} value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Role</label>
                      <select className="form-select" value={newUser.is_staff} onChange={e => setNewUser({...newUser, is_staff: e.target.value === 'true'})}>
                        <option value="false">User / Worker</option>
                        <option value="true">Admin</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Designation</label>
                      <select className="form-select" value={newUser.designation} onChange={e => setNewUser({...newUser, designation: e.target.value})}>
                        <option value="">— Select —</option>
                        {designations.map(d => (
                          <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={creating}>
                      {creating ? <><span className="btn-spinner"/> Adding...</> : 'Add User'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
