function GameRoom({
    roomCode,
    playerName,
    isRoomOwner,
    roomError,
    roomPlayers,
    gameStarted,
    onStartGame,
    isStartingGame
}) {
    return (
        <div className="center-container">
            <div className="game-room-wide">
                <h2>Phòng: {roomCode}</h2>
                <h3>Xin chào, {playerName}!</h3>
                <p>Chia sẻ mã phòng cho bạn bè và chờ đủ 2 người chơi để bắt đầu.</p>
                {isRoomOwner && <p className="owner-badge">👑 Bạn là chủ phòng</p>}

                {roomError && (
                    <div className="error-message">
                        ❌ {roomError}
                    </div>
                )}

                <div className="players-list">
                    <h4>👥 Người chơi trong phòng ({roomPlayers.length}/2):</h4>
                    {roomPlayers.map((player, index) => (
                        <div key={player.id} className="player-item">
                            <span className="player-name">
                                {index === 0 ? '👑' : '🔸'} {player.name}
                                {player.name === playerName && ' (Bạn)'}
                            </span>
                        </div>
                    ))}
                </div>

                {roomPlayers.length === 1 && (
                    <div className="waiting-message">
                        <p>⏳ Đang chờ đối thủ vào phòng...</p>
                        <p>Chia sẻ mã phòng <strong>{roomCode}</strong> cho bạn bè!</p>
                    </div>
                )}

                {roomPlayers.length === 2 && !gameStarted && (
                    <div className="ready-message">
                        <p>Phòng đã đủ người! Sẵn sàng chơi!</p>
                        {isRoomOwner ? (
                            <button
                                className="start-game-btn"
                                onClick={onStartGame}
                                disabled={isStartingGame}
                            >
                                {isStartingGame && <span className="loading-spinner"></span>}
                                {isStartingGame ? 'Đang bắt đầu...' : 'Bắt đầu trò chơi'}
                            </button>
                        ) : (
                            <p>Chờ chủ phòng bắt đầu trò chơi...</p>
                        )}
                    </div>
                )}

                <button className="ghost-btn back-btn" onClick={() => window.location.reload()}>
                    ← Về trang chủ
                </button>
            </div>
        </div>
    )
}

export default GameRoom
