/**
 * Formatadores de Documentos
 * 
 * Funções para formatação de CPF, CNPJ, telefone e outros documentos.
 */

/**
 * Formata um CPF para exibição
 * @param cpf - CPF com ou sem formatação
 * @returns CPF formatado (000.000.000-00) ou string vazia
 */
export function formatCPF(cpf: string | null | undefined): string {
    if (!cpf) return ""
    const cleaned = cpf.replace(/\D/g, "")
    if (cleaned.length !== 11) return cpf
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

/**
 * Formata um CNPJ para exibição
 * @param cnpj - CNPJ com ou sem formatação
 * @returns CNPJ formatado (00.000.000/0000-00) ou string vazia
 */
export function formatCNPJ(cnpj: string | null | undefined): string {
    if (!cnpj) return ""
    const cleaned = cnpj.replace(/\D/g, "")
    if (cleaned.length !== 14) return cnpj
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
}

/**
 * Formata um telefone para exibição
 * @param telefone - Telefone com ou sem formatação
 * @returns Telefone formatado ((00) 00000-0000 ou (00) 0000-0000) ou string original
 */
export function formatTelefone(telefone: string | null | undefined): string {
    if (!telefone) return ""
    const cleaned = telefone.replace(/\D/g, "")
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    }
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
    }
    return telefone
}

/**
 * Formata um documento (CPF ou CNPJ) automaticamente baseado no tamanho
 * @param doc - Documento com ou sem formatação
 * @returns Documento formatado ou string original
 */
export function formatDocumento(doc: string | null | undefined): string {
    if (!doc) return ""
    const cleaned = doc.replace(/\D/g, "")
    if (cleaned.length === 11) {
        return formatCPF(doc)
    }
    if (cleaned.length === 14) {
        return formatCNPJ(doc)
    }
    return doc
}

/**
 * Remove formatação de um documento (mantém apenas números)
 * @param doc - Documento formatado
 * @returns Apenas os dígitos do documento
 */
export function cleanDocument(doc: string | null | undefined): string {
    if (!doc) return ""
    return doc.replace(/\D/g, "")
}

/**
 * Valida se um CPF tem o formato correto (não valida dígitos verificadores)
 * @param cpf - CPF a ser validado
 * @returns true se o formato é válido
 */
export function isValidCPFFormat(cpf: string | null | undefined): boolean {
    if (!cpf) return false
    const cleaned = cpf.replace(/\D/g, "")
    return cleaned.length === 11
}

/**
 * Valida se um CNPJ tem o formato correto (não valida dígitos verificadores)
 * @param cnpj - CNPJ a ser validado
 * @returns true se o formato é válido
 */
export function isValidCNPJFormat(cnpj: string | null | undefined): boolean {
    if (!cnpj) return false
    const cleaned = cnpj.replace(/\D/g, "")
    return cleaned.length === 14
}
