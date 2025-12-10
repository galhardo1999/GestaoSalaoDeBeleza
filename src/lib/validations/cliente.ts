import { z } from 'zod';

export const clienteSchema = z.object({
    nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    cpf: z.string().optional().or(z.literal('')),
    telefone: z.string().min(8, 'Telefone inválido'),
    observacoes: z.string().optional(),
});
