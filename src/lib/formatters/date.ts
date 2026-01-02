/**
 * Formatadores de Data e Hora
 * 
 * Funções para formatação de datas e horários no padrão brasileiro.
 */

import { format, formatDistanceToNow, isToday, isYesterday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/**
 * Formata uma data para o padrão brasileiro
 * @param date - Data a ser formatada
 * @param pattern - Padrão de formatação (padrão: dd/MM/yyyy)
 * @returns Data formatada ou string vazia
 * 
 * @example
 * formatDate(new Date()) // "02/01/2026"
 * formatDate(new Date(), "dd 'de' MMMM") // "02 de janeiro"
 */
export function formatDate(
    date: Date | string | null | undefined,
    pattern: string = 'dd/MM/yyyy'
): string {
    if (!date) return ''

    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (isNaN(dateObj.getTime())) return ''

    return format(dateObj, pattern, { locale: ptBR })
}

/**
 * Formata data e hora para o padrão brasileiro
 * @param date - Data a ser formatada
 * @returns Data e hora formatadas (dd/MM/yyyy HH:mm)
 */
export function formatDateTime(date: Date | string | null | undefined): string {
    return formatDate(date, 'dd/MM/yyyy HH:mm')
}

/**
 * Formata apenas o horário
 * @param date - Data/hora a ser formatada
 * @returns Horário formatado (HH:mm)
 */
export function formatTime(date: Date | string | null | undefined): string {
    return formatDate(date, 'HH:mm')
}

/**
 * Formata data de forma relativa (ex: "há 2 horas", "ontem")
 * @param date - Data a ser formatada
 * @returns Descrição relativa da data
 */
export function formatRelativeDate(date: Date | string | null | undefined): string {
    if (!date) return ''

    const dateObj = typeof date === 'string' ? new Date(date) : date

    if (isNaN(dateObj.getTime())) return ''

    if (isToday(dateObj)) {
        return `Hoje às ${formatTime(dateObj)}`
    }

    if (isYesterday(dateObj)) {
        return `Ontem às ${formatTime(dateObj)}`
    }

    if (isTomorrow(dateObj)) {
        return `Amanhã às ${formatTime(dateObj)}`
    }

    return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR })
}

/**
 * Formata data com dia da semana
 * @param date - Data a ser formatada
 * @returns Data com dia da semana (ex: "Segunda, 02 de janeiro")
 */
export function formatDateWithWeekday(date: Date | string | null | undefined): string {
    return formatDate(date, "EEEE, dd 'de' MMMM")
}

/**
 * Formata data para exibição longa
 * @param date - Data a ser formatada
 * @returns Data no formato longo (ex: "02 de janeiro de 2026")
 */
export function formatDateLong(date: Date | string | null | undefined): string {
    return formatDate(date, "dd 'de' MMMM 'de' yyyy")
}

/**
 * Formata duração em minutos para formato legível
 * @param minutes - Duração em minutos
 * @returns Duração formatada (ex: "1h 30min")
 * 
 * @example
 * formatDuration(90) // "1h 30min"
 * formatDuration(45) // "45min"
 */
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes}min`
    }

    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (mins === 0) {
        return `${hours}h`
    }

    return `${hours}h ${mins}min`
}

/**
 * Formata intervalo de horário
 * @param start - Horário inicial
 * @param end - Horário final
 * @returns Intervalo formatado (ex: "09:00 - 10:30")
 */
export function formatTimeRange(
    start: Date | string | null | undefined,
    end: Date | string | null | undefined
): string {
    const startTime = formatTime(start)
    const endTime = formatTime(end)

    if (!startTime || !endTime) return ''

    return `${startTime} - ${endTime}`
}
