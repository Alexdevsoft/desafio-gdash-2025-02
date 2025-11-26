// frontend/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// Importe seus componentes shadcn/ui aqui
// Ex: import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; 
// Substitua estes por componentes reais do seu projeto
const Card = ({ children, className }: any) => <div className={`border p-4 rounded ${className}`}>{children}</div>;
const CardHeader = ({ children }: any) => <h2>{children}</h2>;
const CardTitle = ({ children, className }: any) => <h1 className={className}>{children}</h1>;
const CardContent = ({ children }: any) => <div>{children}</div>;
const Input = ({ ...props }: any) => <input {...props} className="border p-2 w-full" />;
const Button = ({ children, ...props }: any) => <button {...props} className="bg-blue-500 text-white p-2 rounded">{children}</button>;
const Label = ({ children, ...props }: any) => <label {...props}>{children}</label>;


export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Se já estiver autenticado, redireciona imediatamente para o dashboard
    if (isAuthenticated) {
        navigate('/');
        return null; // Não renderiza nada enquanto redireciona
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/'); // Sucesso: Redireciona para o Dashboard
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro. Tente novamente.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[380px]">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">🔐 Login GDASH</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@empresa.com"
                                required
                                value={email}
                                onChange={(e: any) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e: any) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Entrando...' : 'Entrar'}
                        </Button>
                        {/* Opcional: Rota para registro de novo usuário (para facilitar o teste) */}
                        <p className="text-center text-sm mt-2">
                            Ainda não tem conta? <Link to="/register" className="text-blue-500">Registre-se</Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};