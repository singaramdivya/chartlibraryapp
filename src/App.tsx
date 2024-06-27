import React, { useState } from 'react';
import Chart from './components/Chart';
import {FaMoon} from 'react-icons/fa';
import './App.css';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className='head'>
      <h1>Interactive Chart</h1>
      <button onClick={toggleDarkMode} className="dark-mode-button">
        <FaMoon size={20}/> 
      </button>
      </div>
      <Chart isDarkMode={isDarkMode} />
    </div>
  );
};

export default App;
