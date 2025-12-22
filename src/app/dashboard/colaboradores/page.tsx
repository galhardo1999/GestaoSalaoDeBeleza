import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"
import { ColaboradoresClient } from "./colaboradores-client"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

import { SelectCompanyState } from "@/components/dashboard/select-company-state"

export default async function ColaboradoresPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.empresaId) {
        if (session?.user?.cargo === "SUPER_ADMIN") {
            return <SelectCompanyState />
        }
        redirect("/login")
    }

    const where: Prisma.ColaboradorWhereInput = {
        empresaId: session.user.empresaId,
    }

    const [colaboradores, servicos] = await Promise.all([
        db.colaborador.findMany({
            where,
            orderBy: { nome: 'asc' },
            include: {
                servicos: true
            } as any // Cast como any porque a relação pode ser implícita ou explícita, verificado no código anterior
        }),
        db.servico.findMany({
            where: { ativo: true, empresaId: session.user.empresaId },
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
        cpf: c.cpf,
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

    return (
        <ColaboradoresClient
            colaboradores={formattedColaboradores}
            servicos={formattedServicos}
        />
    )
}
