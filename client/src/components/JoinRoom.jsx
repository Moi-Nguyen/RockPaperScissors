import { useState } from 'react'

function JoinRoom({ playerName, onJoinRoom, onBack, isJoining, isConnected, roomError }) {
    const [roomCode, setRoomCode] = useState('')

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!roomCode.trim()) {
            alert('Vui lòng nhập mã phòng!')
            return
        }

        onJoinRoom(roomCode.trim().toUpperCase())
    }

    return (
        <div className="center-container">
            <div className="join-room-wide">
                <h2>Vào phòng chơi</h2>
                <p>Xin chào, {playerName}!</p>

                {roomError && (
                    <div className="error-message">
                        ❌ {roomError}
                    </div>
                )}

                {!isConnected && (
                    <div className="error-message">
                        ⚠️ Đang mất kết nối tới máy chủ. Vui lòng kiểm tra lại.
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Nhập mã phòng"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            disabled={isJoining}
                        />
                    </div>
                    <button
                        className="primary-btn"
                        type="submit"
                        disabled={isJoining || !isConnected}
                    >
                        {isJoining && <span className="loading-spinner"></span>}
                        {isJoining ? 'Đang vào phòng...' : 'Vào phòng'}
                    </button>
                </form>

                <button className="ghost-btn back-btn" onClick={onBack}>
                    ← Quay lại
                </button>
            </div>
        </div>
    )
}

export default JoinRoom
