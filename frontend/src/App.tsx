import { useState, useEffect } from 'react'
import './App.css'

// 1. Defina uma interface para tipar os dados (Se for usar TypeScript)
// Adapte esta interface para corresponder exatamente à estrutura dos seus logs de clima
interface WeatherLog {
  _id: string;
  timestamp: string;
  temperature_c: number;
  humidity_percent: number;
  wind_speed_kmh: number;
}

function App() {
  // 2. Estados para armazenar os dados, o status de carregamento e erros
  const [weatherData, setWeatherData] = useState<WeatherLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. useEffect para buscar os dados quando o componente for montado
  useEffect(() => {
    // A variável VITE_API_URL é definida no seu docker-compose.yml e deve ser acessada via import.meta.env
    // Ela deve ser 'http://localhost:3000'
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Rota que está retornando os dados com sucesso
    const ENDPOINT = `${API_URL}/api/weather/logs`;

    console.log(`Buscando dados de: ${ENDPOINT}`);

    fetch(ENDPOINT)
      .then(response => {
        // Verifica se a resposta HTTP é 200 OK
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then((data: WeatherLog[]) => {
        setWeatherData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro na busca de dados:", err);
        setError(`Não foi possível carregar dados: ${err.message}`);
        setLoading(false);
      });
  }, []); // O array vazio [] garante que a função executa apenas uma vez (ao montar)


  // 4. Lógica de renderização de estados
  if (loading) {
    return <h1>Carregando dados do clima... 🔄</h1>;
  }

  if (error) {
    return <h1>{error}</h1>;
  }

  // 5. Renderização dos dados
  return (
    <div className="weather-dashboard">
      <h1>☀️ Dashboard de Logs do Clima</h1>

      {weatherData.length === 0 ? (
        <p>Nenhum dado de clima encontrado no banco de dados. Verifique o Worker/Coletor.</p>
      ) : (
        <>
          <h2>Últimos {weatherData.length} Registros:</h2>
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Temperatura (°C)</th>
                <th>Umidade (%)</th>
                <th>Vento (km/h)</th>
              </tr>
            </thead>
            <tbody>
              {/* Mapeia os dados recebidos para criar linhas na tabela */}
              {weatherData.map((log) => (
                <tr key={log._id}>
                  <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td>{log.temperature_c}</td>
                  <td>{log.humidity_percent}</td>
                  <td>{log.wind_speed_kmh}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="read-the-docs">
            Dados obtidos da API NestJS na porta 3000.
          </p>
        </>
      )}
    </div>
  );
}

export default App