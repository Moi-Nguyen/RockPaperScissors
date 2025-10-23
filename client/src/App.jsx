import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import './App.css'
import NameForm from './components/NameForm'
import ActionSelector from './components/ActionSelector'
import JoinRoom from './components/JoinRoom'
import GameRoom from './components/GameRoom'
import GamePlaying from './components/GamePlaying'

function App() {
    const [roomCode, setRoomCode] = useState('')
    const [playerName, setPlayerName] = useState('')
    const [socket, setSocket] = useState(null)
    const [isConnected, setIsConnected] = useState(false)
    const [isJoining, setIsJoining] = useState(false)
    const [gameStep, setGameStep] = useState('enterName')
    const [actionType, setActionType] = useState('')
    const [roomPlayers, setRoomPlayers] = useState([])
    const [roomError, setRoomError] = useState('')
    const [isRoomOwner, setIsRoomOwner] = useState(false)
    const [gameStarted, setGameStarted] = useState(false)
    const [isStartingGame, setIsStartingGame] = useState(false)

    // Initialize Socket.io connection
    useEffect(() => {
        const newSocket = io('http://localhost:3001')
        setSocket(newSocket)

        newSocket.on('connect', () => {
            console.log('Connected to server')
            setIsConnected(true)
        })

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server')
            setIsConnected(false)
        })

        // Handle room creation success
        newSocket.on('room-created', (data) => {
            console.log('Room created:', data)
            setIsJoining(false)
            setGameStep('inRoom')
            setRoomPlayers([{ name: data.playerName, id: newSocket.id }])
            setIsRoomOwner(data.isOwner || false)
            setRoomError('')
        })

        // Handle successful room join or player join
        newSocket.on('player-joined', (data) => {
            console.log('Player joined:', data)
            setIsJoining(false)
            setGameStep('inRoom')
            setRoomPlayers(data.players)
            setIsRoomOwner(data.ownerId === newSocket.id)
            setGameStarted(data.gameStarted || false)
            setRoomError('')
        })

        // Handle errors
        newSocket.on('room-error', (data) => {
            console.log('Room error:', data.message)
            setRoomError(data.message)
            setIsJoining(false)
            setIsStartingGame(false)
        })

        // Handle player left
        newSocket.on('player-left', (data) => {
            console.log('Player left:', data)

            // Show notification and return to home
            alert(`${data.leftPlayerName} đã thoát khỏi phòng. Trở về trang chủ...`)

            // Reset all game state and return to home
            setTimeout(() => {
                setGameStep('enterName')
                setPlayerName('')
                setRoomCode('')
                setRoomPlayers([])
                setIsRoomOwner(false)
                setGameStarted(false)
                setActionType('')
                setRoomError('')
                setIsJoining(false)
                setIsStartingGame(false)
            }, 1000) // Small delay to show the alert
        })

        // Handle game started
        newSocket.on('game-started', (data) => {
            console.log('Game started:', data)
            setGameStarted(true)
            setGameStep('playing')
            setIsStartingGame(false)
            setRoomError('')
        })

        return () => {
            newSocket.close()
        }
    }, [])

    const handleNameSubmit = (name) => {
        setPlayerName(name)
        setGameStep('chooseAction')
    }

    const handleCreateRoom = () => {
        if (!socket) {
            alert('Chưa kết nối với server!')
            return
        }

        setActionType('create')
        // Generate random room code
        const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase()
        setRoomCode(generatedCode)
        setIsJoining(true)
        setRoomError('')

        console.log('Creating room:', { roomCode: generatedCode, playerName })

        // Send create room request to server
        socket.emit('create-room', {
            playerName: playerName,
            roomCode: generatedCode
        })
    }

    const handleJoinRoomRequest = (code) => {
        if (!socket) {
            alert('Chưa kết nối với server!')
            return
        }

        setRoomCode(code)
        setIsJoining(true)
        setRoomError('')

        console.log('Joining room:', { roomCode: code, playerName })

        // Send join room request to server
        socket.emit('join-room', {
            playerName: playerName,
            roomCode: code
        })
    }

    const handleChooseJoin = () => {
        setActionType('join')
        setGameStep('enterRoom')
    }

    const handleStartGame = () => {
        if (!socket) {
            alert('Chưa kết nối với server!')
            return
        }

        if (!isRoomOwner) {
            alert('Chỉ chủ phòng mới có thể bắt đầu trò chơi!')
            return
        }

        setIsStartingGame(true)
        setRoomError('')

        console.log('Starting game for room:', roomCode)

        socket.emit('start-game', {
            roomCode: roomCode
        })
    }

    const handleBack = () => {
        if (gameStep === 'chooseAction') {
            setGameStep('enterName')
        } else if (gameStep === 'enterRoom') {
            setGameStep('chooseAction')
            setRoomCode('')
        }
    }

    return (
        <div className="App">

            {gameStep === 'enterName' && (
                <NameForm onSubmit={handleNameSubmit} />
            )}

            {gameStep === 'chooseAction' && (
                <ActionSelector
                    playerName={playerName}
                    onCreateRoom={handleCreateRoom}
                    onJoinRoom={handleChooseJoin}
                    onBack={handleBack}
                    isJoining={isJoining}
                />
            )}

            {gameStep === 'enterRoom' && actionType === 'join' && (
                <JoinRoom
                    playerName={playerName}
                    onJoinRoom={handleJoinRoomRequest}
                    onBack={handleBack}
                    isJoining={isJoining}
                    isConnected={isConnected}
                    roomError={roomError}
                />
            )}

            {gameStep === 'inRoom' && (
                <GameRoom
                    roomCode={roomCode}
                    playerName={playerName}
                    isRoomOwner={isRoomOwner}
                    roomError={roomError}
                    roomPlayers={roomPlayers}
                    gameStarted={gameStarted}
                    onStartGame={handleStartGame}
                    isStartingGame={isStartingGame}
                />
            )}

            {gameStep === 'playing' && (
                <GamePlaying
                    roomCode={roomCode}
                    roomPlayers={roomPlayers}
                    playerName={playerName}
                    socket={socket}
                />
            )}
        </div>
    )
}

export default App