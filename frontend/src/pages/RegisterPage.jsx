import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', password2: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const { setUser } = useAuthStore()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({}); setLoading(true)
    if (form.password !== form.password2) {
      setErrors({ password2: 'Passwords do not match' })
      setLoading(false); return
    }
    try {
      const { data } = await api.post('/auth/register/', form)
      localStorage.setItem('access',  data.access)
      localStorage.setItem('refresh', data.refresh)
      setUser(data.user)
      navigate('/dashboard')
    } catch (err) {
      const d = err.response?.data || {}
      setErrors(typeof d === 'object' ? d : { general: String(d) })
    } finally {
      setLoading(false)
    }
  }

  const field = (name, label, type = 'text', placeholder = '') => (
    <div className="form-group">
      <label className="form-label" htmlFor={name}>{label}</label>
      <input
        id={name} name={name} type={type}
        className={`form-input ${errors[name] ? 'input-error' : ''}`}
        placeholder={placeholder}
        value={form[name]}
        onChange={handleChange}
        required={['username','email','password','password2'].includes(name)}
      />
      {errors[name] && <span className="form-error">{errors[name]}</span>}
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-orb orb-1" />
      <div className="auth-orb orb-2" />
      <div className="auth-orb orb-3" />

      <div className="auth-card auth-card-wide auth-card--visible">
        <div className="auth-header">
          <div className="auth-logo">⚡</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join Ethara Lite today</p>
        </div>

        {errors.general && (
          <div className="alert alert-danger"><span>⚠</span> {errors.general}</div>
        )}

        <form onSubmit={handleSubmit} id="register-form">
          <div className="form-row">
            {field('first_name', 'First Name', 'text', 'John')}
            {field('last_name',  'Last Name',  'text', 'Doe')}
          </div>
          {field('username', 'Username', 'text', 'johndoe')}
          {field('email',    'Email',    'email', 'john@example.com')}
          <div className="form-row">
            {field('password',  'Password',        'password', '••••••••')}
            {field('password2', 'Confirm Password','password', '••••••••')}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
            disabled={loading}
            id="register-submit"
          >
            {loading ? <><span className="btn-spinner" /> Creating account…</> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
