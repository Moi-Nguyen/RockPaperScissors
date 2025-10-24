import { useState, useEffect, useCallback } from 'react';

function GamePlaying({ roomCode, roomPlayers, playerName, socket }) {
    const [myChoice, setMyChoice] = useState('');
    const [opponentChoice, setOpponentChoice] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);
    const [gamePhase, setGamePhase] = useState('choosing');
    const [scores, setScores] = useState({ player1: 0, player2: 0 });
    const [lastResult, setLastResult] = useState('');
    const [currentRound, setCurrentRound] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [gameWinner, setGameWinner] = useState('');

    const choices = [
        { value: 'rock', emoji: '🔨', name: 'Búa' },
        { value: 'paper', emoji: '📜', name: 'Bao' },
        { value: 'scissors', emoji: '✂️', name: 'Kéo' }
    ];

    const handleChoice = useCallback(
        choice => {
            if (gamePhase !== 'choosing' || myChoice || !socket) return;

            setMyChoice(choice);
            socket.emit('player-choice', { roomCode, choice });
        },
        [gamePhase, myChoice, socket, roomCode]
    );

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('timer-update', ({ timeLeft: serverTimeLeft }) => {
            setTimeLeft(serverTimeLeft);
        });

        socket.on('choice-made', ({ choicesCount }) => {
            if (choicesCount === 2) {
                setGamePhase('waiting');
            }
        });

        socket.on(
            'round-result',
            ({
                result,
                choices: incomingChoices,
                scores: newScores,
                round,
                gameOver: isGameOver,
                winner
            }) => {
                setLastResult(result);
                setScores(newScores);
                setCurrentRound(round);
                setGameOver(isGameOver);
                setGameWinner(winner);
                setGamePhase('result');

                const opponentId = Object.keys(incomingChoices).find(
                    id => id !== socket.id
                );
                if (opponentId) {
                    setOpponentChoice(incomingChoices[opponentId].choice);
                }
            }
        );

        socket.on('next-round-started', ({ round, timer }) => {
            setCurrentRound(round);
            setTimeLeft(timer);
            setMyChoice('');
            setOpponentChoice('');
            setGamePhase('choosing');
            setLastResult('');
        });

        return () => {
            socket.off('timer-update');
            socket.off('choice-made');
            socket.off('round-result');
            socket.off('next-round-started');
        };
    }, [socket]);

    const getChoiceDisplay = choice => {
        if (!choice) return '❓';
        const choiceObj = choices.find(c => c.value === choice);
        return choiceObj ? choiceObj.emoji : '❓';
    };

    const handleNextRound = () => {
        if (!socket || gameOver) return;
        socket.emit('next-round', { roomCode });
    };

    const meLabel = roomPlayers[0]?.id === socket?.id ? roomPlayers[0]?.name : roomPlayers[1]?.name;
    const opponentLabel =
        roomPlayers.length === 2
            ? roomPlayers.find(player => player.id !== socket?.id)?.name ?? 'Đối thủ'
            : 'Đối thủ';

    return (
        <div className="game-room">
            {/* Header */}
            <div className="game-header">
                <p>
                    Phòng thi đấu: <strong>{roomCode}</strong>
                </p>
                <h2>
                    🎮 Round {currentRound}{' '}
                    {gameOver && `- ${gameWinner} thắng!`}
                </h2>
                <div className="score-board">
                    <div className="player-score">
                        <span>
                            {roomPlayers[0]?.name ?? 'Người chơi 1'}: {scores.player1}
                        </span>
                    </div>
                    <div className="vs-divider">VS</div>
                    <div className="player-score">
                        <span>
                            {roomPlayers[1]?.name ?? 'Người chơi 2'}: {scores.player2}
                        </span>
                    </div>
                </div>
                {!gameOver && <p>🎯 Người đầu tiên đạt 3 điểm sẽ chiến thắng!</p>}
            </div>

            {/* Game Display */}
            <div className="choices-horizontal">
                <div className="player-section">
                    <div className="choice-label">{meLabel || playerName}</div>
                    <div className="choice-circle-large">
                        {getChoiceDisplay(myChoice)}
                    </div>
                    <div className="choice-name">
                        {myChoice
                            ? choices.find(c => c.value === myChoice)?.name
                            : 'Chờ chọn'}
                    </div>
                </div>

                <div className="vs-section-with-timer">
                    <div className="vs-symbol-large">VS</div>
                    {gamePhase === 'choosing' && (
                        <div className="timer-in-vs">
                            <div
                                className={`timer-count ${
                                    timeLeft <= 10 ? 'urgent' : ''
                                }`}
                            >
                                {timeLeft}s
                            </div>
                        </div>
                    )}
                    {gamePhase === 'waiting' && <div className="vs-status">⏳</div>}
                    {gamePhase === 'result' && <div className="vs-status">🎯</div>}
                </div>

                <div className="opponent-section">
                    <div className="choice-label">{opponentLabel}</div>
                    <div className="choice-circle-large">
                        {getChoiceDisplay(opponentChoice)}
                    </div>
                    <div className="choice-name">
                        {opponentChoice
                            ? choices.find(c => c.value === opponentChoice)?.name
                            : 'Chờ chọn'}
                    </div>
                </div>
            </div>

            {/* Choice Buttons */}
            {gamePhase === 'choosing' && !myChoice && (
                <div className="choice-buttons-wide">
                    {choices.map(choice => (
                        <button
                            key={choice.value}
                            type="button"
                            className="choice-btn-large"
                            onClick={() => handleChoice(choice.value)}
                        >
                            <span className="choice-emoji-large">
                                {choice.emoji}
                            </span>
                            <span className="choice-text-large">
                                {choice.name}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {/* Result Section */}
            {gamePhase === 'result' && (
                <div className="result-section">
                    <h3>{lastResult}</h3>
                    {gameOver ? (
                        <div className="game-over-section">
                            <h2>🏆 GAME KẾT THÚC!</h2>
                            <button
                                className="outline-btn"
                                onClick={() => window.location.reload()}
                            >
                                Thoát phòng
                            </button>
                        </div>
                    ) : (
                        <button className="primary-btn" onClick={handleNextRound}>
                            ▶️ Vòng tiếp theo
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default GamePlaying;
