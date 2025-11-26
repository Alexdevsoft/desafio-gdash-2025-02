// frontend/src/components/ui/button.tsx
import React from 'react';

type ButtonVariant = 'default' | 'outline' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

const Button: React.FC<ButtonProps> = ({ children, className, variant, ...props }) => {
    let variantClass = 'bg-blue-600 text-white hover:bg-blue-700'; // default
    if (variant === 'outline') {
        variantClass = 'border border-gray-400 bg-white text-gray-800 hover:bg-gray-100';
    } else if (variant === 'ghost') {
        variantClass = 'text-gray-800 hover:bg-gray-100';
    }
    return (
        <button
            className={`p-2 rounded font-semibold transition bg-blue-600 text-white hover:bg-blue-700 ${variantClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export { Button };