import './App.css';
import UserForm from './UserForm';
import QuizPage from './pages/QuizPage';
import Results from './Results';
import ResultsTable from './components/ResultsTable';
import NewUser from './NewUser';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      {/* <nav style={{ marginBottom: 24 }}>
        <Link to="/">Quiz</Link>
        {' | '}
        <Link to="/results-table">Results Table</Link>
        {' | '}
        <Link to="/new">Add New User</Link>
      </nav> */}
      <Routes>
        <Route path="/" element={<UserForm />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/results" element={<Results />} />
        <Route path="/results-table" element={<ResultsTable />} />
        <Route path="/new" element={<NewUser />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
