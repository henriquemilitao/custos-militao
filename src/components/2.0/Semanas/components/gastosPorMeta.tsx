// import { Progress } from "@/components/ui/progress";
// import { formatCurrencyFromCents } from "@/lib/formatters/formatCurrency";

// export function GastosPorMeta({ semanaAtual }: { semanaAtual }) {
//   return (
//     <div className="space-y-3 mb-8">
//       {semanaAtual?.gastosMeta.map((item, idx: number) => {
//         const porcentagem = (item.gastoNaSemana / item.totalPlanejado) * 100;
//         return (
//           <div key={idx} className="space-y-1">
//             <div className="flex justify-between text-xs text-gray-600">
//               <span>{item.nome}</span>
//               <span>
//                 {formatCurrencyFromCents(item.gastoNaSemana)} / {formatCurrencyFromCents(item.totalPlanejado)}
//               </span>
//             </div>
//             <Progress value={porcentagem} className="h-2 [&>div]:bg-blue-500" />
//           </div>
//         );
//       })}
//     </div>
//   );
// }
