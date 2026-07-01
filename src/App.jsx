import { useEffect, useRef, useState } from "react";
import {
  Battery,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  LifeBuoy,
  Loader2,
  MessageCircle,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Signal,
  ThumbsDown,
  ThumbsUp,
  Wifi,
  Zap,
} from "lucide-react";

const COLORS = {
  page: "#E9EEF6",
  phone: "#101828",
  bezel: "#1D2939",
  screen: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceSoft: "#EEF4FF",
  ink: "#172033",
  inkSoft: "#667085",
  inkFaint: "#98A2B3",
  line: "#D9E2F0",
  primary: "#2563EB",
  primaryDeep: "#1D4ED8",
  success: "#12805C",
  successSoft: "#E8F7F0",
  caution: "#B85F00",
  cautionSoft: "#FFF3DF",
};

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SANS = "Inter, 'Segoe UI', ui-sans-serif, system-ui, -apple-system, sans-serif";

const KB = [
  {
    id: "AUT-01",
    category: "Automações",
    title: "Como criar uma automação de aprovação de peça",
    content:
      "Para automatizar a aprovação de uma peça, acesse Automações dentro da campanha e clique em Nova automação. Escolha o gatilho 'peça enviada para revisão', defina uma condição, por exemplo o campo Aprovador estar preenchido, e escolha a ação: notificar o aprovador e mover o cartão para a etapa Em aprovação do workflow. Toda automação nova é criada em modo pausado, então é preciso ativá-la depois de revisar as regras.",
  },
  {
    id: "AUT-02",
    category: "Automações",
    title: "Limite de automações por plano",
    content:
      "O plano Starter permite até 5 automações ativas por campanha. O plano Pro permite até 30. O plano Enterprise não tem limite. Automações pausadas não contam para o limite do plano, apenas as automações ativas dentro do workflow de campanha são contabilizadas.",
  },
  {
    id: "AUT-03",
    category: "Automações",
    title: "Por que uma automação de workflow não dispara",
    content:
      "As causas mais comuns são: a automação está pausada, um campo condicional obrigatório do workflow está vazio, ou o gatilho escolhido não corresponde à etapa em que a peça está no momento. Revise o log de execução da automação, dentro da campanha, para ver o motivo exato de cada tentativa que falhou.",
  },
  {
    id: "AUT-04",
    category: "Automações",
    title: "Como testar uma automação antes de ativar",
    content:
      "Toda automação de workflow tem um modo de teste, acessível pelo botão Testar regra na tela de edição. O modo de teste simula a execução sobre uma peça ou tarefa escolhida por você, mostrando se a condição seria satisfeita e qual ação seria disparada, sem mover nada de verdade dentro da campanha.",
  },
  {
    id: "PERM-01",
    category: "Permissões",
    title: "Papéis de acesso disponíveis",
    content:
      "A SuportePro tem quatro papéis: Administrador, que gerencia cobrança, integrações e todas as campanhas; Editor, que cria e edita peças e tarefas nas campanhas em que foi adicionado; Aprovador, que só pode aprovar ou reprovar peças nas etapas de revisão do workflow, sem editar conteúdo; e Visualizador, que acessa relatórios e dashboards colaborativos sem poder editar nada.",
  },
  {
    id: "PERM-02",
    category: "Permissões",
    title: "Como adicionar um membro a uma campanha",
    content:
      "Acesse Configurações da campanha e clique em Adicionar pessoas. Digite o e-mail e escolha o papel já no convite, entre Administrador, Editor, Aprovador ou Visualizador. Uma pessoa pode ter papéis diferentes em campanhas diferentes, o papel não é fixo para a conta inteira.",
  },
  {
    id: "PERM-03",
    category: "Permissões",
    title: "Como restringir acesso a uma campanha específica",
    content:
      "É possível adicionar uma pessoa apenas a algumas campanhas da conta, em vez de dar acesso a todas. Na tela de membros da conta, use Gerenciar acesso por campanha e selecione exatamente quais campanhas aquela pessoa pode ver. Quem não é adicionado a uma campanha não aparece na lista de membros dela, nem recebe notificações de aprovação.",
  },
  {
    id: "PERM-04",
    category: "Permissões",
    title: "Diferença entre permissão de campanha e de conta",
    content:
      "Permissões de conta definem o que a pessoa pode fazer em toda a SuportePro, como faturamento e integrações. Permissões de campanha são mais granulares e valem só para uma campanha específica, por exemplo dar papel de Aprovador a um freelancer só na campanha em que ele está revisando peças, sem abrir o resto da conta para ele.",
  },
];

