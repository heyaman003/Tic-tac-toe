import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/useAuth";
import socketService from "@/services/socket";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DotBackground } from "@/components/ui/dot-background";
import { Trophy, LogOut, User, TrendingUp, Flame } from "lucide-react";

interface OnlineUser {
  id: string;
  username: string;
  elo: number;
  totalWins: number;
  totalLoss: number;
  isOnline: boolean;
}

interface GameInvite {
  inviteId: string;
  sender: {
    id: string;
    username: string;
    elo: number;
  };
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [pendingInvites, setPendingInvites] = useState<GameInvite[]>([]);
  const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const socket = socketService.getSocket();

    if (socket && user) {
      // Listen for online users updates
      socketService.getOnlineUsers((users) => {
        console.log("Received online users:", users);
        setOnlineUsers(users.filter((u) => u.id !== user?.id));
      });

      // Listen for invites
      socketService.onInviteReceived((data) => {
        setPendingInvites((prev) => [...prev, data]);
      });

      socketService.onInviteSent((data) => {
        console.log("Invite sent:", data);
      });

      socketService.onInviteError((data) => {
        alert(data.message);
        setSentInvites(new Set());
      });

      socketService.onInviteRejected(() => {
        alert("Invite was rejected");
        setSentInvites(new Set());
      });

      // Listen for game start
      socketService.onGameStarted((data) => {
        navigate(`/game/${data.gameId}`);
      });

      return () => {
        socketService.removeAllListeners();
      };
    }
  }, [user, navigate]);

  const handleInvite = (userId: string) => {
    if (user) {
      socketService.sendInvite(user.id, userId);
      setSentInvites((prev) => new Set(prev).add(userId));
    }
  };

  const handleAcceptInvite = (inviteId: string) => {
    socketService.acceptInvite(inviteId);
    setPendingInvites((prev) =>
      prev.filter((inv) => inv.inviteId !== inviteId),
    );
  };

  const handleRejectInvite = (inviteId: string) => {
    socketService.rejectInvite(inviteId);
    setPendingInvites((prev) =>
      prev.filter((inv) => inv.inviteId !== inviteId),
    );
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <DotBackground className="min-h-screen">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold">Tic-Tac-Toe Arena</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/leaderboard")}>
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
          {/* User Profile */}
          <Card className="lg:col-span-1 bg-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4  ">
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">{user?.username}</div>
                <Badge variant="default" className="bg-green-600">
                  Online
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span>ELO Rating</span>
                  </div>
                  <span className="font-bold text-blue-400">{user?.elo}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                  <span className="text-muted-foreground">Wins</span>
                  <span className="font-bold text-green-400">
                    {user?.totalWins}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                  <span className="text-muted-foreground">Losses</span>
                  <span className="font-bold text-red-400">
                    {user?.totalLoss}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                  <span className="text-muted-foreground">Draws</span>
                  <span className="font-bold text-gray-400">
                    {user?.totalDraws}
                  </span>
                </div>

                {user && user.bestStreak > 0 && (
                  <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>Best Streak</span>
                    </div>
                    <span className="font-bold text-orange-400">
                      {user.bestStreak}
                    </span>
                  </div>
                )}

                {user && user.currentStreak !== 0 && (
                  <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>Current Streak</span>
                    </div>
                    <span
                      className={`font-bold ${user.currentStreak > 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {user.currentStreak > 0
                        ? `+${user.currentStreak}`
                        : user.currentStreak}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Online Players & Invites */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Invites */}
            {pendingInvites.length > 0 && (
              <Card className="bg-black">
                <CardHeader>
                  <CardTitle>Game Invitations</CardTitle>
                  <CardDescription>
                    You have pending game invites
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.inviteId}
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg"
                    >
                      <div>
                        <div className="font-semibold">
                          {invite.sender.username}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ELO: {invite.sender.elo}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptInvite(invite.inviteId)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectInvite(invite.inviteId)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Online Players */}
            <Card className="bg-black">
              <CardHeader>
                <CardTitle>Online Players ({onlineUsers.length})</CardTitle>
                <CardDescription>
                  Challenge other players to a game
                </CardDescription>
              </CardHeader>
              <CardContent>
                {onlineUsers.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No other players online right now
                  </div>
                ) : (
                  <div className="space-y-3">
                    {onlineUsers.map((player) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              {player.username}
                              <Badge
                                variant="default"
                                className="bg-green-600 text-xs"
                              >
                                Online
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ELO: {player.elo} • W: {player.totalWins} / L:{" "}
                              {player.totalLoss}
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleInvite(player.id)}
                          disabled={sentInvites.has(player.id)}
                        >
                          {sentInvites.has(player.id) ? "Invited" : "Challenge"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DotBackground>
  );
}
