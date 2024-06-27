import React from 'react';

interface TimeframeButtonsProps {
  setTimeframe: (timeframe: string) => void;
}

const TimeframeButtons: React.FC<TimeframeButtonsProps> = ({ setTimeframe }) => {
  return (
    <div>
      <button onClick={() => setTimeframe('day')}>Daily</button>
      <button onClick={() => setTimeframe('week')}>Weekly</button>
      <button onClick={() => setTimeframe('month')}>Monthly</button>
      <button onClick={() => setTimeframe('year')}>Yearly</button>
    </div>
  );
};

export default TimeframeButtons;
