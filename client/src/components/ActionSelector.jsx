function ActionSelector({ playerName, onCreateRoom, onJoinRoom, onBack, isJoining }) {
    return (
        <div className="center-container">
            <div className="action-selector-wide">
                <h2>Xin chào, {playerName}!</h2>
                <p>Chọn cách bạn muốn bắt đầu trận đấu Kéo – Búa – Bao.</p>
                <div className="action-buttons">
                    <button
                        className="action-btn create-btn"
                        onClick={onCreateRoom}
                        disabled={isJoining}
                    >
                        {isJoining ? 'Đang tạo phòng...' : 'Tạo phòng mới'}
                    </button>
                    <button
                        className="action-btn join-btn"
                        onClick={onJoinRoom}
                        disabled={isJoining}
                    >
                        Vào phòng có sẵn
                    </button>
                </div>
                <button className="back-btn" onClick={onBack}>
                    ← Quay lại
                </button>
            </div>
        </div>
    );
}

export default ActionSelector;
