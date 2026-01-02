/**
 * Tipos centralizados para Server Actions
 * Este arquivo contém tipos reutilizáveis para gerenciar estados de ações
 */

/**
 * Estado base para ações de servidor com suporte a erros de validação
 * @template T - Tipo das chaves de erro específicas da entidade
 */
export interface BaseActionState<T extends string = string> {
    /** Erros de validação mapeados por campo */
    errors?: Partial<Record<T | '_form', string[]>>
    /** Mensagem de feedback para o usuário */
    message?: string
    /** Indica se a ação foi bem-sucedida */
    success?: boolean
}

// ============================================
// Estados específicos por entidade
// ============================================

/** Campos de erro para ações de Cliente */
export type ClienteErrorFields = 'nome' | 'email' | 'cpf' | 'telefone' | 'observacoes'

/** Estado de ação para operações de Cliente */
export type ClienteActionState = BaseActionState<ClienteErrorFields>

/** Campos de erro para ações de Colaborador */
export type ColaboradorErrorFields = 'nome' | 'email' | 'senha' | 'cpf'

/** Estado de ação para operações de Colaborador */
export type ColaboradorActionState = BaseActionState<ColaboradorErrorFields>

/** Campos de erro para ações de Serviço */
export type ServicoErrorFields = 'nome' | 'preco' | 'duracaoMin'

/** Estado de ação para operações de Serviço */
export type ServicoActionState = BaseActionState<ServicoErrorFields>

/** Campos de erro para ações de Agendamento */
export type AgendamentoErrorFields = 'clienteId' | 'servicoId' | 'data' | 'colaboradorId' | 'valor'

/** Estado de ação para operações de Agendamento */
export type AgendamentoActionState = BaseActionState<AgendamentoErrorFields>

// ============================================
// Tipo genérico para formulários
// ============================================

/**
 * Estado inicial padrão para formulários
 * Pode ser usado como valor inicial em useActionState
 */
export const createInitialState = <T extends string>(): BaseActionState<T> => ({
    message: '',
    errors: {},
})

// ============================================
// Tipos utilitários
// ============================================

/** Tipo para funções de ação de servidor */
export type ServerActionFn<TState, TPayload = FormData> = (
    prevState: TState,
    payload: TPayload
) => Promise<TState>

/** Tipo para resultado de ações simples (sem formulário) */
export interface SimpleActionResult {
    message?: string
    error?: string
    success?: boolean
}
