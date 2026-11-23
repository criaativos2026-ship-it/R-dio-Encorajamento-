import type { ReactNode } from "react";
import { AVISO_DATA, AVISO_VERSAO, CONTATO_PRIVACIDADE, CONTROLADOR, CONTROLADOR_LOCAL, RETENCAO_TEXTO } from "@/lib/privacidade";

function Secao({ n, titulo, children }: { n: string; titulo: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <h2 className="flex items-baseline gap-3 text-lg font-black tracking-display">
        <span className="font-mono text-xs font-normal text-ink-35">{n}</span>
        {titulo}
      </h2>
      <div className="mt-3 grid gap-3 text-[15px] leading-relaxed text-ink/85 [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">{children}</div>
    </section>
  );
}

/** Aviso de privacidade do app (LGPD). Os dados variáveis vêm de src/lib/privacidade.ts. */
export function AvisoPrivacidade() {
  const contato = CONTATO_PRIVACIDADE.email ? (
    <>
      <strong>{CONTATO_PRIVACIDADE.responsavel ?? "Responsável pela privacidade"}</strong> —{" "}
      <a className="font-semibold text-brand-text underline-offset-4 hover:underline" href={`mailto:${CONTATO_PRIVACIDADE.email}`}>
        {CONTATO_PRIVACIDADE.email}
      </a>
    </>
  ) : (
    <>
      <strong>Canal de contato em definição pela igreja.</strong> Enquanto isso, fale com a gestão da equipe (Pastor(a), Líder ou Coordenação).
    </>
  );

  return (
    <div>
      <Secao n="01" titulo="Quem cuida dos seus dados">
        <p>
          O <strong>Controle Interação — Rádio Encorajamento</strong> é a ferramenta da equipe de serviço da <strong>{CONTROLADOR}</strong> ({CONTROLADOR_LOCAL}), que é a responsável
          (controladora) pelos dados tratados aqui.
        </p>
        <p>Contato para assuntos de privacidade: {contato}</p>
      </Secao>

      <Secao n="02" titulo="Quais dados o app guarda">
        <ul>
          <li><strong>Cadastro:</strong> nome, e-mail, função principal e perfil de acesso (Pastor(a), Líder, Coordenação ou Voluntário(a)).</li>
          <li><strong>Senha:</strong> guardada apenas de forma criptografada. Ninguém, nem a gestão, consegue vê-la.</li>
          <li><strong>Registros do serviço:</strong> em quais cultos você esteve na escala e com qual função, quais itens dos checklists você marcou e a que horas, problemas que registrou ou resolveu e comunicados que publicou.</li>
          <li><strong>Histórico de uso:</strong> as ações acima, com data e horário, e o momento em que você aceitou este aviso.</li>
        </ul>
        <p>O app <strong>não</strong> pede CPF, telefone, endereço, foto ou data de nascimento, e <strong>não</strong> usa a localização do seu celular.</p>
      </Secao>

      <Secao n="03" titulo="Para que usamos">
        <ul>
          <li>Organizar a montagem e a desmontagem da rádio em cada culto.</li>
          <li>Registrar quem fez cada etapa, para dar transparência e responsabilidade ao serviço.</li>
          <li>Comunicar a equipe e resolver problemas técnicos.</li>
          <li>Proteger o acesso ao app.</li>
        </ul>
        <p>Os dados <strong>não</strong> são vendidos, não são usados para propaganda e não são compartilhados com outras organizações.</p>
      </Secao>

      <Secao n="04" titulo="Por que pedimos o seu consentimento">
        <p>
          Participar da equipe de uma igreja pode revelar a sua <strong>convicção religiosa</strong>, que a LGPD considera um dado sensível. Por isso o uso do app depende do seu{" "}
          <strong>consentimento</strong> (LGPD, art. 7º, I, e art. 11, I), que você pode retirar quando quiser (veja o item 08).
        </p>
      </Secao>

      <Secao n="05" titulo="Quem pode ver">
        <ul>
          <li><strong>Toda a equipe:</strong> nomes e funções na escala, quem marcou cada item, o histórico de atividades, os problemas e os comunicados.</li>
          <li><strong>Só a gestão</strong> (Pastor(a), Líder e Coordenação): os e-mails, a lista de pessoas e os relatórios de cada culto.</li>
        </ul>
      </Secao>

      <Secao n="06" titulo="Onde os dados ficam">
        <p>
          O app e o banco de dados ficam na <strong>Netlify</strong>, empresa de hospedagem com servidores nos <strong>Estados Unidos</strong>. Isso é uma transferência internacional de dados
          (LGPD, art. 33), feita com um fornecedor que adota medidas de segurança e compromissos contratuais de proteção de dados.
        </p>
      </Secao>

      <Secao n="07" titulo="Por quanto tempo">
        <ul>
          <li>Os registros dos cultos, o histórico e os problemas resolvidos são <strong>apagados automaticamente depois de {RETENCAO_TEXTO}</strong>.</li>
          <li>O seu cadastro fica enquanto você fizer parte da equipe. Se você sair, a gestão pode desativar o acesso ou excluir os seus dados.</li>
        </ul>
      </Secao>

      <Secao n="08" titulo="Seus direitos e como usar">
        <p>Pela LGPD (art. 18), você pode, a qualquer momento:</p>
        <ul>
          <li><strong>Ver e baixar</strong> uma cópia dos seus dados: no app, em <strong>Meu perfil → Meus dados e privacidade → Baixar meus dados</strong>.</li>
          <li><strong>Corrigir</strong> nome, função e e-mail: em <strong>Meu perfil</strong>.</li>
          <li><strong>Pedir a exclusão</strong> dos seus dados e retirar o consentimento: em <strong>Meu perfil → Pedir exclusão</strong>. A gestão executa o pedido: o seu nome e e-mail são apagados e, nos registros antigos, você passa a aparecer como “Pessoa removida”.</li>
          <li>Pedir informações sobre o uso dos seus dados e, se necessário, reclamar à <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>.</li>
        </ul>
      </Secao>

      <Secao n="09" titulo="Segurança e cookies">
        <ul>
          <li>Conexão protegida (HTTPS), senhas criptografadas, bloqueio após tentativas erradas de login e acesso por perfil.</li>
          <li>O app usa <strong>um único cookie</strong>, necessário para manter você conectado. Não há cookies de propaganda nem de rastreamento.</li>
          <li>Em caso de incidente de segurança que possa causar risco, a igreja comunicará as pessoas afetadas e a ANPD.</li>
        </ul>
      </Secao>

      <Secao n="10" titulo="Mudanças neste aviso">
        <p>Se este aviso mudar de forma relevante, o app pedirá que você leia e aceite a nova versão no próximo acesso.</p>
        <p className="font-mono text-xs text-ink-50">
          Versão {AVISO_VERSAO} · {AVISO_DATA}
        </p>
      </Secao>
    </div>
  );
}
