/**
 * Constantes de paginação
 * 
 * Este arquivo centraliza as configurações de paginação utilizadas
 * em tabelas e listas paginadas em todo o sistema.
 */

/**
 * Opções padrão para itens por página
 */
export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const

/**
 * Número padrão de itens por página
 */
export const DEFAULT_ITEMS_PER_PAGE = 25

/**
 * Tipo para valores válidos de itens por página
 */
export type ItemsPerPage = typeof ITEMS_PER_PAGE_OPTIONS[number]

/**
 * Configuração para componentes de paginação
 */
export interface PaginationConfig {
    /** Opções disponíveis para seleção */
    options: readonly number[]
    /** Valor padrão */
    defaultValue: number
}

/**
 * Configuração padrão de paginação
 */
export const defaultPaginationConfig: PaginationConfig = {
    options: ITEMS_PER_PAGE_OPTIONS,
    defaultValue: DEFAULT_ITEMS_PER_PAGE,
}