const STOPWORDS = new Set([
  "a",
  "o",
  "os",
  "as",
  "de",
  "da",
  "do",
  "das",
  "dos",
  "e",
  "em",
  "um",
  "uma",
  "para",
  "com",
  "no",
  "na",
  "nos",
  "nas",
  "que",
  "como",
  "meu",
  "minha",
  "seu",
  "sua",
  "ao",
  "por",
  "sem",
  "sobre",
  "ou",
  "se",
  "já",
  "não",
  "tem",
  "ter",
  "está",
  "isso",
  "qual",
  "quais",
  "onde",
  "quando",
  "porque",
  "pra",
  "pro",
  "posso",
  "consigo",
  "tenho",
]);

const SUGGESTIONS = [
  "Criar automação de aprovação",
  "Limite do plano Pro",
  "Adicionar Aprovador",
  "Automação não disparou",
  "Como me conecto com o Instagram?",
];

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return idCounter;
}

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function tokenize(str) {
  return normalize(str)
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

function stem(word) {
  return word.length >= 4 ? word.slice(0, 4) : word;
}

function retrieve(query) {
  const queryStems = new Set(tokenize(query).map(stem));

  return KB.map((article) => {
    const titleStems = new Set(tokenize(article.title).map(stem));
    const bodyStems = new Set(tokenize(article.content).map(stem));
    let score = 0;

    queryStems.forEach((term) => {
      if (titleStems.has(term)) score += 4;
      if (bodyStems.has(term)) score += 1;
      if (normalize(article.category).includes(term)) score += 1;
    });

    return { ...article, score };
  })
    .filter((article) => article.score > 0)
    .sort((a, b) => b.score - a.score);
}

function compactAnswer(question, sources) {
  const main = sources[0];
  const related = sources
    .slice(1, 3)
    .map((source) => source.title)
    .join("; ");

  return `Resposta direta: ${main.content} [${main.title}]${
    related ? `\n\nTambém encontrei contexto relacionado em: ${related}.` : ""
  }`;
}

async function askAssistant(question, sources) {
  await new Promise((resolve) => setTimeout(resolve, 420));
  return compactAnswer(question, sources);
}

function StatusBar() {
  return (
    <div className="flex h-8 shrink-0 items-center justify-between px-6 text-[11px] font-bold" style={{ color: COLORS.ink }}>
      <span>09:41</span>
      <div className="absolute left-1/2 top-3 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
      <div className="flex items-center gap-1.5">
        <Signal size={13} />
        <Wifi size={13} />
        <Battery size={15} />
      </div>
    </div>
  );
}

function ConfidenceMeter({ score }) {
  const level = score >= 8 ? "alta" : "moderada";
  const filled = score >= 8 ? 5 : 3;
  const color = level === "alta" ? COLORS.success : COLORS.caution;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((item) => (
          <span
            key={item}
            className="block h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: item < filled ? color : COLORS.line }}
          />
        ))}
      </div>
      <span className="text-[10px] font-bold uppercase" style={{ color, fontFamily: MONO }}>
        Confiança {level}
      </span>
    </div>
  );
}

