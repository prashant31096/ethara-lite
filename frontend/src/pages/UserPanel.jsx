import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import api from '../api/axios'
import axios from 'axios'
import useAuthStore from '../store/authStore'

const AVATAR_COLORS = [
  '#7c3aed','#9333ea','#a855f7','#6d28d9','#4f46e5',
  '#0891b2','#0e7490','#059669','#d97706','#dc2626',
  '#db2777','#e11d48',
]

const TABS = ['Profile', 'Account Settings']

export default function UserPanel() {
  const { user, setUser } = useAuthStore()
  const [activeTab, setActiveTab]     = useState('Profile')
  const [designations, setDesignations] = useState([])
  const [saving, setSaving]           = useState(false)
  const [msg, setMsg]                 = useState(null) // {type, text}

  // Profile form
  const [profile, setProfile] = useState({
    first_name:   '',
    last_name:    '',
    email:        '',
    designation:  '',
    bio:          '',
    phone:        '',
    location:     '',
    avatar_color: '#7c3aed',
  })

  // Password form
  const [pwForm, setPwForm]   = useState({ old_password: '', new_password: '', confirm: '' })
  const [pwMsg,  setPwMsg]    = useState(null)
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setProfile({
        first_name:   user.first_name || '',
        last_name:    user.last_name  || '',
        email:        user.email      || '',
        designation:  user.profile?.designation  || '',
        bio:          user.profile?.bio          || '',
        phone:        user.profile?.phone        || '',
        location:     user.profile?.location     || '',
        avatar_color: user.profile?.avatar_color || '#7c3aed',
      })
    }
    api.get('/auth/designations/')
      .then(r => setDesignations(r.data))
      .catch(err => console.error('Failed to load designations:', err))
  }, [user])

  const showMsg = (type, text) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3500)
  }

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.patch('/auth/me/update/', profile)
      setUser(data)
      showMsg('success', 'Profile updated successfully!')
    } catch (err) {
      showMsg('danger', err.response?.data?.detail || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (pwForm.new_password !== pwForm.confirm) {
      setPwMsg({ type: 'danger', text: 'New passwords do not match.' })
      return
    }
    setPwSaving(true)
    try {
      await api.post('/auth/me/password/', {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      })
      setPwMsg({ type: 'success', text: 'Password changed successfully!' })
      setPwForm({ old_password: '', new_password: '', confirm: '' })
    } catch (err) {
      setPwMsg({ type: 'danger', text: err.response?.data?.detail || 'Failed to change password.' })
    } finally {
      setPwSaving(false)
    }
  }

  const initials = user
    ? ((user.first_name?.[0] || '') + (user.last_name?.[0] || '')) || user.username?.[0]?.toUpperCase()
    : '?'

  return (
    <div className="page-layout">
      <Navbar />
      <main className="main-content">
        <div className="container">

          {/* Page header */}
          <div className="page-header">
            <div>
              <h1 className="page-title">My Panel</h1>
              <p className="page-subtitle">Manage your profile & account settings</p>
            </div>
            <div className="role-area">
              <span className={`role-chip ${user?.is_superuser ? 'superuser' : user?.is_staff ? 'staff' : 'user'}`}>
                {user?.is_superuser ? '👑 Super Admin' : user?.is_staff ? '⚡ Admin' : '👤 User'}
              </span>
            </div>
          </div>

          {/* Global message */}
          {msg && (
            <div className={`alert alert-${msg.type}`} style={{ marginBottom: 20 }}>
              {msg.type === 'success' ? '✓' : '⚠'} {msg.text}
            </div>
          )}

          {/* Tabs */}
          <div className="tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
                id={`tab-${tab.toLowerCase().replace(' ', '-')}`}
              >
                {tab === 'Profile' ? '👤 Profile' : '🔐 Account Settings'}
              </button>
            ))}
          </div>

          {/* ── Profile Tab ─────────────────────────────────────────── */}
          {activeTab === 'Profile' && (
            <div className="panel-grid">
              {/* Avatar card */}
              <div className="card avatar-card">
                <div
                  className="big-avatar"
                  style={{ background: profile.avatar_color }}
                >
                  {initials}
                </div>
                <h3 className="avatar-name">
                  {profile.first_name || user?.username} {profile.last_name}
                </h3>
                <p className="avatar-username">@{user?.username}</p>
                {profile.designation && (
                  <span className="designation-badge">
                    {designations.find(d => d.value === profile.designation)?.label || profile.designation}
                  </span>
                )}
                {profile.location && (
                  <p className="avatar-meta">📍 {profile.location}</p>
                )}
                {profile.phone && (
                  <p className="avatar-meta">📞 {profile.phone}</p>
                )}

                {/* Color picker */}
                <div className="color-section">
                  <p className="color-label">Avatar Color</p>
                  <div className="color-grid">
                    {AVATAR_COLORS.map(c => (
                      <button
                        key={c}
                        className={`color-dot ${profile.avatar_color === c ? 'selected' : ''}`}
                        style={{ background: c }}
                        onClick={() => setProfile({ ...profile, avatar_color: c })}
                        title={c}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Profile form */}
              <div className="card profile-form-card">
                <h2 className="section-title" style={{ marginBottom: 20 }}>Edit Profile</h2>
                <form onSubmit={handleProfileSave} id="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input
                        className="form-input" value={profile.first_name}
                        onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                        placeholder="First name"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input
                        className="form-input" value={profile.last_name}
                        onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                        placeholder="Last name"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email" className="form-input" value={profile.email}
                      onChange={e => setProfile({ ...profile, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <select
                      className="form-select"
                      value={profile.designation}
                      onChange={e => setProfile({ ...profile, designation: e.target.value })}
                    >
                      <option value="">— Select Designation —</option>
                      {designations.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-textarea" value={profile.bio}
                      onChange={e => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell us a bit about yourself…"
                      rows={3} maxLength={300}
                    />
                    <span className="char-count">{profile.bio.length}/300</span>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input
                        className="form-input" value={profile.phone}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Location</label>
                      <input
                        className="form-input" value={profile.location}
                        onChange={e => setProfile({ ...profile, location: e.target.value })}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                    id="save-profile-btn"
                  >
                    {saving ? <><span className="btn-spinner" /> Saving…</> : '💾 Save Profile'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── Account Settings Tab ─────────────────────────────── */}
          {activeTab === 'Account Settings' && (
            <div className="card" style={{ maxWidth: 520 }}>
              <h2 className="section-title" style={{ marginBottom: 20 }}>Change Password</h2>

              {pwMsg && (
                <div className={`alert alert-${pwMsg.type}`} style={{ marginBottom: 16 }}>
                  {pwMsg.type === 'success' ? '✓' : '⚠'} {pwMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordSave} id="change-password-form">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password" className="form-input"
                    value={pwForm.old_password}
                    onChange={e => setPwForm({ ...pwForm, old_password: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password" className="form-input"
                    value={pwForm.new_password}
                    onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })}
                    placeholder="Min. 6 characters"
                    minLength={6} required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password" className="form-input"
                    value={pwForm.confirm}
                    onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                    placeholder="Repeat new password"
                    required
                  />
                </div>
                <button
                  type="submit" className="btn btn-primary"
                  disabled={pwSaving}
                  id="change-password-btn"
                >
                  {pwSaving ? <><span className="btn-spinner" /> Changing…</> : '🔐 Change Password'}
                </button>
              </form>

              {/* Account info section */}
              <hr className="divider" />
              <div className="info-rows">
                <div className="info-row">
                  <span className="info-label">Username</span>
                  <span className="info-val">@{user?.username}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Member Since</span>
                  <span className="info-val">{user?.date_joined}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Role</span>
                  <span className={`role-chip ${user?.is_superuser ? 'superuser' : user?.is_staff ? 'staff' : 'user'}`}>
                    {user?.is_superuser ? '👑 Super Admin' : user?.is_staff ? '⚡ Admin' : '👤 User'}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
