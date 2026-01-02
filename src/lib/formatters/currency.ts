/**
 * Formatadores de Moeda
 * 
 * Funções para formatação de valores monetários em Real brasileiro.
 */

/**
 * Opções de formatação de moeda
 */
interface CurrencyFormatOptions {
    /** Símbolo da moeda (padrão: R$) */
    symbol?: string
    /** Separador de milhar (padrão: .) */
    thousandSeparator?: string
    /** Separador decimal (padrão: ,) */
    decimalSeparator?: string
    /** Número de casas decimais (padrão: 2) */
    decimals?: number
    /** Mostrar símbolo da moeda (padrão: true) */
    showSymbol?: boolean
}

const defaultOptions: CurrencyFormatOptions = {
    symbol: 'R$',
    thousandSeparator: '.',
    decimalSeparator: ',',
    decimals: 2,
    showSymbol: true,
}

/**
 * Formata um valor numérico para moeda brasileira
 * @param value - Valor numérico a ser formatado
 * @param options - Opções de formatação
 * @returns Valor formatado como moeda
 * 
 * @example
 * formatCurrency(1234.56) // "R$ 1.234,56"
 * formatCurrency(1234.56, { showSymbol: false }) // "1.234,56"
 */
export function formatCurrency(
    value: number | string | null | undefined,
    options?: CurrencyFormatOptions
): string {
    if (value === null || value === undefined) return ''

    const opts = { ...defaultOptions, ...options }
    const numValue = typeof value === 'string' ? parseFloat(value) : value

    if (isNaN(numValue)) return ''

    const fixed = numValue.toFixed(opts.decimals!)
    const [intPart, decPart] = fixed.split('.')

    // Adiciona separador de milhar
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, opts.thousandSeparator!)

    const formatted = `${formattedInt}${opts.decimalSeparator}${decPart}`

    return opts.showSymbol ? `${opts.symbol} ${formatted}` : formatted
}

/**
 * Formata valor para moeda sem símbolo
 * @param value - Valor numérico
 * @returns Valor formatado sem símbolo
 */
export function formatCurrencyValue(value: number | string | null | undefined): string {
    return formatCurrency(value, { showSymbol: false })
}

/**
 * Converte uma string de moeda brasileira para número
 * @param value - String formatada como moeda
 * @returns Valor numérico ou NaN se inválido
 * 
 * @example
 * parseCurrency("R$ 1.234,56") // 1234.56
 * parseCurrency("1.234,56") // 1234.56
 */
export function parseCurrency(value: string | null | undefined): number {
    if (!value) return NaN

    // Remove símbolo e espaços
    const cleaned = value
        .replace(/R\$\s*/gi, '')
        .replace(/\s/g, '')
        // Troca separadores BR para formato numérico padrão
        .replace(/\./g, '')
        .replace(',', '.')

    return parseFloat(cleaned)
}

/**
 * Formata preço para exibição compacta
 * @param value - Valor numérico
 * @returns Valor formatado de forma compacta
 * 
 * @example
 * formatPriceCompact(1500) // "R$ 1,5k"
 * formatPriceCompact(1500000) // "R$ 1,5M"
 */
export function formatPriceCompact(value: number): string {
    if (value >= 1000000) {
        return `R$ ${(value / 1000000).toFixed(1).replace('.', ',')}M`
    }
    if (value >= 1000) {
        return `R$ ${(value / 1000).toFixed(1).replace('.', ',')}k`
    }
    return formatCurrency(value)
}
