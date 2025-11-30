// frontend/src/pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Card = ({ children, className }: any) => <div className={`border p-4 rounded ${className}`}>{children}</div>;
const CardHeader = ({ children }: any) => <h2>{children}</h2>;
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

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await login(email, password);

        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro. Tente novamente.');

        } finally {
            // O loading precisa parar no caso de erro de login, senão fica travado
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[380px]">
                <CardHeader>
                    {/* A CORREÇÃO: Usar um <h3> dentro da CardHeader para evitar o aninhamento <h2> > <h1> */}
                    <div className="text-2xl text-center font-semibold mb-2">
                        🔐 Login GDASH
                    </div>
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