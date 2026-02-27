"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-client";

const clienteSchema = z.object({
  nomeEmpresa: z.string().min(2, "Nome da empresa é obrigatório"),
  cnpj: z.string().min(14, "CNPJ inválido").max(18, "CNPJ inválido"),
  regimeTributario: z.enum(["SIMPLES_NACIONAL", "LUCRO_PRESUMIDO", "LUCRO_REAL", "MEI"]),
  nomeResponsavel: z.string().min(2, "Nome do responsável é obrigatório"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  observacoes: z.string().optional(),
});

type ClienteForm = z.infer<typeof clienteSchema>;

export default function NovoClientePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ClienteForm>({
    resolver: zodResolver(clienteSchema),
    defaultValues: { regimeTributario: "SIMPLES_NACIONAL" },
  });

  const onSubmit = async (data: ClienteForm) => {
    setIsSubmitting(true);
    try {
      await api.post("/clientes", data);
      toast.success("Cliente cadastrado com sucesso!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Erro ao cadastrar cliente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all text-sm";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";
  const errorClass = "text-red-500 text-xs mt-1";

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Cliente</h1>
          <p className="text-sm text-gray-500 mt-0.5">Preencha os dados para cadastrar um novo cliente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Dados da Empresa</h2>
          <div>
            <label className={labelClass}>Nome da Empresa *</label>
            <input {...register("nomeEmpresa")} placeholder="Ex: Empresa ABC Ltda" className={inputClass} />
            {errors.nomeEmpresa && <p className={errorClass}>{errors.nomeEmpresa.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>CNPJ *</label>
              <input {...register("cnpj")} placeholder="00.000.000/0001-00" className={inputClass} />
              {errors.cnpj && <p className={errorClass}>{errors.cnpj.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Regime Tributário *</label>
              <select {...register("regimeTributario")} className={inputClass}>
                <option value="SIMPLES_NACIONAL">Simples Nacional</option>
                <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
                <option value="LUCRO_REAL">Lucro Real</option>
                <option value="MEI">MEI</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Endereço</label>
            <input {...register("endereco")} placeholder="Rua, número, bairro, cidade - UF" className={inputClass} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">Dados do Responsável</h2>
          <div>
            <label className={labelClass}>Nome do Responsável *</label>
            <input {...register("nomeResponsavel")} placeholder="Nome completo" className={inputClass} />
            {errors.nomeResponsavel && <p className={errorClass}>{errors.nomeResponsavel.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>E-mail *</label>
              <input {...register("email")} type="email" placeholder="email@empresa.com" className={inputClass} />
              {errors.email && <p className={errorClass}>{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input {...register("telefone")} placeholder="(00) 00000-0000" className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-card p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Observações</h2>
          <textarea {...register("observacoes")} rows={3} placeholder="Informações adicionais..." className={`${inputClass} resize-none`} />
        </div>

        <div className="flex gap-3 justify-end">
          <Link href="/dashboard" className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
            Cancelar
          </Link>
          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white font-semibold rounded-lg transition-all shadow-lg shadow-brand-500/30 flex items-center gap-2 text-sm">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Cadastrando...</> : "Cadastrar Cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}