import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { ColaboradoresClient } from "./colaboradores-client"

export default async function ColaboradoresPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>
}) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const query = params.q || ''
    const itemsPerPage = 10
    const skip = (currentPage - 1) * itemsPerPage

    const where: Prisma.ColaboradorWhereInput = query ? {
        OR: [
            { nome: { contains: query, mode: Prisma.QueryMode.insensitive } },
            { email: { contains: query, mode: Prisma.QueryMode.insensitive } },
        ]
    } : {}

    const [totalItems, colaboradores, servicos] = await Promise.all([
        db.colaborador.count({ where }),
        db.colaborador.findMany({
            where,
            orderBy: { nome: 'asc' },
            skip,
            take: itemsPerPage,
            include: {
                servicos: true
            } as any
        }),
        db.servico.findMany({
            where: { ativo: true },
            orderBy: { nome: 'asc' }
        })
    ])

    const formattedServicos = servicos.map(s => ({
        id: s.id,
        nome: s.nome,
        preco: Number(s.preco),
        duracaoMin: s.duracaoMin,
        ativo: s.ativo,
        criadoEm: s.criadoEm,
        atualizadoEm: s.atualizadoEm
    }))

    const formattedColaboradores = colaboradores.map((c: any) => ({
        id: c.id,
        codigo: c.codigo.toString(),
        nome: c.nome,
        email: c.email,
        foto: c.foto,
        servicosPrestados: c.servicos ? c.servicos.map((s: any) => s.nome) : [],
        servicosRaw: c.servicos ? c.servicos.map((s: any) => ({
            id: s.id,
            nome: s.nome,
            preco: Number(s.preco),
            duracaoMin: s.duracaoMin,
            ativo: s.ativo,
            criadoEm: s.criadoEm,
            atualizadoEm: s.atualizadoEm
        })) : []
    }))

    const totalPages = Math.ceil(totalItems / itemsPerPage)

    return (
        <ColaboradoresClient
            colaboradores={formattedColaboradores}
            servicos={formattedServicos}
            pagination={{
                currentPage,
                totalPages,
                itemsPerPage,
                totalItems
            }}
        />
    )
}
