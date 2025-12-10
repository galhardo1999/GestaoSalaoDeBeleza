import { z } from 'zod';

export const agendamentoSchema = z.object({
    clienteId: z.string().min(1, 'Por favor selecione um cliente'),
    servicoId: z.string().min(1, 'Por favor selecione um serviço'),
    data: z.string().refine((val) => new Date(val).getTime() > Date.now(), {
        message: "A data do agendamento deve ser no futuro",
    }),
    observacoes: z.string().optional(),
});
