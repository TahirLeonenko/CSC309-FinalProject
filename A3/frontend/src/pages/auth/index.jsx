import React, { useState, useContext, use } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import './style.css'
import { useQueryClient } from '@tanstack/react-query'

const API_BASE_URL = 'http://localhost:3000'

const Login = () => {
  const [credentials, setCredentials] = useState({
    utorid: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const returnTo = searchParams.get('returnTo') || '/'

  const queryClient = useQueryClient()

  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    queryClient.clear()

    try {
      console.log('Attempting login with URL:', `${API_BASE_URL}/auth/tokens`)
      const response = await fetch(`${API_BASE_URL}/auth/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
        mode: 'cors'
      })

      console.log('Login response status:', response.status)
      const data = await response.json()
      console.log('Login response data:', data)

      if (!response.ok) {
        // Server returned an error status code (400, 401, etc.)
        setError(data.error || `Error: ${response.status}`)
        return
      }
      // display a message
      alert('Login successful!')
      localStorage.setItem('access_token', data.token)

      console.log('Fetching user data with URL:', `${API_BASE_URL}/users/me`)
      const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${data.token}`,
        },
        credentials: 'include',
        mode: 'cors'
      })
      console.log('User data response status:', userResponse.status)
      const userData = await userResponse.json()
      console.log('User data:', userData)
      localStorage.setItem('userid', userData.id)
      localStorage.setItem('role', userData.role)
      localStorage.setItem('utorid', userData.utorid)
      if (returnTo !== '/') {
        navigate(returnTo, { replace: true })
      } else {
        if (userData.role === 'manager' || userData.role === 'superuser') {
          navigate('/manager', { replace: true })
        }
        if (userData.role === 'regular') {
          navigate('/regular', { replace: true })
        }
        if (userData.role === 'cashier') {
          navigate('/cashier', { replace: true })
        }
      }

      // Redirect to dashboard or home page
      //   navigate('/dashboard');
    } catch (err) {
      console.error('Login error details:', err)
      console.error('Error message:', err.message)
      console.error('Error stack:', err.stack)
      
      if (err.response) {
        // Server responded with an error
        setError(err.response.data.error || 'Login failed. Please try again.')
      } else if (err.request) {
        // No response received
        setError('Network error. Please check your connection.')
      } else {
        // Something else went wrong
        setError(`An unexpected error occurred: ${err.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <h1>Log In</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="utorid">UTorID</label>
            <input
              type="text"
              id="utorid"
              name="utorid"
              value={credentials.utorid}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="login-footer">
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
