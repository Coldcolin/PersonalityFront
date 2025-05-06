import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api/axios';

interface AxiosError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

const NewUser = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      await api.post('quiz/register-email', { email });
      setSuccess(true);
      setEmail('');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.response?.data?.error || 'Failed to register email');
    }
  };

  return (
    <div className="container">
      <h2>Register New User</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-control"
            placeholder="Enter email"
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">User registered successfully! Redirecting...</div>}
        <button type="submit" className="submit-button">
          Register User
        </button>
      </form>
    </div>
  );
};

export default NewUser; 