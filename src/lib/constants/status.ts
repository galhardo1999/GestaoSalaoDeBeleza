/**
 * Configurações de status para agendamentos
 * 
 * Este arquivo centraliza as configurações visuais e labels para os diferentes
 * status de agendamentos utilizados em todo o sistema.
 */

export type AgendamentoStatus =
    | 'PENDENTE'
    | 'AGENDADO'
    | 'CONFIRMADO'
    | 'CONCLUIDO'
    | 'CANCELADO'
    | 'NAO_COMPARECEU'

export interface StatusConfig {
    /** Label exibido para o usuário */
    label: string
    /** Variante do Badge component */
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    /** Classes CSS para estilização */
    className: string
}

/**
 * Configurações de status para uso em tabelas e badges
 */
export const statusConfig: Record<AgendamentoStatus, StatusConfig> = {
    PENDENTE: {
        label: 'Pendente',
        variant: 'secondary',
        className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    },
    AGENDADO: {
        label: 'Confirmado',
        variant: 'default',
        className: 'bg-green-100 text-green-700 hover:bg-green-200',
    },
    CONFIRMADO: {
        label: 'Confirmado',
        variant: 'default',
        className: 'bg-green-100 text-green-700 hover:bg-green-200',
    },
    CONCLUIDO: {
        label: 'Concluído',
        variant: 'secondary',
        className: 'bg-gray-100 text-gray-600 hover:bg-gray-100',
    },
    CANCELADO: {
        label: 'Cancelado',
        variant: 'destructive',
        className: 'bg-red-100 text-red-700 hover:bg-red-200',
    },
    NAO_COMPARECEU: {
        label: 'Não Compareceu',
        variant: 'destructive',
        className: 'bg-red-100 text-red-700 hover:bg-red-200',
    },
}

/**
 * Obtém a configuração de status para um dado status
 * @param status - Status do agendamento
 * @returns Configuração de status ou configuração padrão se não encontrado
 */
export function getStatusConfig(status: string): StatusConfig {
    return statusConfig[status as AgendamentoStatus] ?? {
        label: status.charAt(0) + status.slice(1).toLowerCase(),
        variant: 'secondary',
        className: 'bg-gray-100 text-gray-500 hover:bg-gray-100',
    }
}

/**
 * Obtém apenas o label do status
 * @param status - Status do agendamento
 * @returns Label formatado para exibição
 */
export function getStatusLabel(status: string): string {
    return getStatusConfig(status).label
}

/**
 * Obtém as classes CSS do status
 * @param status - Status do agendamento
 * @returns Classes CSS para estilização
 */
export function getStatusClassName(status: string): string {
    return getStatusConfig(status).className
}
