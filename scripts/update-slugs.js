
const { PrismaClient } = require('@prisma/client')
const { Pool } = require('pg')
const { PrismaPg } = require('@prisma/adapter-pg')

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

function toSlug(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
}

async function main() {
    const empresas = await prisma.empresa.findMany({
        where: { slug: null }
    })


    console.log(`Found ${empresas.length} companies without slug.`)

    for (const empresa of empresas) {
        let baseSlug = toSlug(empresa.nome)
        let slug = baseSlug
        let count = 1

        while (await prisma.empresa.findUnique({ where: { slug } })) {
            slug = `${baseSlug}-${count}`
            count++
        }

        console.log(`Updating ${empresa.nome} -> ${slug}`)
        await prisma.empresa.update({
            where: { id: empresa.id },
            data: { slug }
        })
    }
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
