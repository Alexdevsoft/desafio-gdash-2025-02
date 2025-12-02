import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

const Label = ({ children, ...props }: any) =>
    <label {...props} className="text-gray-700 font-medium text-sm">{children}</label>;

export const RegisterPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Se já estiver autenticado, redireciona para a home
    if (isAuthenticated) {
        navigate('/');
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            await register(email, password);

            navigate('/');

        } catch (err: any) {
            console.error("Registration failed:", err);
            setError(err.message || 'Ocorreu um erro ao tentar registrar. Tente novamente.');

        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <Card className="w-full max-w-sm md:max-w-md shadow-2xl rounded-xl">
                <CardHeader className="pt-6 px-6 pb-0">
                    <div className="text-3xl text-center font-bold text-gray-800 mb-6">
                        📝 Criar Conta GDASH
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-4">
                    <form onSubmit={handleSubmit} className="grid gap-5">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="novo.usuario@projeto.com"
                                required
                                value={email}
                                onChange={(e: any) => setEmail(e.target.value)}
                                className="h-12 p-3 focus-visible:ring-blue-500"
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
                                className="h-12 p-3 focus-visible:ring-blue-500"
                            />
                        </div>

                        {error && <div className="p-3 bg-red-100 border border-red-300 text-red-600 rounded-lg text-sm font-medium">{error}</div>}

                        <Button
                            type="submit"
                            className="w-full mt-2 h-12 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.005] bg-green-600 hover:bg-green-700"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Criando Conta...
                                </span>
                            ) : (
                                'Criar Conta'
                            )}
                        </Button>

                        <p className="text-center text-sm mt-3 text-gray-500">
                            Já tem conta? <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition duration-150">Faça Login</Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};