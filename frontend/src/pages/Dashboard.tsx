// frontend/src/pages/Dashboard.tsx
import { useAuth } from '../context/AuthContext';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { LogOut, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

// Interface para os dados de log do clima
interface WeatherLog {
    _id: string;
    timestamp: string;
    temperature_c: number;
    humidity_percent: number;
    wind_speed_kmh: number;
    city: string;
    condition: string;
}

// Interface para os dados de insight
interface InsightData {
    averageTemperature: number;
    averageHumidity: number;
    totalRecords: number;
    insight: string;
}

const API_URL_ABSOLUTE = 'http://localhost:3000';
const LOGS_ENDPOINT = `${API_URL_ABSOLUTE}/api/weather/logs`;
const INSIGHTS_ENDPOINT = `${API_URL_ABSOLUTE}/api/weather/insights`;

function Dashboard() {
    const [weatherData, setWeatherData] = useState<WeatherLog[]>([]);
    const [insightData, setInsightData] = useState<InsightData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Pega o token de autenticação e a função de logout do contexto
    const { token, logout } = useAuth();

    // Função genérica para buscar dados com autenticação
    const fetchData = async (endpoint: string) => {
        // Se o token for null, não tentamos buscar
        if (!token) return;

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // CRÍTICO: Envia o token JWT para rotas protegidas
                'Authorization': `Bearer ${token}`,
            },
        });

        // Verifica se o token expirou ou é inválido
        if (response.status === 401 || response.status === 403) {
            logout();
            throw new Error('Sessão expirada. Faça login novamente.');
        }

        if (!response.ok) {
            throw new Error(`Falha ao buscar dados: Código ${response.status}`);
        }
        return response.json();
    };

    useEffect(() => {
        const loadData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                // Busca Logs (dependendo da sua configuração, esta rota pode ser pública ou protegida)
                const logs = await fetchData(LOGS_ENDPOINT);
                setWeatherData(logs);

                // Busca Insights (ROTA PROTEGIDA!)
                const insights = await fetchData(INSIGHTS_ENDPOINT);
                setInsightData(insights);

                setLoading(false);

            } catch (err: any) {
                console.error("Erro na busca de dados:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        loadData();
    }, [token]); // Reexecuta se o token mudar

    if (loading) {
        return <div className="p-8 text-center text-xl">Carregando Dashboard... 🔄</div>;
    }

    if (error) {
        return (
            <div className="p-8">
                <Card className="p-6 bg-red-50 border-red-400 text-red-700">
                    <h1 className="text-2xl font-bold">Erro</h1>
                    <p>{error}</p>
                    <Button onClick={logout} className="mt-4 bg-red-600 hover:bg-red-700">
                        <LogOut className="mr-2 h-4 w-4" /> Ir para Login
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
                <h1 className="text-4xl font-extrabold flex items-center">
                    <Sun className="h-8 w-8 mr-3 text-yellow-500" />
                    GDASH - Monitoramento de Clima
                </h1>
                <Button onClick={logout} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
            </div>

            {/* Seção de Insights */}
            {insightData && (
                <Card className="mb-8 p-6 bg-blue-50 border-blue-400 text-blue-800 shadow-md">
                    <h2 className="text-2xl font-semibold mb-2">Análise de Clima Recente</h2>
                    <p className="text-lg font-medium">{insightData.insight}</p>
                    <p className="text-sm mt-2">
                        Média de Temperatura: **{insightData.averageTemperature}°C** |
                        Umidade Média: **{insightData.averageHumidity}%** |
                        Total de Registros Analisados: **{insightData.totalRecords}**
                    </p>
                </Card>
            )}

            {/* Tabela de Logs de Clima */}
            <h2 className="text-2xl font-semibold mb-4">Logs de Clima ({weatherData.length} Últimos Registros)</h2>

            {weatherData.length === 0 ? (
                <Card className="p-4 text-center text-gray-500">Nenhum dado de clima encontrado no banco de dados.</Card>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Timestamp</TableHead>
                                <TableHead>Local</TableHead>
                                <TableHead>Condição</TableHead>
                                <TableHead className="text-right">Temperatura (°C)</TableHead>
                                <TableHead className="text-right">Umidade (%)</TableHead>
                                <TableHead className="text-right">Vento (km/h)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {weatherData.map((log) => (
                                <TableRow key={log._id}>
                                    <TableCell className="font-medium">
                                        {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        <div className="text-xs text-gray-500">
                                            {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                                        </div>
                                    </TableCell>
                                    <TableCell>{log.city}</TableCell>
                                    <TableCell>{log.condition}</TableCell>
                                    <TableCell className="text-right">{(log.temperature_c ?? 0).toFixed(1)}</TableCell>
                                    <TableCell className="text-right">{(log.humidity_percent ?? 0).toFixed(0)}</TableCell>
                                    <TableCell className="text-right">{(log.wind_speed_kmh ?? 0).toFixed(1)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

export default Dashboard;