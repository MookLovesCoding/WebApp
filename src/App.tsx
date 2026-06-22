import "./App.css";
import { useEffect, useRef, useState } from "react";

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

type CheckInNotification = {
  id: number;
  message: string;
  isClosing: boolean;
};

function loadCheckIns(): CheckIn[] {
  const savedCheckIns = localStorage.getItem("checkIns");

  if (!savedCheckIns) {
    return [];
  }

  return "Something went wrong.";
}

function getAverage(checkIns: CheckIn[], field: RatingField): number | null {
  if (checkIns.length === 0) {
    return null;
  }

  const sum = checkIns.reduce((total, checkIn) => total + checkIn[field], 0);

  return sum / checkIns.length;
}

function createDemoCheckIns(): CheckIn[] {
  const demoValues = [
    { hour: 9, focusLevel: 1, energyLevel: 5 },
    { hour: 10, focusLevel: 5, energyLevel: 1 },
    { hour: 11, focusLevel: 2, energyLevel: 4 },
    { hour: 12, focusLevel: 4, energyLevel: 2 },
    { hour: 13, focusLevel: 1, energyLevel: 3 },
    { hour: 14, focusLevel: 5, energyLevel: 1 },
    { hour: 15, focusLevel: 2, energyLevel: 5 },
    { hour: 16, focusLevel: 4, energyLevel: 2 },
  ];

  return demoValues.map((demoValue) => {
    const createdAt = new Date();
    createdAt.setHours(demoValue.hour, 0, 0, 0);

    return {
      id: crypto.randomUUID(),
      createdAt: createdAt.toISOString(),
      ...demoValue,
    };
  });
}

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return date;
}

function getStartOfWeek(): Date {
  const date = getStartOfToday();
  date.setDate(date.getDate() - date.getDay());

  return date;
}

function getStartOfMonth(): Date {
  const date = getStartOfToday();
  date.setDate(1);

  return date;
}

function filterCheckInsFromDate(checkIns: CheckIn[], startDate: Date): CheckIn[] {
  const startTime = startDate.getTime();

  return checkIns.filter(
    (checkIn) => new Date(checkIn.createdAt).getTime() >= startTime
  );
}

function getRatingLabel(field: RatingField): string {
  return field === "focusLevel" ? "focus" : "energy";
}

function averageToOutput(average: number | null, field: RatingField): string {
  if (average === null) {
    return `Average ${getRatingLabel(field)}: --`;
  }

  return `Average ${getRatingLabel(field)}: ${average.toFixed(1)}/5`;
}

function averageToBarHeight(average: number | null): string {
  if (average === null) {
    return "0%";
  }

  return `${(average / 5) * 100}%`;
}

function getCheckInHour(checkIn: CheckIn): number {
  return new Date(checkIn.createdAt).getHours();
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
  )
    .slice(0, 8)
    .sort((firstHour, secondHour) => firstHour - secondHour);

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

function getStartOfToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  return date;
}

function getStartOfWeek(): Date {
  const date = getStartOfToday();
  date.setDate(date.getDate() - date.getDay());

  return date;
}

function getStartOfMonth(): Date {
  const date = getStartOfToday();
  date.setDate(1);

  return date;
}

