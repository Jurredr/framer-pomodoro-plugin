import { framer } from 'framer-plugin';
import { useState, useEffect } from 'react';
import './App.css';

framer.showUI({
    position: 'top right',
    width: 220,
    height: 420,
    resizable: 'height',
    minHeight: 200,
});

export function App() {
    const [workDuration, setWorkDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [totalSessions, setTotalSessions] = useState(4);
    const [currentSession, setCurrentSession] = useState(1);
    const [timeLeft, setTimeLeft] = useState(workDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const [isWorkSession, setIsWorkSession] = useState(true);
    const [activeTab, setActiveTab] = useState('timer');

    useEffect(() => {
        let interval: number | undefined;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            if (isWorkSession && currentSession < totalSessions) {
                framer.notify('Work session finished! Take a break.', {
                    variant: 'success',
                });
                setIsWorkSession(false);
                setTimeLeft(breakDuration * 60);
            } else if (!isWorkSession && currentSession < totalSessions) {
                framer.notify('Break finished! Back to work.', {
                    variant: 'success',
                });
                setIsWorkSession(true);
                setCurrentSession((session) => session + 1);
                setTimeLeft(workDuration * 60);
            } else {
                framer.notify('All sessions completed!', {
                    variant: 'success',
                });
                resetTimer();
            }
        }

        return () => clearInterval(interval);
    }, [
        isActive,
        timeLeft,
        isWorkSession,
        workDuration,
        breakDuration,
        currentSession,
        totalSessions,
    ]);

    const toggleTimer = () => {
        setIsActive(!isActive);
    };

    const resetTimer = () => {
        setIsActive(false);
        setIsWorkSession(true);
        setCurrentSession(1);
        setTimeLeft(workDuration * 60);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
            .toString()
            .padStart(2, '0')}`;
    };

    const handleDurationChange = (
        setter: React.Dispatch<React.SetStateAction<number>>,
        value: string,
        isWork: boolean
    ) => {
        const parsedValue = parseInt(value, 10);
        let newValue: number;

        if (isNaN(parsedValue) || value === '') {
            newValue = isWork ? 25 : 5; // Default values
        } else if (isWork) {
            newValue = Math.max(1, Math.min(60, parsedValue));
        } else {
            newValue = Math.max(1, Math.min(30, parsedValue));
        }

        setter(newValue);
        if ((isWork && isWorkSession) || (!isWork && !isWorkSession)) {
            if (!isActive) {
                setTimeLeft(newValue * 60);
            }
        }
    };

    const handleTotalSessionsChange = (value: string) => {
        const parsedValue = parseInt(value, 10);
        let newValue: number;

        if (isNaN(parsedValue) || value === '') {
            newValue = 4; // Default value
        } else {
            newValue = Math.max(1, Math.min(10, parsedValue));
        }

        setTotalSessions(newValue);
        if (currentSession > newValue) {
            setCurrentSession(newValue);
        }
    };

    const calculateProgress = () => {
        const completedSessions = currentSession - 1;
        const currentSessionProgress = isWorkSession
            ? 1 - timeLeft / (workDuration * 60)
            : 1;
        return (
            ((completedSessions + currentSessionProgress) / totalSessions) * 100
        );
    };

    const renderProgressBar = () => {
        const progressWidth = `${calculateProgress()}%`;
        const indicators = [];
        for (let i = 1; i < totalSessions; i++) {
            const position = `${(i / totalSessions) * 100}%`;
            indicators.push(
                <div
                    key={i}
                    className="progress-indicator"
                    style={{ left: position }}
                ></div>
            );
        }

        return (
            <div className="progress-bar">
                <div
                    className="progress"
                    style={{ width: progressWidth }}
                ></div>
                {indicators}
            </div>
        );
    };

    return (
        <main>
            <div className="tabs">
                <button
                    className={`framer-button ${
                        activeTab === 'timer' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('timer')}
                >
                    Timer
                </button>
                <button
                    className={`framer-button ${
                        activeTab === 'settings' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
            </div>

            {activeTab === 'timer' && (
                <div className="tab-content">
                    <h1>{isWorkSession ? 'Work Session' : 'Break'}</h1>
                    <p className="timer">{formatTime(timeLeft)}</p>
                    <p className="session-info">
                        Session {currentSession} of {totalSessions}
                    </p>
                    {renderProgressBar()}
                    <button
                        className="framer-button framer-button-primary"
                        onClick={toggleTimer}
                    >
                        {isActive ? 'Pause' : 'Start'}
                    </button>
                    <button
                        className="framer-button framer-button-secondary"
                        onClick={resetTimer}
                    >
                        Reset
                    </button>
                    <p>
                        {isWorkSession
                            ? 'Focus on your work!'
                            : 'Take a break and relax.'}
                    </p>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="tab-content">
                    <h1>Settings</h1>
                    <div className="settings">
                        <label>
                            Work Duration (minutes):
                            <div className="input-slider-container">
                                <input
                                    type="number"
                                    value={workDuration}
                                    onChange={(e) =>
                                        handleDurationChange(
                                            setWorkDuration,
                                            e.target.value,
                                            true
                                        )
                                    }
                                    min="1"
                                    max="60"
                                />
                                <input
                                    type="range"
                                    value={workDuration}
                                    onChange={(e) =>
                                        handleDurationChange(
                                            setWorkDuration,
                                            e.target.value,
                                            true
                                        )
                                    }
                                    min="1"
                                    max="60"
                                />
                            </div>
                        </label>
                        <label>
                            Break Duration (minutes):
                            <div className="input-slider-container">
                                <input
                                    type="number"
                                    value={breakDuration}
                                    onChange={(e) =>
                                        handleDurationChange(
                                            setBreakDuration,
                                            e.target.value,
                                            false
                                        )
                                    }
                                    min="1"
                                    max="30"
                                />
                                <input
                                    type="range"
                                    value={breakDuration}
                                    onChange={(e) =>
                                        handleDurationChange(
                                            setBreakDuration,
                                            e.target.value,
                                            false
                                        )
                                    }
                                    min="1"
                                    max="30"
                                />
                            </div>
                        </label>
                        <label>
                            Number of Sessions:
                            <div className="input-slider-container">
                                <input
                                    type="number"
                                    value={totalSessions}
                                    onChange={(e) =>
                                        handleTotalSessionsChange(
                                            e.target.value
                                        )
                                    }
                                    min="1"
                                    max="10"
                                />
                                <input
                                    type="range"
                                    value={totalSessions}
                                    onChange={(e) =>
                                        handleTotalSessionsChange(
                                            e.target.value
                                        )
                                    }
                                    min="1"
                                    max="10"
                                />
                            </div>
                        </label>
                    </div>
                </div>
            )}
        </main>
    );
}
