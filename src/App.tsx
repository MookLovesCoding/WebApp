import "./App.css";
import { useEffect, useRef, useState } from "react";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/react";
import {
  createCheckIn,
  createDemoCheckIns,
  deleteCheckIns,
  getCheckIns,
  type CheckIn,
} from "./checkInsApi";
import {
  createGuestCheckIn,
  createGuestDemoCheckIns,
  deleteGuestCheckIns,
  getGuestCheckIns,
} from "./localCheckIns";

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

type RatingField = "energyLevel" | "focusLevel";

type CheckInNotification = {
  id: number;
  message: string;
  isClosing: boolean;
};

const GUEST_MODE_KEY = "focusflow.guestMode";

function formatTime(totalMilliseconds: number): string {
  const safeMilliseconds = Math.max(0, Math.floor(totalMilliseconds));
  const minutes = Math.floor(safeMilliseconds / 60000);
  const seconds = Math.floor((safeMilliseconds % 60000) / 1000);
  const milliseconds = safeMilliseconds % 1000;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}.${String(milliseconds).padStart(3, "0")}`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
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
        {bars.length === 0 ? (
          <p className="empty-graph">No data yet.</p>
        ) : (
          bars.map((bar) => (
            <div className="bar-group" key={`${title}-${bar.label}`}>
              <div className="bar" style={{ height: bar.height }}></div>
              <span className="bar-label">{bar.label}</span>
            </div>
          ))
        )}
      </div>

      <p className="graph-caption">{caption}</p>
    </div>
  );
}

type AuthGateProps = {
  isAuthLoaded: boolean;
  onContinueAsGuest: () => void;
};

function AuthGate({ isAuthLoaded, onContinueAsGuest }: AuthGateProps) {
  return (
    <div className="auth-gate" role="dialog" aria-modal="true">
      <div className="auth-gate-panel">
        <p className="auth-gate-label">FocusFlow</p>
        <h2>Choose how to continue</h2>
        <p className="auth-gate-copy">
          Sign in to sync your check-ins, or keep them only on this device.
        </p>

        {isAuthLoaded ? (
          <div className="auth-gate-actions">
            <SignInButton mode="modal">
              <button className="counter">Sign In</button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="counter">Sign Up</button>
            </SignUpButton>
          </div>
        ) : (
          <p className="auth-gate-loading">Loading sign-in options...</p>
        )}

        <button className="guest-mode-button" onClick={onContinueAsGuest}>
          Continue as guest (Local Storage only)
        </button>
      </div>
    </div>
  );
}

function App() {
  const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const [isGuestMode, setIsGuestMode] = useState(
    () => window.localStorage.getItem(GUEST_MODE_KEY) === "enabled"
  );
  const [focusLevel, setFocusLevel] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [checkInNotification, setCheckInNotification] =
    useState<CheckInNotification | null>(null);
  const [timerMilliseconds, setTimerMilliseconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoadingCheckIns, setIsLoadingCheckIns] = useState(true);
  const [isSavingCheckIn, setIsSavingCheckIn] = useState(false);
  const [isLoadingDemoData, setIsLoadingDemoData] = useState(false);
  const [isClearingCheckIns, setIsClearingCheckIns] = useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [checkInError, setCheckInError] = useState("");
  const timerStartedAtRef = useRef(0);
  const timerBaseMillisecondsRef = useRef(0);
  const notificationIdRef = useRef(0);
  const closeNotificationTimerRef = useRef<number | null>(null);
  const clearNotificationTimerRef = useRef<number | null>(null);
  const isMutatingCheckIns =
    isSavingCheckIn || isLoadingDemoData || isClearingCheckIns;
  const isUsingGuestStorage = isGuestMode && !isSignedIn;
  const canUseCheckIns = Boolean(isSignedIn) || isUsingGuestStorage;
  const shouldShowAuthGate = !canUseCheckIns;
  const areCheckInActionsDisabled =
    !canUseCheckIns || isMutatingCheckIns;

  const todaysCheckIns = filterCheckInsFromDate(checkIns, getStartOfToday());
  const weeklyCheckIns = filterCheckInsFromDate(checkIns, getStartOfWeek());
  const monthlyCheckIns = filterCheckInsFromDate(checkIns, getStartOfMonth());
  const averageFocus = getAverage(checkIns, "focusLevel");
  const averageEnergy = getAverage(checkIns, "energyLevel");
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
        `Check-ins logged: ${todaysCheckIns.length}`,
        averageToOutput(getAverage(todaysCheckIns, "focusLevel"), "focusLevel"),
        averageToOutput(
          getAverage(todaysCheckIns, "energyLevel"),
          "energyLevel"
        ),
        `Current focus timer: ${formatTime(timerMilliseconds)}`,
      ],
    },
    {
      title: "Weekly Summary",
      stats: [
        `Check-ins logged: ${weeklyCheckIns.length}`,
        averageToOutput(getAverage(weeklyCheckIns, "focusLevel"), "focusLevel"),
        averageToOutput(
          getAverage(weeklyCheckIns, "energyLevel"),
          "energyLevel"
        ),
        `Current focus timer: ${formatTime(timerMilliseconds)}`,
      ],
    },
    {
      title: "Monthly Summary",
      stats: [
        `Check-ins logged: ${monthlyCheckIns.length}`,
        averageToOutput(getAverage(monthlyCheckIns, "focusLevel"), "focusLevel"),
        averageToOutput(
          getAverage(monthlyCheckIns, "energyLevel"),
          "energyLevel"
        ),
        `Current focus timer: ${formatTime(timerMilliseconds)}`,
      ],
    },
  ];

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
    let isMounted = true;

    async function loadCheckIns() {
      if (isUsingGuestStorage) {
        setCheckIns(getGuestCheckIns());
        setCheckInError("");
        setIsLoadingCheckIns(false);
        return;
      }

      if (!isAuthLoaded) {
        return;
      }

      if (!isSignedIn) {
        setCheckIns([]);
        setCheckInError("");
        setIsLoadingCheckIns(false);
        return;
      }

      try {
        setCheckInError("");
        setIsLoadingCheckIns(true);
        const savedCheckIns = await getCheckIns(getToken);

        if (isMounted) {
          setCheckIns(savedCheckIns);
        }
      } catch (error) {
        if (isMounted) {
          setCheckInError(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoadingCheckIns(false);
        }
      }
    }

    void loadCheckIns();

    return () => {
      isMounted = false;
    };
  }, [getToken, isAuthLoaded, isSignedIn, isUsingGuestStorage]);

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
    if (!canUseCheckIns) return;

    setIsSavingCheckIn(true);
    setCheckInError("");

    try {
      const newCheckIn = isUsingGuestStorage
        ? createGuestCheckIn({ focusLevel, energyLevel })
        : await createCheckIn({ focusLevel, energyLevel }, getToken);

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

  async function handleClearCheckIns() {
    if (!canUseCheckIns) return;

    setIsClearingCheckIns(true);
    setCheckInError("");

    try {
      if (isUsingGuestStorage) {
        deleteGuestCheckIns();
      } else {
        await deleteCheckIns(getToken);
      }

      setCheckIns([]);
    } catch (error) {
      setCheckInError(getErrorMessage(error));
    } finally {
      setIsClearingCheckIns(false);
    }
  }

  async function handleLoadDemoData() {
    if (!canUseCheckIns) return;

    setIsLoadingDemoData(true);
    setCheckInError("");

    try {
      const demoCheckIns = isUsingGuestStorage
        ? createGuestDemoCheckIns()
        : await createDemoCheckIns(getToken);

      setCheckIns(demoCheckIns);
      showCheckInNotification("Demo data loaded.");
    } catch (error) {
      setCheckInError(getErrorMessage(error));
    } finally {
      setIsLoadingDemoData(false);
    }
  }

  function handleContinueAsGuest() {
    window.localStorage.setItem(GUEST_MODE_KEY, "enabled");
    setIsGuestMode(true);
    setCheckInError("");
    setCheckIns(getGuestCheckIns());
    setIsLoadingCheckIns(false);
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
    <>
      <main className="app" aria-hidden={shouldShowAuthGate}>
      <header>
        <div className="header-content">
          <div>
            <h1>FocusFlow</h1>
            <p>Track your focus and energy throughout the day.</p>
          </div>

          <div className="auth-actions">
            {!isAuthLoaded ? null : isSignedIn ? (
              <UserButton />
            ) : isGuestMode ? (
              <>
                <span className="storage-mode-pill">Guest mode</span>
                <SignInButton mode="modal">
                  <button className="counter">Sign In</button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="counter">Sign Up</button>
                </SignUpButton>
              </>
            ) : (
              <span className="storage-mode-pill">Choose sign-in option</span>
            )}
          </div>
        </div>
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
          <button
            className="counter"
            disabled={areCheckInActionsDisabled}
            onClick={handleAddCheckIn}
          >
            {isSavingCheckIn ? "Saving..." : "Add Check-In"}
          </button>

          <button
            className="counter"
            disabled={areCheckInActionsDisabled}
            onClick={handleLoadDemoData}
          >
            {isLoadingDemoData ? "Loading..." : "Load Demo Data"}
          </button>
        </div>

        {checkInError && <p className="check-in-error">{checkInError}</p>}

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
                disabled={areCheckInActionsDisabled}
                onClick={handleClearCheckIns}
              >
                {isClearingCheckIns ? "Clearing..." : "Clear History"}
              </button>
            )}

            {isLoadingCheckIns ? (
              <p>Loading check-ins...</p>
            ) : checkIns.length === 0 ? (
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
      {shouldShowAuthGate && (
        <AuthGate
          isAuthLoaded={isAuthLoaded}
          onContinueAsGuest={handleContinueAsGuest}
        />
      )}
    </>
  );
}

export default App;
