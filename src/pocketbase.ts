import Pocketbase from 'pocketbase';

export const pb = new Pocketbase(import.meta.env.VITE_API_URL ?? 'http://localhost:8090');
