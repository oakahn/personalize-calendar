import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  Navigate,
} from "react-router-dom";
import Calendar from "./Calendar";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <nav>
            <Link to="/"></Link>
            <Link to="/calendar"></Link>
          </nav>
        </header>
        <Routes>
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/" element={<Navigate to="/calendar" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
