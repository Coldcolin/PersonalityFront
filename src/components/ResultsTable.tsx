import { useEffect, useState } from 'react';
import api from '../api/axios';
import '../styles/ResultsTable.css';

interface User {
  name: string;
  email: string;
  course: string;
  result?: {
    traits: {
      [key: string]: number;
    };
    composites: {
      learningPotential: number;
      technicalAptitude: number;
      teamworkAbility: number;
    };
    recommendation: {
      learningStyle: string;
      strengthAreas: string[];
      developmentAreas: string[];
    };
  };
}

interface ApiResponse {
  users: User[];
}

export default function ResultsTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        console.log('Fetching results...');
        const { data } = await api.get<ApiResponse>('quiz/results');
        console.log('Results received:', data);
        setUsers(data.users);
        setFilteredUsers(data.users);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to fetch results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchEmail.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchEmail, users]);

  if (loading) return <div>Loading results...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="results-table-container">
      <h2>Assessment Results</h2>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="search-input"
        />
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Course</th>
              <th>Learning Potential</th>
              <th>Technical Aptitude</th>
              <th>Teamwork Ability</th>
              <th>Learning Style</th>
              <th>Key Strengths</th>
              <th>Development Areas</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, i) => (
              <tr key={i} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.course}</td>
                <td>{user.result?.composites.learningPotential}%</td>
                <td>{user.result?.composites.technicalAptitude}%</td>
                <td>{user.result?.composites.teamworkAbility}%</td>
                <td>{user.result?.recommendation.learningStyle}</td>
                <td>
                  {user.result?.recommendation.strengthAreas.map(s => 
                    s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
                  ).join(', ')}
                </td>
                <td>
                  {user.result?.recommendation.developmentAreas.map(s => 
                    s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ')
                  ).join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredUsers.length === 0 && (
        <div className="no-results">
          No results found
        </div>
      )}
    </div>
  );
} 