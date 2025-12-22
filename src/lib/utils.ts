import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return ""
  const cleaned = cpf.replace(/\D/g, "")
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

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

export function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return ""
  const cleaned = cnpj.replace(/\D/g, "")
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")
}

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