function filterCheckInsFromDate(checkIns: CheckIn[], startDate: Date): CheckIn[] {
  const startTime = startDate.getTime();

  return checkIns.filter(
    (checkIn) => new Date(checkIn.createdAt).getTime() >= startTime
  );
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
  )
    .slice(0, 8)
    .sort((firstHour, secondHour) => firstHour - secondHour);

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
  const [checkInNotification, setCheckInNotification] =
    useState<CheckInNotification | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckIn[]>(loadCheckIns);
  const notificationIdRef = useRef(0);
  const closeNotificationTimerRef = useRef<number | null>(null);
  const clearNotificationTimerRef = useRef<number | null>(null);

  const todaysCheckIns = filterCheckInsFromDate(checkIns, getStartOfToday());
  const weeklyCheckIns = filterCheckInsFromDate(checkIns, getStartOfWeek());
  const monthlyCheckIns = filterCheckInsFromDate(checkIns, getStartOfMonth());
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
      `Check ins logged: ${todaysCheckIns.length}`,
      `${averageToOutput(getAverage(todaysCheckIns, "focusLevel"), "focusLevel")}`,
      `${averageToOutput(getAverage(todaysCheckIns, "energyLevel"), "energyLevel")}`,
      `Current focus timer: ${formatTime(timerSeconds)}`,
    ],
  },
  {
    title: "Weekly Summary",
    stats: [
      `Check ins logged: ${weeklyCheckIns.length}`,
      `${averageToOutput(getAverage(weeklyCheckIns, "focusLevel"), "focusLevel")}`,
      `${averageToOutput(getAverage(weeklyCheckIns, "energyLevel"), "energyLevel")}`,
      `Current focus timer: ${formatTime(timerSeconds)}`,
    ],
  },
  {
    title: "Monthly Summary",
    stats: [
      `Check ins logged: ${monthlyCheckIns.length}`,
      `${averageToOutput(getAverage(monthlyCheckIns, "focusLevel"), "focusLevel")}`,
      `${averageToOutput(getAverage(monthlyCheckIns, "energyLevel"), "energyLevel")}`,
      `Current focus timer: ${formatTime(timerSeconds)}`,
    ],
  },
];

  useEffect(() => {
    localStorage.setItem("checkIns", JSON.stringify(checkIns));
  }, [checkIns]);

  useEffect(() => {
    if (!isTimerRunning) return;

    let animationFrameId = 0;
    const updateElapsedTime = () => {
      setTimerMilliseconds(
        timerBaseMillisecondsRef.current +
          performance.now() -
          timerStartedAtRef.current
      );
      animationFrameId = window.requestAnimationFrame(updateElapsedTime);
    };

    animationFrameId = window.requestAnimationFrame(updateElapsedTime);

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [isTimerRunning]);

  useEffect(() => {
    return () => {
      if (closeNotificationTimerRef.current !== null) {
        window.clearTimeout(closeNotificationTimerRef.current);
      }

      if (clearNotificationTimerRef.current !== null) {
        window.clearTimeout(clearNotificationTimerRef.current);
      }
    };
  }, []);

  function showCheckInNotification(message: string) {
    if (closeNotificationTimerRef.current !== null) {
      window.clearTimeout(closeNotificationTimerRef.current);
    }

    if (clearNotificationTimerRef.current !== null) {
      window.clearTimeout(clearNotificationTimerRef.current);
    }

    const notificationId = notificationIdRef.current + 1;
    notificationIdRef.current = notificationId;

    setCheckInNotification({
      id: notificationId,
      message,
      isClosing: false,
    });

    closeNotificationTimerRef.current = window.setTimeout(() => {
      setCheckInNotification((currentNotification) => {
        if (!currentNotification || currentNotification.id !== notificationId) {
          return currentNotification;
        }

        return { ...currentNotification, isClosing: true };
      });
    }, 2700);

    clearNotificationTimerRef.current = window.setTimeout(() => {
      setCheckInNotification((currentNotification) => {
        if (!currentNotification || currentNotification.id !== notificationId) {
          return currentNotification;
        }

        return null;
      });
    }, 3000);
  }

  function handleAddCheckIn() {
    const newCheckIn: CheckIn = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      hour: new Date().getHours(),
      focusLevel,
      energyLevel,
    };
  }, []);

  useEffect(() => {
    return () => {
      if (closeNotificationTimerRef.current !== null) {
        window.clearTimeout(closeNotificationTimerRef.current);
      }

      if (clearNotificationTimerRef.current !== null) {
        window.clearTimeout(clearNotificationTimerRef.current);
      }
    };
  }, []);

  function showCheckInNotification(message: string) {
    if (closeNotificationTimerRef.current !== null) {
      window.clearTimeout(closeNotificationTimerRef.current);
    }

    if (clearNotificationTimerRef.current !== null) {
      window.clearTimeout(clearNotificationTimerRef.current);
    }

    const notificationId = notificationIdRef.current + 1;
    notificationIdRef.current = notificationId;

    setCheckInNotification({
      id: notificationId,
      message,
      isClosing: false,
    });

    closeNotificationTimerRef.current = window.setTimeout(() => {
      setCheckInNotification((currentNotification) => {
        if (!currentNotification || currentNotification.id !== notificationId) {
          return currentNotification;
        }

        return { ...currentNotification, isClosing: true };
      });
    }, 2700);

    clearNotificationTimerRef.current = window.setTimeout(() => {
      setCheckInNotification((currentNotification) => {
        if (!currentNotification || currentNotification.id !== notificationId) {
          return currentNotification;
        }

        return null;
      });
    }, 3000);
  }

  async function handleAddCheckIn() {
    setIsSavingCheckIn(true);
    setCheckInError("");

    try {
      const newCheckIn = await createCheckIn({ focusLevel, energyLevel });

      setCheckIns((currentCheckIns) => [newCheckIn, ...currentCheckIns]);

      const messages: string[] = [
        `Great check-in! Focus: ${focusLevel}/5, Energy: ${energyLevel}/5`,
        `Logged! You're at ${focusLevel} focus and ${energyLevel} energy.`,
        `Check-in recorded for focus ${focusLevel} and energy ${energyLevel}!`,
        "Perfect! Your levels are saved.",
      ];
      const randomIndex = Math.floor(Math.random() * messages.length);

      showCheckInNotification(messages[randomIndex]);
    } catch (error) {
      setCheckInError(getErrorMessage(error));
    } finally {
      setIsSavingCheckIn(false);
    }
  }

    showCheckInNotification(messages[randomIndex]);
  }

  async function handleLoadDemoData() {
    setIsLoadingDemoData(true);
    setCheckInError("");

    try {
      const demoCheckIns = await createDemoCheckIns();

      setCheckIns(demoCheckIns);
      showCheckInNotification("Demo data loaded.");
    } catch (error) {
      setCheckInError(getErrorMessage(error));
    } finally {
      setIsLoadingDemoData(false);
    }
  }

  function handleLoadDemoData() {
    setCheckIns(createDemoCheckIns());
    showCheckInNotification("demo data loaded, have fun!");
  }

  function handleStartTimer() {
    if (isTimerRunning) return;

    timerBaseMillisecondsRef.current = timerMilliseconds;
    timerStartedAtRef.current = performance.now();
    setIsTimerRunning(true);
  }

  function handleStopTimer() {
    if (!isTimerRunning) return;

    const currentMilliseconds =
      timerBaseMillisecondsRef.current +
      performance.now() -
      timerStartedAtRef.current;

    timerBaseMillisecondsRef.current = currentMilliseconds;
    setTimerMilliseconds(currentMilliseconds);
    setIsTimerRunning(false);
  }

  function handleResetTimer() {
    timerStartedAtRef.current = 0;
    timerBaseMillisecondsRef.current = 0;
    setIsTimerRunning(false);
    setTimerMilliseconds(0);
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

        <div className="button-row">
          <button className="counter" onClick={handleAddCheckIn}>
            Add Check-In
          </button>

          <button className="counter" onClick={handleLoadDemoData}>
            Load Demo Data
          </button>
        </div>

        {checkInNotification && (
          <p
            className={`check-in-message${
              checkInNotification.isClosing ? " check-in-message-closing" : ""
            }`}
          >
            {checkInNotification.message}
          </p>
        )}
      </section>

      <section className="card">
        <div className="section-header">
          <h2>Check-In History</h2>
          <button
            className="toggle-button counter"
            onClick={() => setIsHistoryCollapsed((value) => !value)}
          >
            {isHistoryCollapsed ? "Show" : "Hide"}
          </button>
        </div>

        {!isHistoryCollapsed && (
          <>
            {checkIns.length > 0 && (
              <button
                className="counter clear-history-button"
                onClick={handleClearCheckIns}
              >
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
          </>
        )}
      </section>

      <section className="card">
        <h2>Timer</h2>

        <p className="timer-display">{formatTime(timerMilliseconds)}</p>

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
