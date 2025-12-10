import { z } from 'zod';

export const servicoSchema = z.object({
    nome: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
    preco: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
        message: "Preço inválido",
    }),
    duracaoMin: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Duração inválida",
    }),
    ativo: z.boolean().optional(),
});
