import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlayers } from "@/lib/queries/players";
import { getSeasons, getActiveSeason } from "@/lib/queries/seasons";
import { getTournaments } from "@/lib/queries/tournaments";
import { Users, CalendarDays, Trophy, Spade } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [players, seasons, activeSeason] = await Promise.all([
    getPlayers(),
    getSeasons(),
    getActiveSeason(),
  ]);

  const tournaments = activeSeason
    ? await getTournaments(activeSeason.id)
    : [];

  const stats = [
    {
      title: "Jogadores",
      value: players.length,
      icon: Users,
      description: "cadastrados",
    },
    {
      title: "Temporadas",
      value: seasons.length,
      icon: CalendarDays,
      description: activeSeason ? `Ativa: ${activeSeason.name}` : "Nenhuma ativa",
    },
    {
      title: "Torneios",
      value: tournaments.length,
      icon: Trophy,
      description: activeSeason ? `na ${activeSeason.name}` : "total",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema de ranking</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Spade className="h-5 w-5 text-primary" />
            Início Rápido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>1. Cadastre os <strong className="text-foreground">jogadores</strong> no menu lateral</p>
          <p>2. Crie uma <strong className="text-foreground">temporada</strong> e ative-a</p>
          <p>3. Adicione <strong className="text-foreground">torneios</strong> à temporada</p>
          <p>4. Registre os <strong className="text-foreground">resultados</strong> de cada torneio</p>
          <p>5. O ranking é calculado automaticamente!</p>
        </CardContent>
      </Card>
    </div>
  );
}
