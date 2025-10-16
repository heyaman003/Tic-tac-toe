import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { leaderboardApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DotBackground } from "@/components/ui/dot-background";
import { Trophy, TrendingUp, Flame } from "lucide-react";

interface LeaderboardPlayer {
  id: string;
  username: string;
  elo: number;
  totalWins: number;
  totalLoss: number;
  totalDraws: number;
  totalGames: number;
  winRate: number;
  rank: number;
  currentStreak: number;
  bestStreak: number;
  isOnline: boolean;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await leaderboardApi.getLeaderboard(50);
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-orange-600";
    return "text-muted-foreground";
  };

  return (
    <DotBackground className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold flex items-center gap-2 text-white">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Leaderboard
          </h1>
          <Button onClick={() => navigate("/")} className="text-white">Back to Home</Button>
        </div>

        {loading ? (
          <div className="text-center text-xl text-white">Loading...</div>
        ) : (
          <Card className=" bg-black border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Top Players</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 bg-black ">
                {leaderboard.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-4 rounded-lg   transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className={`text-2xl font-bold w-12 ${getRankColor(player.rank)}`}
                      >
                        {player.rank <= 3 ? (
                          <Trophy className="w-8 h-8" />
                        ) : (
                          `#${player.rank}`
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg text-white">
                            {player.username}
                          </span>
                          {player.isOnline && (
                            <Badge variant="default" className="bg-green-600">
                              Online
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-300">
                          {player.totalGames} games •{" "}
                          {player.winRate.toFixed(1)}% win rate
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-blue-400">
                          <TrendingUp className="w-4 h-4" />
                          <span className="font-bold text-lg">
                            {player.elo}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400">ELO</div>
                      </div>

                      <div className="text-center">
                        <div className="text-green-400 font-bold text-lg">
                          {player.totalWins}
                        </div>
                        <div className="text-xs text-gray-400">
                          Wins
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-red-400 font-bold text-lg">
                          {player.totalLoss}
                        </div>
                        <div className="text-xs text-gray-400">
                          Losses
                        </div>
                      </div>

                      {player.bestStreak > 0 && (
                        <div className="text-center">
                          <div className="flex items-center gap-1 text-orange-400">
                            <Flame className="w-4 h-4" />
                            <span className="font-bold text-lg">
                              {player.bestStreak}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Best Streak
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DotBackground>
  );
}



