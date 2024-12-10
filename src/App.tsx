import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Calendar from './Calendar';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav>
            <Link to="/">Home</Link>
            <Link to="/calendar">Calendar</Link>
          </nav>
        </header>
        <Routes>
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/" element={<h1>Welcome to the Home Page</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
