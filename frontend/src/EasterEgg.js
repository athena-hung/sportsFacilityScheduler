import React, { useState, useEffect } from 'react';
import './EasterEgg.css';

const EasterEgg = () => {
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBounce(prev => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="easter-egg-container">
      <div className={`tennis-ball ${bounce ? 'bounce' : ''}`}>🎾</div>
      <h1>You found the secret court!</h1>
      <p>Legend has it that on this court, every serve is an ace...</p>
      <p className="secret-message">But shhh... don't tell anyone! 🤫</p>
    </div>
  );
};

export default EasterEgg; 