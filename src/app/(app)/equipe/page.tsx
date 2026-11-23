import { redirect } from "next/navigation";

// Endereço antigo: a área agora se chama Gestão.
export default function Equipe() {
  redirect("/gestao/pessoas");
}
