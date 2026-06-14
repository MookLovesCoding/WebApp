import "./App.css";
import { useEffect, useState } from "react";

const summaryData = [
  {
    title: "Today's Summary",
    stats: [
      "Average focus: 4",
      "Average energy: 3",
      "Total focus time: 45 minutes",
    ],
  },
  {
    title: "Weekly Summary",
    stats: [
      "Average focus: 3.8",
      "Average energy: 3.2",
      "Total focus time: 285 minutes",
    ],
  },
  {
    title: "Monthly Summary",
    stats: [
      "Average focus: 3.6",
      "Average energy: 3.1",
      "Total focus time: 1200 minutes",
    ],
  },
];

const graphData = [
  {
    title: "Focus by Hour",
    bars: ["40%", "70%", "55%", "85%", "60%"],
    caption: "Placeholder chart for average focus levels.",
  },
  {
    title: "Energy by Hour",
    bars: ["65%", "50%", "75%", "45%", "80%"],
    caption: "Placeholder chart for average energy levels.",
  },
];

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function SummaryCard({ title, stats }) {
  return (
    <div className="card summary-card">
      <h2>{title}</h2>

      {stats.map((stat) => (
        <p key={stat}>{stat}</p>
      ))}
    </div>
  );
}

function GraphCard({ title, bars, caption }) {
  return (
    <div className="card graph-card">
      <h2>{title}</h2>

      <div className="graph-placeholder">
        {bars.map((height, index) => (
          <div
            key={`${title}-${index}`}
            className="bar"
            style={{ height }}
          ></div>
        ))}
      </div>

      <p className="graph-caption">{caption}</p>
    </div>
  );
}

function App() {
  const [focusLevel, setFocusLevel] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [checkInMessage, setCheckInMessage] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    if (!isTimerRunning) return;

    const intervalId = setInterval(() => {
      setTimerSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isTimerRunning]);

  function handleAddCheckIn() {
    const messages = [
      `Great check-in! Focus: ${focusLevel}/5, Energy: ${energyLevel}/5 ✓`,
      `Logged! You're at ${focusLevel} focus and ${energyLevel} energy.`,
      `Check-in recorded for focus ${focusLevel} and energy ${energyLevel}!`,
      "Perfect! Your levels are saved.",
    ];

    const randomIndex = Math.floor(Math.random() * messages.length);

    setCheckInMessage(messages[randomIndex]);
    setTimeout(() => setCheckInMessage(""), 3000);
  }

  function handleStartTimer() {
    setIsTimerRunning(true);
  }

  function handleStopTimer() {
    setIsTimerRunning(false);
  }

  function handleResetTimer() {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  }

  return (
    <main className="app">
      <header>
        <h1>FocusFlow</h1>
        <p>Track your focus and energy throughout the day.</p>
      </header>

      <section className="card">
        <h2>Quick Check-In</h2>

        <div className="slider-group">
          <div className="slider-item">
            <label htmlFor="focus-slider">Focus Level: {focusLevel}/5</label>
            <input
              id="focus-slider"
              type="range"
              min="1"
              max="5"
              value={focusLevel}
              onChange={(event) => setFocusLevel(Number(event.target.value))}
              className="slider"
            />
          </div>

          <div className="slider-item">
            <label htmlFor="energy-slider">Energy Level: {energyLevel}/5</label>
            <input
              id="energy-slider"
              type="range"
              min="1"
              max="5"
              value={energyLevel}
              onChange={(event) => setEnergyLevel(Number(event.target.value))}
              className="slider"
            />
          </div>
        </div>

        <button className="counter" onClick={handleAddCheckIn}>
          Add Check-In
        </button>

        {checkInMessage && (
          <p className="check-in-message">{checkInMessage}</p>
        )}
      </section>

      <section className="card">
        <h2>Timer</h2>

        <p className="timer-display">{formatTime(timerSeconds)}</p>

        <div className="button-row">
          <button className="counter" onClick={handleStartTimer}>
            Start
          </button>

          <button className="counter" onClick={handleStopTimer}>
            Stop
          </button>

          <button className="counter" onClick={handleResetTimer}>
            Reset
          </button>
        </div>
      </section>

      <section className="summaries">
        {summaryData.map((summary) => (
          <SummaryCard
            key={summary.title}
            title={summary.title}
            stats={summary.stats}
          />
        ))}
      </section>

      <section className="graphs">
        {graphData.map((graph) => (
          <GraphCard
            key={graph.title}
            title={graph.title}
            bars={graph.bars}
            caption={graph.caption}
          />
        ))}
      </section>
    </main>
  );
}

export default App;