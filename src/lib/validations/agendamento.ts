import { z } from 'zod';

export const agendamentoSchema = z.object({
    clienteId: z.string().min(1, 'Por favor selecione um cliente'),
    servicoId: z.string().min(1, 'Por favor selecione um serviço'),
    data: z.string().refine((val) => {
        // Assumir que a entrada está no horário do Brasil (UTC-3)
        // formato val é "YYYY-MM-DDTHH:mm"
        const dateInBrazil = new Date(`${val}:00-03:00`);
        return dateInBrazil.getTime() > Date.now();
    }, {
        message: "A data do agendamento deve ser no futuro",
    }),
    colaboradorId: z.string().optional(),
    observacoes: z.string().optional(),
    valor: z.string().or(z.number()).transform(val => Number(val)).optional(),
});
