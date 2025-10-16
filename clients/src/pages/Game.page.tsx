import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import socketService from "@/services/socket";
import { gameApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Home, Trophy, Clock } from "lucide-react";
import { DotBackground } from "@/components/ui/dot-background";

interface GameState {
  gameId: string;
  board: string[];
  currentTurn: string;
  status: string;
  winnerId?: string;
  player1: {
    id: string;
    username: string;
    elo: number;
  };
  player2: {
    id: string;
    username: string;
    elo: number;
  };
}

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameResult, setGameResult] = useState<{
    winnerId?: string;
    result: string;
  } | null>(null);

  useEffect(() => {
    loadGame();
  }, [gameId]);

  useEffect(() => {
    const socket = socketService.getSocket();

    if (socket) {
      socketService.onGameUpdate((data) => {
        setGameState((prev) => ({
          ...prev!,
          board: data.board,
          currentTurn: data.currentTurn,
          status: data.status,
          winnerId: data.winnerId,
        }));
        setTimeLeft(30); // Reset timer on move
      });

      socketService.onGameEnded((data) => {
        setGameResult(data);
      });

      socketService.onMoveError((data) => {
        alert(data.message);
      });

      socketService.onOpponentDisconnected((data) => {
        alert(data.message);
        setTimeout(() => navigate("/"), 3000);
      });
    }

    return () => {
      socketService.removeAllListeners();
    };
  }, [navigate]);

  // Timer countdown
  useEffect(() => {
    if (
      gameState &&
      gameState.status === "IN_PROGRESS" &&
      gameState.currentTurn === user?.id
    ) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameState, user]);

  const loadGame = async () => {
    if (!gameId) return;

    try {
      const data = await gameApi.getGame(gameId);
      setGameState({
        gameId: data.id,
        board: data.board.split(""),
        currentTurn: data.currentTurn,
        status: data.status,
        winnerId: data.winnerId,
        player1: data.player1,
        player2: data.player2,
      });
    } catch (error) {
      console.error("Failed to load game:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (position: number) => {
    if (!gameState || !user || !gameId) return;

    if (gameState.status !== "IN_PROGRESS") {
      return;
    }

    if (gameState.currentTurn !== user.id) {
      alert("It's not your turn!");
      return;
    }

    if (gameState.board[position] !== " ") {
      alert("This cell is already taken!");
      return;
    }

    socketService.makeMove(gameId, user.id, position);
  };

  const getCellContent = (cell: string) => {
    if (cell === "X")
      return <span className="text-blue-400 text-6xl font-bold">X</span>;
    if (cell === "O")
      return <span className="text-red-400 text-6xl font-bold">O</span>;
    return null;
  };

  const isMyTurn = gameState?.currentTurn === user?.id;
  const mySymbol = gameState?.player1.id === user?.id ? "X" : "O";
  const opponent =
    gameState?.player1.id === user?.id
      ? gameState?.player2
      : gameState?.player1;

  if (loading) {
    return (
      <DotBackground className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </DotBackground>
    );
  }

  if (!gameState) {
    return (
      <DotBackground className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Game not found</div>
      </DotBackground>
    );
  }

  return (
    <DotBackground className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Tic-Tac-Toe</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </div>

        {/* Game Result Modal */}
        {gameResult && (
          <Card className="mb-6 border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {gameResult.winnerId === user?.id ? (
                  <span className="text-green-400 flex items-center justify-center gap-2">
                    <Trophy className="w-8 h-8" />
                    You Won!
                  </span>
                ) : gameResult.winnerId ? (
                  <span className="text-red-400">You Lost!</span>
                ) : (
                  <span className="text-gray-400">It's a Draw!</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => navigate("/")}>Back to Home</Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Player Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">You ({mySymbol})</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <div className="text-xl font-bold">{user?.username}</div>
              <div className="text-sm text-muted-foreground">
                ELO: {user?.elo}
              </div>
              {isMyTurn && gameState.status === "IN_PROGRESS" && (
                <Badge variant="default" className="bg-green-600">
                  Your Turn
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Game Board */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center flex items-center justify-center gap-2">
                {gameState.status === "IN_PROGRESS" && isMyTurn && (
                  <>
                    <Clock className="w-5 h-5" />
                    <span>{timeLeft}s</span>
                  </>
                )}
                {gameState.status === "IN_PROGRESS" && !isMyTurn && (
                  <span className="text-muted-foreground">Opponent's Turn</span>
                )}
                {gameState.status === "COMPLETED" && <span>Game Over</span>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 aspect-square max-w-sm mx-auto">
                {gameState.board.map((cell, index) => (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={
                      gameState.status !== "IN_PROGRESS" ||
                      !isMyTurn ||
                      cell !== " "
                    }
                    className={`
                      aspect-square bg-secondary/50 rounded-lg flex items-center justify-center
                      transition-all duration-200 border-2 border-transparent
                      ${
                        gameState.status === "IN_PROGRESS" &&
                        isMyTurn &&
                        cell === " "
                          ? "hover:bg-secondary hover:border-primary cursor-pointer"
                          : "cursor-not-allowed"
                      }
                    `}
                  >
                    {getCellContent(cell)}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Opponent Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                Opponent ({mySymbol === "X" ? "O" : "X"})
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-2">
              <div className="text-xl font-bold">{opponent?.username}</div>
              <div className="text-sm text-muted-foreground">
                ELO: {opponent?.elo}
              </div>
              {!isMyTurn && gameState.status === "IN_PROGRESS" && (
                <Badge variant="default" className="bg-orange-600">
                  Thinking...
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Game Instructions */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Click on an empty cell to make your move. You have 30 seconds
                per turn.
              </p>
              <p className="mt-2">
                {mySymbol === "X"
                  ? "You're playing as X (blue)"
                  : "You're playing as O (red)"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DotBackground>
  );
}
