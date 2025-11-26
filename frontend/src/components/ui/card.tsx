// frontend/src/components/ui/card.tsx
import React from 'react';

// Um componente Card simples para evitar o erro de importação.
const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    return (
        <div
            className={`rounded-lg border bg-white shadow-sm ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

// Componentes internos do Card
const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    return <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>;
};

const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className, ...props }) => {
    return <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>{children}</h3>;
};

const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className, ...props }) => {
    return <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>;
};

export { Card, CardHeader, CardTitle, CardContent };