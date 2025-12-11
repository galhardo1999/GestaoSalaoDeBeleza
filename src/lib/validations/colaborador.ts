import { z } from 'zod';

export const colaboradorSchema = z.object({
    nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    foto: z.string().optional(),
    servicos: z.array(z.string()).optional(),
});

export const colaboradorEdicaoSchema = z.object({
    id: z.string(),
    nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres').optional().or(z.literal('')),
    foto: z.string().optional(),
    servicos: z.array(z.string()).optional(),
});
