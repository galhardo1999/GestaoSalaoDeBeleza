"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signIn } from "next-auth/react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
    cnpj: z.string().min(14, {
        message: "CNPJ inválido.",
    }),
    password: z.string().min(1, {
        message: "A senha é obrigatória.",
    }),
})

export function LoginForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [error, setError] = React.useState<string | null>(null)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            cnpj: "", // Changed from email
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        setError(null)

        const result = await signIn("credentials", {
            cnpj: values.cnpj.replace(/\D/g, ""), // Remove formatting before sending
            password: values.password,
            redirect: false,
        })

        if (result?.error) {
            setError("Credenciais inválidas. Verifique CNPJ e senha.")
            setIsLoading(false)
        } else {
            router.push("/dashboard")
            router.refresh()
        }
    }

    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Acesso ao Sistema</CardTitle>
                <CardDescription>
                    Entre com seu CNPJ e senha para continuar.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="cnpj"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>CNPJ</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="00.000.000/0000-00"
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                    .replace(/\D/g, "")
                                                    .replace(/^(\d{2})(\d)/, "$1.$2")
                                                    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
                                                    .replace(/\.(\d{3})(\d)/, ".$1/$2")
                                                    .replace(/(\d{4})(\d)/, "$1-$2")
                                                    .slice(0, 18)
                                                field.onChange(value)
                                            }}
                                            maxLength={18}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="******" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {error && (
                            <div className="text-sm text-red-500 font-medium">{error}</div>
                        )}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Entrar
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
