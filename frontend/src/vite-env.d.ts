// frontend/src/vite-env.d.ts
/// <reference types="vite/client" />

// Extende a interface ImportMeta para incluir a tipagem de 'env'
interface ImportMetaEnv {
    readonly VITE_API_URL: string;

}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}