import { Scissors } from "lucide-react"

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full bg-background">
            <div className="hidden lg:flex w-1/2 flex-col justify-between bg-zinc-950 p-12 text-zinc-50 relative overflow-hidden">
                {/* Background Pattern/Texture overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23d4af37\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                
                <div className="relative z-10 flex items-center gap-2">
                    <div className="bg-primary/20 p-2 rounded-lg border border-primary/30">
                        <Scissors className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-heading text-2xl font-bold tracking-wider gold-gradient">BARBER & CO.</span>
                </div>
                
                <div className="relative z-10 max-w-lg">
                    <h1 className="font-heading text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                        A excelência em gestão que o seu negócio merece.
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Controle de agendamentos, finanças e profissionais em uma plataforma pensada para barbearias e salões premium.
                    </p>
                </div>
                
                <div className="relative z-10 text-sm text-zinc-500">
                    &copy; {new Date().getFullYear()} Barber & Co. Todos os direitos reservados.
                </div>
            </div>
            
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <div className="bg-primary/20 p-2 rounded-lg border border-primary/30">
                            <Scissors className="h-6 w-6 text-primary" />
                        </div>
                        <span className="font-heading text-2xl font-bold tracking-wider gold-gradient">BARBER & CO.</span>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )
}