function SourcesList({ sources }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 border-t pt-3" style={{ borderColor: COLORS.line }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 text-xs font-semibold"
        style={{ color: COLORS.inkSoft }}
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {sources.length} {sources.length === 1 ? "fonte" : "fontes"}
      </button>

      {open && (
        <div className="mt-2 grid gap-2">
          {sources.map((source) => (
            <div
              key={source.id}
              className="rounded-xl border p-3"
              style={{ backgroundColor: COLORS.screen, borderColor: COLORS.line }}
            >
              <div className="text-xs font-bold" style={{ color: COLORS.ink }}>
                {source.title}
              </div>
              <p className="mt-1 line-clamp-4 text-xs leading-relaxed" style={{ color: COLORS.inkSoft }}>
                {source.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FeedbackRow({ msg, onFeedback, onEscalate, onRefocus }) {
  if (msg.feedback === "down" && !msg.escalated) {
    return (
      <div className="mt-3 rounded-xl border p-3" style={{ backgroundColor: COLORS.cautionSoft, borderColor: "#F0CF9D" }}>
        <div className="text-xs font-bold" style={{ color: COLORS.ink }}>
          Quer seguir por outro caminho?
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onRefocus}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border bg-white px-2 text-xs font-bold"
            style={{ borderColor: COLORS.line, color: COLORS.ink }}
          >
            <RotateCcw size={13} />
            Reformular
          </button>
          <button
            type="button"
            onClick={onEscalate}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-bold text-white"
            style={{ backgroundColor: COLORS.caution }}
          >
            <LifeBuoy size={13} />
            Chamado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-xs" style={{ color: COLORS.inkFaint }}>
        Ajudou?
      </span>
      <button
        type="button"
        onClick={() => onFeedback("up")}
        disabled={Boolean(msg.feedback)}
        className="rounded-lg p-1.5"
        style={{ backgroundColor: msg.feedback === "up" ? COLORS.successSoft : "transparent" }}
        aria-label="Resposta ajudou"
      >
        <ThumbsUp size={14} color={msg.feedback === "up" ? COLORS.success : COLORS.inkFaint} />
      </button>
      <button
        type="button"
        onClick={() => onFeedback("down")}
        disabled={Boolean(msg.feedback)}
        className="rounded-lg p-1.5"
        style={{ backgroundColor: msg.feedback === "down" ? COLORS.cautionSoft : "transparent" }}
        aria-label="Resposta não ajudou"
      >
        <ThumbsDown size={14} color={msg.feedback === "down" ? COLORS.caution : COLORS.inkFaint} />
      </button>
    </div>
  );
}

function MessageBubble({ msg, handlers }) {
  if (msg.role === "user") {
    return (
      <div
        className="ml-auto max-w-[82%] rounded-3xl rounded-br-lg px-4 py-3 text-sm leading-relaxed text-white shadow-sm"
        style={{ backgroundColor: COLORS.primary }}
      >
        {msg.text}
      </div>
    );
  }

  if (msg.role === "fallback") {
    return (
      <div className="max-w-[90%] rounded-3xl border px-4 py-3" style={{ backgroundColor: COLORS.cautionSoft, borderColor: "#F0CF9D" }}>
        <div className="flex gap-2.5">
          <CircleAlert size={17} color={COLORS.caution} className="mt-0.5 shrink-0" />
          <p className="text-sm leading-relaxed" style={{ color: COLORS.ink }}>
            {msg.text}
          </p>
        </div>
        <button
          type="button"
          onClick={handlers.onFallbackEscalate}
          className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-white"
          style={{ backgroundColor: COLORS.caution }}
        >
          <LifeBuoy size={14} />
          Abrir chamado
        </button>
      </div>
    );
  }

  if (msg.role === "escalation") {
    return (
      <div className="mx-auto flex max-w-[92%] items-center gap-2 rounded-2xl px-4 py-3 text-xs" style={{ backgroundColor: COLORS.successSoft, color: COLORS.ink }}>
        <CheckCircle2 size={16} color={COLORS.success} className="shrink-0" />
        {msg.text}
      </div>
    );
  }

  return (
    <div className="max-w-[90%] rounded-3xl rounded-bl-lg border bg-white px-4 py-3 shadow-sm" style={{ borderColor: COLORS.line }}>
      {msg.loading ? (
        <div className="flex items-center gap-3 py-1.5">
          <Loader2 size={16} className="animate-spin" color={COLORS.primary} />
          <span className="text-sm" style={{ color: COLORS.inkSoft }}>
            Consultando a base...
          </span>
        </div>
      ) : msg.error ? (
        <div>
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color: COLORS.caution }}>
            <CircleAlert size={16} />
            Não consegui responder agora.
          </div>
          <button
            type="button"
            onClick={() => handlers.onRetry(msg)}
            className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold"
            style={{ borderColor: COLORS.line, color: COLORS.ink }}
          >
            <RotateCcw size={14} />
            Tentar de novo
          </button>
        </div>
      ) : (
        <>
          <ConfidenceMeter score={msg.score} />
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed" style={{ color: COLORS.ink }}>
            {msg.text}
          </p>
          <SourcesList sources={msg.sources} />
          <FeedbackRow
            msg={msg}
            onFeedback={(value) => handlers.onFeedback(msg.id, value)}
            onEscalate={() => handlers.onEscalate(msg)}
            onRefocus={() => handlers.onRefocus(msg.id)}
          />
        </>
      )}
    </div>
  );
}

export default function SupportAssistantMVP() {
  const [messages, setMessages] = useState([
    {
      id: nextId(),
      role: "assistant",
      text:
        "Olá! Eu respondo dúvidas sobre automações e permissões nas campanhas da SuportePro. Escolha um exemplo ou digite sua pergunta.",
      score: 9,
      sources: [KB[0], KB[4]],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function handleSend(text) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    setInput("");
    setMessages((current) => [...current, { id: nextId(), role: "user", text: question }]);

    const top = retrieve(question).slice(0, 3);
    const bestScore = top[0]?.score ?? 0;

    if (bestScore < 3) {
      setMessages((current) => [
        ...current,
        {
          id: nextId(),
          role: "fallback",
          text: "Não tenho uma resposta pra isso, quer abrir um chamado?",
        },
      ]);
      return;
    }

    const loadingId = nextId();
    setLoading(true);
    setMessages((current) => [
      ...current,
      { id: loadingId, role: "assistant", loading: true, question, sources: top, score: bestScore },
    ]);

    try {
      const answer = await askAssistant(question, top);
      setMessages((current) =>
        current.map((msg) =>
          msg.id === loadingId ? { ...msg, loading: false, text: answer, score: bestScore } : msg
        )
      );
    } catch {
      setMessages((current) =>
        current.map((msg) => (msg.id === loadingId ? { ...msg, loading: false, error: true } : msg))
      );
    } finally {
      setLoading(false);
    }
  }

  function handleRetry(msg) {
    setMessages((current) =>
      current.map((item) => (item.id === msg.id ? { ...item, error: false, loading: true } : item))
    );
    setLoading(true);

    askAssistant(msg.question, msg.sources)
      .then((answer) =>
        setMessages((current) =>
          current.map((item) => (item.id === msg.id ? { ...item, loading: false, text: answer } : item))
        )
      )
      .catch(() =>
        setMessages((current) =>
          current.map((item) => (item.id === msg.id ? { ...item, loading: false, error: true } : item))
        )
      )
      .finally(() => setLoading(false));
  }

  function handleFeedback(id, value) {
    setMessages((current) => current.map((item) => (item.id === id ? { ...item, feedback: value } : item)));
  }

  function handleEscalate(msg) {
    setMessages((current) =>
      current
        .map((item) => (item.id === msg.id ? { ...item, escalated: true } : item))
        .concat({
          id: nextId(),
          role: "escalation",
          text: `Chamado aberto com a pergunta original${msg.sources?.length ? " e as fontes consultadas" : ""}.`,
        })
    );
  }

  function handleFallbackEscalate() {
    setMessages((current) =>
      current.concat({
        id: nextId(),
        role: "escalation",
        text: "Chamado aberto com a pergunta original anexada.",
      })
    );
  }

  function handleRefocus(id) {
    handleFeedback(id, null);
    inputRef.current?.focus();
  }

  const handlers = {
    onRetry: handleRetry,
    onFeedback: handleFeedback,
    onEscalate: handleEscalate,
    onFallbackEscalate: handleFallbackEscalate,
    onRefocus: handleRefocus,
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center overflow-hidden p-3 sm:p-6"
      style={{ backgroundColor: COLORS.page, color: COLORS.ink, fontFamily: SANS }}
    >
      <div className="hidden max-w-xs pr-10 text-right lg:block">
        <div className="text-[11px] font-bold uppercase" style={{ color: COLORS.primary, fontFamily: MONO }}>
          SuportePro MVP
        </div>
        <h1 className="mt-3 text-3xl font-black leading-tight" style={{ color: COLORS.ink }}>
          Assistente de suporte em formato mobile.
        </h1>
      </div>

      <section
        className="relative rounded-[48px] p-2.5 shadow-2xl"
        style={{
          width: "min(430px, calc(100vw - 24px))",
          height: "min(860px, calc(100svh - 24px))",
          backgroundColor: COLORS.phone,
          boxShadow: "0 30px 80px rgba(16, 24, 40, 0.35)",
        }}
        aria-label="Mockup de celular com o MVP do assistente"
      >
        <div className="absolute left-[-3px] top-28 h-16 w-1 rounded-full" style={{ backgroundColor: COLORS.bezel }} />
        <div className="absolute right-[-3px] top-36 h-24 w-1 rounded-full" style={{ backgroundColor: COLORS.bezel }} />

        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[38px]" style={{ backgroundColor: COLORS.screen }}>
          <StatusBar />

          <header className="shrink-0 border-b px-4 pb-4 pt-2" style={{ borderColor: COLORS.line }}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  <MessageCircle size={22} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-base font-black">Assistente SuportePro</div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs" style={{ color: COLORS.inkSoft }}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS.success }} />
                    Base do MVP ativa
                  </div>
                </div>
              </div>
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: COLORS.surfaceSoft, color: COLORS.primary }}
              >
                <ShieldCheck size={18} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-[11px] font-bold" style={{ color: COLORS.inkSoft }}>
                  <Zap size={13} color={COLORS.primary} />
                  Escopo
                </div>
                <div className="mt-1 text-sm font-black">2 temas</div>
              </div>
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="text-[11px] font-bold" style={{ color: COLORS.inkSoft }}>
                  Documentos
                </div>
                <div className="mt-1 text-sm font-black">{KB.length} artigos</div>
              </div>
            </div>
          </header>

          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <div className="grid gap-3">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} handlers={handlers} />
              ))}
            </div>
          </div>

          <footer className="shrink-0 border-t bg-white px-4 pb-5 pt-3" style={{ borderColor: COLORS.line }}>
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  disabled={loading}
                  className="h-9 rounded-full border px-3 text-xs font-bold"
                  style={{
                    borderColor: COLORS.line,
                    backgroundColor: COLORS.surfaceSoft,
                    color: COLORS.primaryDeep,
                    opacity: loading ? 0.58 : 1,
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <label className="relative min-w-0 flex-1">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                  color={COLORS.inkFaint}
                />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Digite sua dúvida..."
                  className="h-12 w-full rounded-full border py-3 pl-10 pr-4 text-sm outline-none transition focus:ring-4"
                  style={{
                    borderColor: COLORS.line,
                    color: COLORS.ink,
                    backgroundColor: COLORS.screen,
                    "--tw-ring-color": "rgba(37, 99, 235, 0.14)",
                  }}
                />
              </label>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition"
                style={{
                  backgroundColor: loading || !input.trim() ? COLORS.inkFaint : COLORS.primary,
                  opacity: loading || !input.trim() ? 0.7 : 1,
                }}
                aria-label="Enviar pergunta"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={17} />}
              </button>
            </form>
          </footer>
        </div>
      </section>
    </main>
  );
}
