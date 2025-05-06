import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api/axios';
import './styles/UserForm.css';

interface ValidateEmailResponse {
  exists: boolean;
}

const courses = [
  { label: 'Frontend', value: 'Frontend' },
  { label: 'Backend', value: 'Backend' },
  { label: 'Product Design', value: 'Product Design' },
];

export default function UserForm() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [error, setError] = useState('');
  const [emailValid, setEmailValid] = useState<boolean|null>(null);
  const [validating, setValidating] = useState(false);

  async function validateEmail(emailToCheck: string) {
    if (!emailToCheck) {
      setEmailValid(null);
      return;
    }
    setValidating(true);
    try {
      const { data } = await api.get<ValidateEmailResponse>('quiz/validate-email', {
        params: { email: emailToCheck }
      });
      setEmailValid(data.exists);
    } catch (err) {
      setEmailValid(null);
    } finally {
      setValidating(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (email) {
        validateEmail(email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !course) {
      setError('Please fill in all fields.');
      return;
    }
    if (!emailValid) {
      setError('Please enter a registered email.');
      return;
    }
    
    // Store user info in localStorage
    const userInfo = { name, email, course };
    localStorage.setItem('quiz_user_info', JSON.stringify(userInfo));
    
    // Navigate to quiz page
    navigate('/quiz');
  }

  return (
    <div className="user-form">
      <h2>The Curve Africa</h2>
      <h3>Welcome! Start Your Assessment</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required 
            className="form-input"
            placeholder="Enter your full name"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="off"
            className="form-input"
            placeholder="Enter your email"
          />
          <div className="validation-message">
            {validating && (
              <div className="text-gray">Validating email...</div>
            )}
            {!validating && email && emailValid === false && (
              <div className="text-red">This email is not registered.</div>
            )}
            {!validating && email && emailValid === true && (
              <div className="text-green">Email is registered.</div>
            )}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Course</label>
          <select 
            value={course} 
            onChange={e => setCourse(e.target.value)} 
            required
            className="form-select"
          >
            <option value="">Select a course</option>
            {courses.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button 
          type="submit" 
          className="submit-button"
          disabled={validating || !emailValid}
        >
          Start Assessment
        </button>
      </form>
    </div>
  );
}
