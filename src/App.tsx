import "./App.css";
import { useEffect, useState } from "react";

type SummaryCardProps = {
  title: string;
  stats: string[];
};

type GraphBar = {
  height: string;
  label: string;
};

type GraphCardProps = {
  title: string;
  bars: GraphBar[];
  caption: string;
};

type CheckIn = {
  id: string;
  createdAt: string;
  hour?: number;
  focusLevel: number;
  energyLevel: number;
};

type RatingField = "energyLevel" | "focusLevel";

function loadCheckIns(): CheckIn[] {
  const savedCheckIns = localStorage.getItem("checkIns");

  if (!savedCheckIns) {
    return [];
  }

  try {
    return JSON.parse(savedCheckIns) as CheckIn[];
  } catch {
    return [];
  }
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function getAverage(checkIns: CheckIn[], field: RatingField): number | null {
  if (checkIns.length === 0) {
    return null;
  }

  let sum = 0;

  for (const checkIn of checkIns) {
    sum += checkIn[field];
  }

  return sum / checkIns.length;
}

function averageToOutput(average: number | null, field: RatingField): string {
  const currField = field.replace("Level", "")
  if (average === null) {
    return `Average ${currField}: --`;
  }

  return `Average ${currField}: ${average.toFixed(1)}/5`;
}

function averageToBarHeight(average: number | null): string {
  if (average === null) {
    return "0%";
  }

  return `${(average / 5) * 100}%`;
}

function getCheckInHour(checkIn: CheckIn): number {
  return checkIn.hour ?? new Date(checkIn.createdAt).getHours();
}

function formatHour(hour: number): string {
  const date = new Date();
  date.setHours(hour, 0, 0, 0);

  return date.toLocaleTimeString([], { hour: "numeric" });
}

function getHourlyAverageBars(
  checkIns: CheckIn[],
  field: RatingField
): GraphBar[] {
  const latestHours = Array.from(
    new Set(checkIns.map((checkIn) => getCheckInHour(checkIn)))
  ).slice(0, 8);

  return latestHours.map((hour) => {
    const hourlyCheckIns = checkIns.filter(
      (checkIn) => getCheckInHour(checkIn) === hour
    );

    return {
      height: averageToBarHeight(getAverage(hourlyCheckIns, field)),
      label: formatHour(hour),
    };
  });
}

function SummaryCard({ title, stats }: SummaryCardProps) {
  return (
    <div className="card summary-card">
      <h2>{title}</h2>

      {stats.map((stat) => (
        <p key={stat}>{stat}</p>
      ))}
    </div>
  );
}

function GraphCard({ title, bars, caption }: GraphCardProps) {
  return (
    <div className="card graph-card">
      <h2>{title}</h2>

      <div className="graph-placeholder">
        {bars.map((bar) => (
          <div className="bar-group" key={`${title}-${bar.label}`}>
            <div
              className="bar"
              style={{ height: bar.height }}
            ></div>
            <span className="bar-label">{bar.label}</span>
          </div>
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
  const [checkIns, setCheckIns] = useState<CheckIn[]>(loadCheckIns);

  const totalChecks = checkIns.length;
  const averageFocus = getAverage(checkIns, "focusLevel")
  const averageEnergy = getAverage(checkIns, "energyLevel")
  const graphData: GraphCardProps[] = [
    {
      title: "Focus by Hour",
      bars: getHourlyAverageBars(checkIns, "focusLevel"),
      caption: averageToOutput(averageFocus, "focusLevel"),
    },
    {
      title: "Energy by Hour",
      bars: getHourlyAverageBars(checkIns, "energyLevel"),
      caption: averageToOutput(averageEnergy, "energyLevel"),
    },
  ];

  const summaryData: SummaryCardProps[] = [
  {
    title: "Today's Summary",
    stats: [
      `Check ins logged: ${totalChecks}`,
      `${averageToOutput(averageFocus, "focusLevel")}`,
      `${averageToOutput(averageEnergy, "energyLevel")}`,
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

  useEffect(() => {
    localStorage.setItem("checkIns", JSON.stringify(checkIns));
  }, [checkIns]);

  useEffect(() => {
    if (!isTimerRunning) return;

    const intervalId = window.setInterval(() => {
      setTimerSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isTimerRunning]);

  function handleAddCheckIn() {
    const newCheckIn: CheckIn = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      hour: new Date().getHours(),
      focusLevel,
      energyLevel,
    };

    setCheckIns((currentCheckIns) => [newCheckIn, ...currentCheckIns]);

    const messages: string[] = [
      `Great check-in! Focus: ${focusLevel}/5, Energy: ${energyLevel}/5 ✓`,
      `Logged! You're at ${focusLevel} focus and ${energyLevel} energy.`,
      `Check-in recorded for focus ${focusLevel} and energy ${energyLevel}!`,
      "Perfect! Your levels are saved.",
    ];

    const randomIndex = Math.floor(Math.random() * messages.length);

    setCheckInMessage(messages[randomIndex]);
    window.setTimeout(() => setCheckInMessage(""), 3000);
  }

  function handleClearCheckIns() {
    setCheckIns([]);
    localStorage.removeItem("checkIns");
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
        <h2>Check-In History</h2>

        {checkIns.length > 0 && (
          <button className="counter" onClick={handleClearCheckIns}>
            Clear History
          </button>
        )}

        {checkIns.length === 0 ? (
          <p>No check-ins yet. Add your first one above.</p>
        ) : (
          <div className="history-list">
            {checkIns.map((checkIn) => (
              <div className="history-item" key={checkIn.id}>
                <p>
                  <strong>
                    {new Date(checkIn.createdAt).toLocaleString()}
                  </strong>
                </p>
                <p>Focus: {checkIn.focusLevel}/5</p>
                <p>Energy: {checkIn.energyLevel}/5</p>
              </div>
            ))}
          </div>
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
