"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Loader2, MoreHorizontal, Plus, Trash, Pencil } from "lucide-react"
import { createCompanyUser, updateCompanyUser, deleteCompanyUser } from "@/actions/admin/users"

interface User {
    id: string
    nome: string
    cnpj: string
    cargo: "ADMIN" | "FUNCIONARIO" | "SUPER_ADMIN"
    criadoEm: Date
}

interface CompanyUsersManagerProps {
    empresaId: string
    usuarios: User[]
}

export function CompanyUsersManager({ empresaId, usuarios }: CompanyUsersManagerProps) {
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeleteOpen, setIsDeleteOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Resetar estado ao fechar
    const handleClose = () => {
        setIsCreateOpen(false)
        setIsEditOpen(false)
        setIsDeleteOpen(false)
        setSelectedUser(null)
        setError(null)
        setIsLoading(false)
    }

    async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        setError(null)
        const formData = new FormData(event.currentTarget)

        const result = await createCompanyUser(empresaId, formData)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        } else {
            handleClose()
        }
    }

    async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!selectedUser) return

        setIsLoading(true)
        setError(null)
        const formData = new FormData(event.currentTarget)

        const result = await updateCompanyUser(selectedUser.id, empresaId, formData)

        if (result?.error) {
            setError(result.error)
            setIsLoading(false)
        } else {
            handleClose()
        }
    }

    async function handleDelete() {
        if (!selectedUser) return

        setIsLoading(true)
        const result = await deleteCompanyUser(selectedUser.id, empresaId)

        if (result?.error) {
            setError(result.error) // Isso pode ficar oculto se o diálogo fechar, mas idealmente mantemos aberto em erro
            setIsLoading(false)
        } else {
            handleClose()
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Usuário
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>CNPJ (Login)</TableHead>
                            <TableHead>Cargo</TableHead>
                            <TableHead>Data Criação</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {usuarios.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-gray-500">
                                    Nenhum usuário encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            usuarios.map((usuario) => (
                                <TableRow key={usuario.id}>
                                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                                    <TableCell>{usuario.cnpj}</TableCell>
                                    <TableCell>{usuario.cargo}</TableCell>
                                    <TableCell>
                                        {format(new Date(usuario.criadoEm), "dd/MM/yyyy", { locale: ptBR })}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setSelectedUser(usuario)
                                                        setIsEditOpen(true)
                                                    }}
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => {
                                                        setSelectedUser(usuario)
                                                        setIsDeleteOpen(true)
                                                    }}
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    Excluir
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Diálogo de Criação */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Usuário</DialogTitle>
                        <DialogDescription>
                            Crie um usuário para acessar o painel desta empresa.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome</Label>
                            <Input id="nome" name="nome" required placeholder="Nome completo" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cnpj">CNPJ (Login)</Label>
                            <Input id="cnpj" name="cnpj" required placeholder="Somente números" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cargo">Cargo</Label>
                            <Select name="cargo" defaultValue="FUNCIONARIO" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADMIN">Administrador</SelectItem>
                                    <SelectItem value="FUNCIONARIO">Funcionário</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="senha">Senha</Label>
                            <Input id="senha" name="senha" type="password" required />
                        </div>

                        {error && <div className="text-red-500 text-sm">{error}</div>}

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Criar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Diálogo de Edição */}
            <Dialog open={isEditOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                        <DialogDescription>
                            Altere os dados do usuário. Deixe a senha em branco para não alterar.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-nome">Nome</Label>
                                <Input id="edit-nome" name="nome" defaultValue={selectedUser.nome} required />
                            </div>
                            <div className="space-y-2">
                                <Label>CNPJ</Label>
                                <Input value={selectedUser.cnpj} disabled className="bg-gray-100" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-cargo">Cargo</Label>
                                <Select name="cargo" defaultValue={selectedUser.cargo} required>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Administrador</SelectItem>
                                        <SelectItem value="FUNCIONARIO">Funcionário</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-senha">Nova Senha (Opcional)</Label>
                                <Input id="edit-senha" name="senha" type="password" placeholder="Deixe em branco para manter" />
                            </div>

                            {error && <div className="text-red-500 text-sm">{error}</div>}

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Salvar Alterações
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Diálogo de Exclusão */}
            <Dialog open={isDeleteOpen} onOpenChange={(open) => !open && handleClose()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Excluir Usuário</DialogTitle>
                        <DialogDescription>
                            Tem certeza que deseja excluir <b>{selectedUser?.nome}</b>? Esta ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>

                    {error && <div className="text-red-500 text-sm mb-2">{error}</div>}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>Cancelar</Button>
                        <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Excluir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
