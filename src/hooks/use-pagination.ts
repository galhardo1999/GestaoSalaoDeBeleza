'use client'

import { useState, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ITEMS_PER_PAGE_OPTIONS, DEFAULT_ITEMS_PER_PAGE } from '@/lib/constants/pagination'

interface UsePaginationOptions<T> {
    /** Dados a serem paginados */
    items: T[]
    /** Número inicial de itens por página */
    initialItemsPerPage?: number
    /** Página inicial (1-indexed) */
    initialPage?: number
    /** Se true, sincroniza com URL query params */
    syncWithUrl?: boolean
    /** Chave para o parâmetro de página na URL */
    pageParamKey?: string
    /** Chave para o parâmetro de itens por página na URL */
    perPageParamKey?: string
}

interface UsePaginationResult<T> {
    /** Itens da página atual */
    paginatedItems: T[]
    /** Página atual (1-indexed) */
    currentPage: number
    /** Total de páginas */
    totalPages: number
    /** Total de itens */
    totalItems: number
    /** Itens por página */
    itemsPerPage: number
    /** Opções disponíveis para itens por página */
    itemsPerPageOptions: readonly number[]
    /** Se há página anterior */
    hasPreviousPage: boolean
    /** Se há próxima página */
    hasNextPage: boolean
    /** Ir para uma página específica */
    goToPage: (page: number) => void
    /** Ir para a próxima página */
    nextPage: () => void
    /** Ir para a página anterior */
    previousPage: () => void
    /** Ir para a primeira página */
    firstPage: () => void
    /** Ir para a última página */
    lastPage: () => void
    /** Alterar itens por página */
    setItemsPerPage: (count: number) => void
    /** Índice do primeiro item exibido (1-indexed) */
    startIndex: number
    /** Índice do último item exibido (1-indexed) */
    endIndex: number
}

/**
 * Hook para gerenciar paginação de listas.
 * 
 * @example
 * ```tsx
 * const {
 *   paginatedItems,
 *   currentPage,
 *   totalPages,
 *   goToPage,
 *   setItemsPerPage
 * } = usePagination({
 *   items: clientes,
 *   initialItemsPerPage: 25,
 *   syncWithUrl: true
 * })
 * ```
 */
export function usePagination<T>({
    items,
    initialItemsPerPage = DEFAULT_ITEMS_PER_PAGE,
    initialPage = 1,
    syncWithUrl = false,
    pageParamKey = 'page',
    perPageParamKey = 'perPage',
}: UsePaginationOptions<T>): UsePaginationResult<T> {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Estado local ou sincronizado com URL
    const [localPage, setLocalPage] = useState(() => {
        if (syncWithUrl) {
            const urlPage = searchParams.get(pageParamKey)
            return urlPage ? parseInt(urlPage, 10) : initialPage
        }
        return initialPage
    })

    const [localItemsPerPage, setLocalItemsPerPage] = useState(() => {
        if (syncWithUrl) {
            const urlPerPage = searchParams.get(perPageParamKey)
            return urlPerPage ? parseInt(urlPerPage, 10) : initialItemsPerPage
        }
        return initialItemsPerPage
    })

    const currentPage = syncWithUrl
        ? parseInt(searchParams.get(pageParamKey) ?? String(initialPage), 10)
        : localPage

    const itemsPerPage = syncWithUrl
        ? parseInt(searchParams.get(perPageParamKey) ?? String(initialItemsPerPage), 10)
        : localItemsPerPage

    // Cálculos de paginação
    const totalItems = items.length
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
    const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages)

    const startIndex = (validCurrentPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

    const paginatedItems = useMemo(() => {
        return items.slice(startIndex, endIndex)
    }, [items, startIndex, endIndex])

    // Funções de navegação
    const updateUrl = useCallback((page: number, perPage: number) => {
        if (!syncWithUrl) return

        const params = new URLSearchParams(searchParams.toString())
        params.set(pageParamKey, String(page))
        params.set(perPageParamKey, String(perPage))
        router.push(`${pathname}?${params.toString()}`)
    }, [syncWithUrl, searchParams, pathname, router, pageParamKey, perPageParamKey])

    const goToPage = useCallback((page: number) => {
        const validPage = Math.min(Math.max(1, page), totalPages)
        if (syncWithUrl) {
            updateUrl(validPage, itemsPerPage)
        } else {
            setLocalPage(validPage)
        }
    }, [totalPages, syncWithUrl, updateUrl, itemsPerPage])

    const nextPage = useCallback(() => {
        if (validCurrentPage < totalPages) {
            goToPage(validCurrentPage + 1)
        }
    }, [validCurrentPage, totalPages, goToPage])

    const previousPage = useCallback(() => {
        if (validCurrentPage > 1) {
            goToPage(validCurrentPage - 1)
        }
    }, [validCurrentPage, goToPage])

    const firstPage = useCallback(() => {
        goToPage(1)
    }, [goToPage])

    const lastPage = useCallback(() => {
        goToPage(totalPages)
    }, [goToPage, totalPages])

    const setItemsPerPage = useCallback((count: number) => {
        // Ao mudar itens por página, volta para a primeira página
        if (syncWithUrl) {
            updateUrl(1, count)
        } else {
            setLocalItemsPerPage(count)
            setLocalPage(1)
        }
    }, [syncWithUrl, updateUrl])

    return {
        paginatedItems,
        currentPage: validCurrentPage,
        totalPages,
        totalItems,
        itemsPerPage,
        itemsPerPageOptions: ITEMS_PER_PAGE_OPTIONS,
        hasPreviousPage: validCurrentPage > 1,
        hasNextPage: validCurrentPage < totalPages,
        goToPage,
        nextPage,
        previousPage,
        firstPage,
        lastPage,
        setItemsPerPage,
        startIndex: startIndex + 1,
        endIndex,
    }
}
