import { z } from 'zod';

// Schema for individual service within an appointment
const servicoItemSchema = z.object({
    servicoId: z.string().min(1, 'Por favor selecione um serviço'),
    colaboradorId: z.string().optional(),
    valor: z.string().or(z.number()).transform(val => Number(val)).optional(),
});

// Schema for multi-service appointment (new format)
export const agendamentoMultiServicoSchema = z.object({
    clienteId: z.string().min(1, 'Por favor selecione um cliente'),
    data: z.string().refine((val) => {
        const dateInBrazil = new Date(`${val}:00-03:00`);
        return dateInBrazil.getTime() > Date.now();
    }, {
        message: "A data do agendamento deve ser no futuro",
    }),
    servicos: z.array(servicoItemSchema).min(1, 'Adicione pelo menos um serviço'),
    observacoes: z.string().optional(),
});

// Original schema for backward compatibility (edit functionality)
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
