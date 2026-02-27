"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, BarChart3, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(8, "Mínimo de 8 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.email, data.senha);
      toast.success("Bem-vindo ao ContAI!");
      router.push("/dashboard");
    } catch {
      toast.error("E-mail ou senha incorretos");
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">ContAI</h1>
          <p className="text-xs text-brand-300">Plataforma do Contador</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Entrar na conta</h2>
        <p className="text-brand-300 text-sm mt-1">Acesse seu painel de clientes</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-200 mb-1.5">
            E-mail
          </label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="contador@escritorio.com"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-200 mb-1.5">
            Senha
          </label>
          <div className="relative">
            <input
              {...register("senha")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 pr-11 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.senha && (
            <p className="text-red-400 text-xs mt-1">{errors.senha.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            href="/recuperar-senha"
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 flex items-center justify-center gap-2 text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </button>
      </form>

      <p className="text-center text-xs text-brand-400 mt-6">
        Não tem conta?{" "}
        <Link href="/registro" className="text-brand-300 hover:text-white transition-colors font-medium">
          Fale com nossa equipe
        </Link>
      </p>
    </div>
  );
}
