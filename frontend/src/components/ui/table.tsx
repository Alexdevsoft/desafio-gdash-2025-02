// frontend/src/components/ui/table.tsx
import React from 'react';

// Componente Table simples para evitar o erro de importação.
const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ children, className, ...props }) => (
    <div className="w-full overflow-auto">
        <table className={`w-full caption-bottom text-sm ${className}`} {...props}>{children}</table>
    </div>
);

const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
    <thead className={`[&_tr]:border-b ${className}`} {...props}>{children}</thead>
);

const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className, ...props }) => (
    <tbody className={`[&_tr:last-child]:border-0 ${className}`} {...props}>{children}</tbody>
);

const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className, ...props }) => (
    <tr className={`border-b transition-colors hover:bg-gray-100 data-[state=selected]:bg-gray-100 ${className}`} {...props}>{children}</tr>
);

const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
    <th className={`h-12 px-4 text-left align-middle font-medium text-gray-500 [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>{children}</th>
);

const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
    <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`} {...props}>{children}</td>
);

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };