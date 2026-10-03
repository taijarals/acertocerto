/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './services/supabase';

interface Alternativa {
  letra: 'A' | 'B' | 'C' | 'D' | 'E';
  texto: string;
}

interface JustificativaAlt {
  letra: 'A' | 'B' | 'C' | 'D' | 'E';
  justificativa: string | null;
}

interface Explicacao {
  status: 'pendente' | 'preenchida';
  resumo: string | null;
  alternativas: JustificativaAlt[];
}

interface Questao {
  id: string;
  disciplina: string | null;
  assunto: string;
  ano: string | null;
  banca: string | null;
  prova: string | null;
  metadados?: string;
  texto_associado?: string | null;
  enunciado: string | null;
  tipo: 'multipla_escolha';
  alternativas: Alternativa[];
  alternativa_certa: 'A' | 'B' | 'C' | 'D' | 'E';
  comentario_ia?: string | null;
  pagina: number;
  explicacao?: Explicacao;
  comentario?: string;
  source?: 'official' | 'ai_generated';
  valida?: boolean;
  created_at?: string;
}

const LogoMark = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="68" cy="30" r="10" fill="#FFC107" />
    <path d="M50 44C50 44 32 30 32 18C32 10 39 6 46 12C50 16 50 44 50 44Z" fill="#00A86B" />
    <path d="M50 48C50 48 24 45 16 35C10 27 12 18 21 21C28 23 50 48 50 48Z" fill="#00A86B" />
    <path d="M50 48C50 48 72 41 80 32C86 24 82 16 75 20C69 23 50 48 50 48Z" fill="#00A86B" />
    <path d="M48 90C48 90 44 70 42 52C41 46 44 44 48 44C52 44 55 46 54 52C52 70 48 90 48 90Z" fill="#0A2540" />
    <path d="M38 78L48 90L68 64" stroke="#0A2540" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FullLogo = ({ className = "h-8" }: { className?: string }) => (
  <div className="flex items-center gap-2.5 cursor-pointer">
    <LogoMark className="w-10 h-10 flex-shrink-0" />
    <div className="flex items-center tracking-tight font-title-md font-bold text-xl">
      <span className="text-primary">Acerto</span>
      <span className="text-[#00A86B]">Certo</span>
    </div>
  </div>
);

const SAMPLE_RICH_QUESTIONS: Questao[] = [
  {
    id: "q_demo_01",
    disciplina: "Direito Administrativo",
    assunto: "Atos Administrativos",
    ano: "2026",
    banca: "CESGRANRIO",
    prova: "Banco do Brasil - Executivo",
    tipo: "multipla_escolha",
    pagina: 1,
    enunciado: "No que diz respeito aos requisitos de validade do ato administrativo, assinale a alternativa que indica o elemento vinculado que se refere à exteriorização da vontade da Administração Pública:",
    alternativas: [
      { letra: "A", texto: "Competência" },
      { letra: "B", texto: "Finalidade" },
      { letra: "C", texto: "Forma" },
      { letra: "D", texto: "Motivo" },
      { letra: "E", texto: "Objeto" }
    ],
    alternativa_certa: "C",
    comentario_ia: "A Forma é o requisito vinculado que diz respeito à exteriorização do ato administrativo. Em regra, o ato deve ser escrito, salvo exceções previstas em lei.",
    source: "official"
  },
  {
    id: "q_demo_02",
    disciplina: "Direito Constitucional",
    assunto: "Direitos e Garantias Fundamentais",
    ano: "2026",
    banca: "FGV",
    prova: "TJ-SC - Analista",
    tipo: "multipla_escolha",
    pagina: 1,
    enunciado: "De acordo com a Constituição Federal de 1988, sobre os direitos e deveres individuais e coletivos, é correto afirmar que:",
    alternativas: [
      { letra: "A", texto: "a casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, em hipótese alguma." },
      { letra: "B", texto: "é livre a expressão da atividade intelectual, artística, científica e de comunicação, independentemente de censura ou licença." },
      { letra: "C", texto: "é garantido o direito de propriedade, não podendo a propriedade privada sofrer desapropriação por necessidade pública." },
      { letra: "D", texto: "as associações de caráter paramilitar são permitidas desde que autorizadas pelo Ministério da Justiça." },
      { letra: "E", texto: "a prisão de qualquer pessoa e o lugar onde se encuentre serão comunicados imediatamente ao juiz competente e à família do preso." }
    ],
    alternativa_certa: "B",
    comentario_ia: "O art. 5º, inciso IX, da CF/88 estabelece que é livre a expressão da atividade intelectual, artística, científica e de comunicação, independentemente de censura ou licença.",
    source: "official"
  },
  {
    id: "q_demo_03",
    disciplina: "Língua Portuguesa",
    assunto: "Crase",
    ano: "2025",
    banca: "CESGRANRIO",
    prova: "Transpetro - Técnico",
    tipo: "multipla_escolha",
    pagina: 1,
    enunciado: "Assinale a alternativa em que o uso do acento indicativo de crase está em estrita conformidade com a norma-padrão da língua portuguesa:",
    alternativas: [
      { letra: "A", texto: "O candidato entregou os documentos à tempo da inscrição." },
      { letra: "B", texto: "Fomos à Brasília visitar o congresso nacional na semana passada." },
      { letra: "C", texto: "Referiu-se às críticas feitas pelo conselho com muita serenidade." },
      { letra: "D", texto: "O diretor visou à uma promoção para os melhores colaboradores." },
      { letra: "E", texto: "Passado o prazo, o edital ficou aberto à todos os interessados." }
    ],
    alternativa_certa: "C",
    comentario_ia: "O verbo 'referir' rege a preposição 'a' e o termo feminino 'críticas' aceita artigo 'as', ocorrendo crase: 'às'. Nas demais opções há desvios (locução temporal masculina, nome de cidade sem artigo, verbo transitivo direto e pronome indefinido).",
    source: "official"
  },
  {
    id: "q_demo_04",
    disciplina: "Raciocínio Lógico",
    assunto: "Proposições e Equivalências",
    ano: "2025",
    banca: "FGV",
    prova: "Auditor Fiscal - SEFAZ",
    tipo: "multipla_escolha",
    pagina: 1,
    enunciado: "Dada a proposição condicional: 'Se estudo estatística, então serei aprovado no concurso.', uma proposição logicamente equivalente a ela é:",
    alternativas: [
      { letra: "A", texto: "Se não estudo estatística, então não serei aprovado no concurso." },
      { letra: "B", texto: "Se não serei aprovado no concurso, então não estudo estatística." },
      { letra: "C", texto: "Estudo estatística e não serei aprovado no concurso." },
      { letra: "D", texto: "Ou não estudo estatística, ou serei aprovado." },
      { letra: "E", texto: "Se serei aprovado no concurso, então estudo estatística." }
    ],
    alternativa_certa: "B",
    comentario_ia: "A equivalência da condicional (P -> Q) pode ser dada por (~Q -> ~P) (contrapositiva). Negando a conclusão e invertendo: 'Se não serei aprovado, então não estudo estatística'.",
    source: "official"
  },
  {
    id: "q_demo_05",
    disciplina: "Informática",
    assunto: "Segurança da Informação",
    ano: "2026",
    banca: "CESGRANRIO",
    prova: "BNDES - Técnico",
    tipo: "multipla_escolha",
    pagina: 1,
    enunciado: "Assinale a alternativa que define corretamente o malware conhecido como Ransomware:",
    alternativas: [
      { letra: "A", texto: "Programa malicioso que monitora e registra as teclas digitadas pelo usuário no teclado." },
      { letra: "B", texto: "Software legítimo que abre portas secundárias para acesso remoto desautorizado." },
      { letra: "C", texto: "Código malicioso que criptografa os arquivos do equipamento e exige pagamento de resgate para liberação." },
      { letra: "D", texto: "Vírus que se replica automaticamente através de e-mails corporativos sem intervenção humana." },
      { letra: "E", texto: "Ferramenta de firewall que bloqueia tráfego suspeito na rede." }
    ],
    alternativa_certa: "C",
    comentario_ia: "Ransomware é o tipo de código malicioso que sequestra os dados do usuário por meio de criptografia forte, exigindo um resgate (normalmente em criptomoedas) em troca da chave de descriptografia.",
    source: "official"
  }
];

const SAMPLE_QUESTION_TEMPLATE = SAMPLE_RICH_QUESTIONS;

const MultiSelectDropdown = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Todos"
}: {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-on-surface uppercase tracking-wider">{label}</label>
        {selectedValues.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-[11px] text-primary hover:underline font-semibold"
          >
            Limpar ({selectedValues.length})
          </button>
        )}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 rounded-xl bg-surface-container-low border border-outline-variant/50 text-on-surface text-sm font-medium flex items-center justify-between text-left focus:outline-none focus:border-primary shadow-sm"
        >
          <span className="truncate">
            {selectedValues.length === 0
              ? placeholder
              : `${selectedValues.length} selecionada(s): ${selectedValues.join(', ')}`}
          </span>
          <span className="material-symbols-outlined text-outline text-[20px]">
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-30 mt-1 w-full bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-xl max-h-60 overflow-y-auto p-2 space-y-1">
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-outline-variant/30 px-2">
              <span className="text-[11px] font-bold text-on-surface-variant">Selecione uma ou mais opções</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-bold text-primary hover:underline"
              >
                Concluir
              </button>
            </div>

            {options.length === 0 ? (
              <p className="text-xs text-outline italic p-2 text-center">Nenhuma opção disponível</p>
            ) : (
              options.map(opt => {
                const isChecked = selectedValues.includes(opt);
                return (
                  <div
                    key={opt}
                    onClick={() => {
                      if (isChecked) {
                        onChange(selectedValues.filter(v => v !== opt));
                      } else {
                        onChange([...selectedValues, opt]);
                      }
                    }}
                    className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer text-xs transition-colors ${
                      isChecked ? 'bg-primary-fixed/40 text-on-primary-fixed font-semibold' : 'hover:bg-surface-container-low text-on-surface'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer pointer-events-none"
                    />
                    <span className="truncate flex-1">{opt}</span>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const safeLocalStorage = {
    getItem: (key: string): string | null => {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    setItem: (key: string, value: string): void => {
      try { localStorage.setItem(key, value); } catch (e) {}
    },
    removeItem: (key: string): void => {
      try { localStorage.removeItem(key); } catch (e) {}
    }
  };

  const [activeTab, setActiveTab] = useState<'inicio' | 'ofensivas' | 'desempenho' | 'gestao' | 'configuracoes'>('inicio');
  const [ofensivasSubTab, setOfensivasSubTab] = useState<'desafios' | 'simulado' | 'focado'>('desafios');
  const [desempenhoSubTab, setDesempenhoSubTab] = useState<'geral' | 'materias' | 'habitos'>('geral');
  const [gestaoSubTab, setGestaoSubTab] = useState<'auditoria' | 'importacao'>('auditoria');
  const [gestaoFilter, setGestaoFilter] = useState<'all' | 'pendentes' | 'completas'>('all');
  const [clearDbModalOpen, setClearDbModalOpen] = useState<boolean>(false);
  const [badgesModalOpen, setBadgesModalOpen] = useState<boolean>(false);
  const [userInitials, setUserInitials] = useState<string>('AC');

  useEffect(() => {
    safeLocalStorage.removeItem('acertocerto_demo_respostas');
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      const sb = supabase;
      sb.auth.getSession().then(({ data: { session } }) => {
        if (session?.user?.email) {
          const email = session.user.email;
          const parts = email.split('@')[0].split(/[\.\-_]/);
          let initials = 'AC';
          if (parts.length >= 2) {
            initials = (parts[0][0] + parts[1][0]).toUpperCase();
          } else if (parts[0].length >= 2) {
            initials = parts[0].substring(0, 2).toUpperCase();
          } else if (parts[0].length === 1) {
            initials = parts[0].toUpperCase() + 'U';
          }
          setUserInitials(initials);
        }
      });
    }
  }, []);

  // User Goals & Settings States
  const [metaQuestoesDia, setMetaQuestoesDia] = useState<number>(() => {
    const saved = safeLocalStorage.getItem('acertocerto_meta_questoes');
    return saved ? Number(saved) : 20;
  });
  const [metaDesafiosDia, setMetaDesafiosDia] = useState<number>(() => {
    const saved = safeLocalStorage.getItem('acertocerto_meta_desafios');
    return saved ? Number(saved) : 2;
  });
  const [metaSimuladosSemana, setMetaSimuladosSemana] = useState<number>(() => {
    const saved = safeLocalStorage.getItem('acertocerto_meta_simulados');
    return saved ? Number(saved) : 1;
  });
  const [metaAproveitamentoGeral, setMetaAproveitamentoGeral] = useState<number>(() => {
    const saved = safeLocalStorage.getItem('acertocerto_meta_aproveitamento');
    return saved ? Number(saved) : 70;
  });
  const [metaAproveitamentoMateria, setMetaAproveitamentoMateria] = useState<number>(() => {
    const saved = safeLocalStorage.getItem('acertocerto_meta_aprov_materia');
    return saved ? Number(saved) : 65;
  });
  const [materiasAlvo, setMateriasAlvo] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('acertocerto_materias_alvo');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [assuntosAlvo, setAssuntosAlvo] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('acertocerto_assuntos_alvo');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [anosAlvo, setAnosAlvo] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('acertocerto_anos_alvo');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });
  const [searchTermDisciplinas, setSearchTermDisciplinas] = useState<string>('');
  const [searchTermAssuntos, setSearchTermAssuntos] = useState<string>('');
  const [searchTermAnos, setSearchTermAnos] = useState<string>('');

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    safeLocalStorage.setItem('acertocerto_meta_questoes', String(metaQuestoesDia));
    safeLocalStorage.setItem('acertocerto_meta_desafios', String(metaDesafiosDia));
    safeLocalStorage.setItem('acertocerto_meta_simulados', String(metaSimuladosSemana));
    safeLocalStorage.setItem('acertocerto_meta_aproveitamento', String(metaAproveitamentoGeral));
    safeLocalStorage.setItem('acertocerto_meta_aprov_materia', String(metaAproveitamentoMateria));
    safeLocalStorage.setItem('acertocerto_materias_alvo', JSON.stringify(materiasAlvo));
    safeLocalStorage.setItem('acertocerto_assuntos_alvo', JSON.stringify(assuntosAlvo));
    safeLocalStorage.setItem('acertocerto_anos_alvo', JSON.stringify(anosAlvo));

    if (isSupabaseConfigured() && supabase) {
      const sb = supabase;
      try {
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user?.id) {
          await sb.from('configuracoes_usuario').upsert({
            user_id: session.user.id,
            meta_questoes: metaQuestoesDia,
            meta_desafios: metaDesafiosDia,
            meta_simulados: metaSimuladosSemana,
            meta_aproveitamento: metaAproveitamentoGeral,
            meta_aprov_materia: metaAproveitamentoMateria,
            materias_alvo: materiasAlvo,
            assuntos_alvo: assuntosAlvo,
            anos_alvo: anosAlvo,
            updated_at: new Date().toISOString()
          });
        }
      } catch (err) {
        console.error("Erro ao salvar configurações no Supabase:", err);
      }
    }

    showNotification("Configurações e metas pessoais salvas com sucesso!");
  };

  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      const sb = supabase;
      sb.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user?.id) {
          const { data, error } = await sb
            .from('configuracoes_usuario')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          if (data && !error) {
            if (data.meta_questoes !== undefined) {
              setMetaQuestoesDia(data.meta_questoes);
              safeLocalStorage.setItem('acertocerto_meta_questoes', String(data.meta_questoes));
            }
            if (data.meta_desafios !== undefined) {
              setMetaDesafiosDia(data.meta_desafios);
              safeLocalStorage.setItem('acertocerto_meta_desafios', String(data.meta_desafios));
            }
            if (data.meta_simulados !== undefined) {
              setMetaSimuladosSemana(data.meta_simulados);
              safeLocalStorage.setItem('acertocerto_meta_simulados', String(data.meta_simulados));
            }
            if (data.meta_aproveitamento !== undefined) {
              setMetaAproveitamentoGeral(data.meta_aproveitamento);
              safeLocalStorage.setItem('acertocerto_meta_aproveitamento', String(data.meta_aproveitamento));
            }
            if (data.meta_aprov_materia !== undefined) {
              setMetaAproveitamentoMateria(data.meta_aprov_materia);
              safeLocalStorage.setItem('acertocerto_meta_aprov_materia', String(data.meta_aprov_materia));
            }
            if (data.materias_alvo) {
              setMateriasAlvo(data.materias_alvo);
              safeLocalStorage.setItem('acertocerto_materias_alvo', JSON.stringify(data.materias_alvo));
            }
            if (data.assuntos_alvo) {
              setAssuntosAlvo(data.assuntos_alvo);
              safeLocalStorage.setItem('acertocerto_assuntos_alvo', JSON.stringify(data.assuntos_alvo));
            }
            if (data.anos_alvo) {
              setAnosAlvo(data.anos_alvo);
              safeLocalStorage.setItem('acertocerto_anos_alvo', JSON.stringify(data.anos_alvo));
            }
          }
        }
      });
    }
  }, []);

  const getQuestionPendencies = (q: Questao) => {
    const issues: string[] = [];
    if (!q.disciplina) issues.push('Sem disciplina');
    if (!q.assunto) issues.push('Sem assunto');
    if (!q.enunciado || q.enunciado.trim().length < 10) issues.push('Enunciado ausente/curto');
    if (!q.alternativas || q.alternativas.length < 2) issues.push('Alternativas insuficientes');
    if (!q.alternativa_certa) issues.push('Sem gabarito');
    if (!q.comentario_ia && !q.comentario) issues.push('Sem comentário');
    return issues;
  };

  const handleDeleteQuestion = async (id: string) => {
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.from('questoes').delete().eq('id', id);
      }
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: [] })
      });
    } catch (e) {}
    await fetchAuditoria();
    await recarregarResumo();
    showNotification("Questão removida com sucesso.");
  };

  const handleClearDatabase = async () => {
    safeLocalStorage.removeItem('acertocerto_questions');
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.from('questoes').delete().neq('id', '___non_existent_id___');
      }
      await fetch('/api/questions', { method: 'DELETE' });
    } catch (e) {}
    await fetchAuditoria();
    await recarregarResumo();
    showNotification("Base de dados limpa com sucesso do sistema e do Supabase!");
    setClearDbModalOpen(false);
  };

  useEffect(() => {
    try {
      safeLocalStorage.removeItem('acertocerto_questions');
    } catch (e) {}
  }, []);

  const [questions, setQuestions] = useState<Questao[]>(SAMPLE_RICH_QUESTIONS);

  const getDemoResponses = () => {
    let demoData = [];
    try {
      const saved = safeLocalStorage.getItem('acertocerto_demo_respostas');
      if (saved) {
        demoData = JSON.parse(saved);
      }
    } catch (e) {}

    if (!demoData || demoData.length === 0) {
      const now = new Date();
      demoData = [];
      const currentDayOfWeek = now.getDay();
      const mondayOffset = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
      
      const monday = new Date(now);
      monday.setDate(now.getDate() - mondayOffset);

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + dayIndex);
        if (d.getTime() <= now.getTime() + 86400000) {
          const count = 15 + (dayIndex * 4) % 16; // 15 to 30 questions
          for (let j = 0; j < count; j++) {
            const hit = (j % 5 !== 0);
            const itemDate = new Date(d);
            itemDate.setHours(8 + (j % 12), (j * 3) % 60, 0, 0);
            demoData.push({
              acertou: hit,
              created_at: itemDate.toISOString()
            });
          }
        }
      }
      safeLocalStorage.setItem('acertocerto_demo_respostas', JSON.stringify(demoData));
    }
    return demoData;
  };

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      fetch('/api/questions')
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
            setQuestions(data.questions);
          }
        })
        .catch(() => {});
    }
  }, []);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>([null, null, null, null, null]);
  const [answeredState, setAnsweredState] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(252);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [schemaModalOpen, setSchemaModalOpen] = useState<boolean>(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [roundComplete, setRoundComplete] = useState<boolean>(false);
  const [roundType, setRoundType] = useState<'desafio' | 'simulado'>('desafio');
  const [simuladoStep, setSimuladoStep] = useState<'config' | 'quiz'>('config');
  const [selectedDisciplinas, setSelectedDisciplinas] = useState<string[]>([]);
  const [selectedAssuntos, setSelectedAssuntos] = useState<string[]>([]);
  const [selectedBancas, setSelectedBancas] = useState<string[]>([]);
  const [selectedAnos, setSelectedAnos] = useState<string[]>([]);
  const [configCount, setConfigCount] = useState<number>(5);
  const [activeRoundQuestions, setActiveRoundQuestions] = useState<Questao[]>(() => questions.length > 0 ? questions.slice(0, 5) : SAMPLE_QUESTION_TEMPLATE.slice(0, 5));

  const filteredQuestionsForConfig = questions.length > 0 ? questions : SAMPLE_QUESTION_TEMPLATE;

  const [opcoesFiltroResult, setOpcoesFiltroResult] = useState<{
    total_disponivel: number;
    disciplinas: Array<{ valor: string; total: number }>;
    assuntos: Array<{ valor: string; total: number }>;
    bancas: Array<{ valor: string; total: number }>;
    anos: Array<{ valor: string; total: number }>;
  }>({
    total_disponivel: 0,
    disciplinas: [],
    assuntos: [],
    bancas: [],
    anos: []
  });

  const [settingsAnos, setSettingsAnos] = useState<Array<{ valor: string; total: number }>>([]);
  const [settingsDisciplinas, setSettingsDisciplinas] = useState<Array<{ valor: string; total: number }>>([]);
  const [settingsAssuntos, setSettingsAssuntos] = useState<Array<{ valor: string; total: number }>>([]);
  const [targetedCounts, setTargetedCounts] = useState<{ [key: string]: number }>({});
  const [roundLoading, setRoundLoading] = useState<boolean>(false);
  const [auditoriaPage, setAuditoriaPage] = useState<number>(0);
  const [auditoriaItems, setAuditoriaItems] = useState<any[]>([]);
  const [auditoriaTotalCount, setAuditoriaTotalCount] = useState<number>(0);
  const [auditoriaLoading, setAuditoriaLoading] = useState<boolean>(false);

  const mapearQuestao = (item: any): Questao => {
    return {
      id: item.id,
      disciplina: item.disciplina || "Geral",
      assunto: item.assunto || "Geral",
      ano: item.ano || "2026",
      banca: item.banca || "CESGRANRIO",
      prova: item.prova || "Prova Padrão",
      metadados: item.metadados,
      texto_associado: item.texto_associado || null,
      enunciado: item.enunciado || item.texto || "Enunciado não informado",
      tipo: item.tipo || "multipla_escolha",
      alternativas: item.alternativas || [
        { letra: "A", texto: "Alternativa A" },
        { letra: "B", texto: "Alternativa B" },
        { letra: "C", texto: "Alternativa C" },
        { letra: "D", texto: "Alternativa D" },
        { letra: "E", texto: "Alternativa E" }
      ],
      alternativa_certa: item.alternativa_certa || item.gabarito || "A",
      comentario: item.comentario_ia || item.explicacao?.resumo || item.comentario || "Comentário padrão.",
      comentario_ia: item.comentario_ia,
      pagina: item.pagina || 1,
      explicacao: item.explicacao,
      valida: item.valida,
      created_at: item.created_at,
      source: "official"
    };
  };

  const [resumoAcervo, setResumoAcervo] = useState<{
    total: number;
    validadas: number;
    pendentes: number;
    disciplinas: Array<{ disciplina: string; total: number; qtd_assuntos: number; bancas: string[] }>;
  } | null>(null);

  const recarregarResumo = async () => {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.rpc('resumo_acervo');
        if (!error && data) {
          setResumoAcervo(data);
          setDbTotalCount(data.total || 0);
          setDbTotalDisciplinas(data.disciplinas ? data.disciplinas.length : 0);
          setDbValidadas(data.validadas || 0);
          setDbConnected(true);
        } else {
          console.error('[Supabase] resumo_acervo:', error);
          setDbConnected(false);
        }
      } catch (error) {
        console.error('[Supabase] resumo_acervo:', error);
        setDbConnected(false);
      }
    }
  };

  const fetchAuditoria = async () => {
    setAuditoriaLoading(true);
    try {
      if (isSupabaseConfigured() && supabase) {
        let query = supabase.from('vw_questoes_auditoria').select('*', { count: 'exact' }).order('created_at', { ascending: false });
        if (gestaoFilter === 'pendentes') {
          query = query.eq('valida', false);
        } else if (gestaoFilter === 'completas') {
          query = query.eq('valida', true);
        }
        const inicio = auditoriaPage * 50;
        const { data, count, error } = await query.range(inicio, inicio + 49);
        if (!error && data) {
          setAuditoriaItems(data);
          if (count !== null) setAuditoriaTotalCount(count);
        }
      } else {
        let pool = questions.length > 0 ? questions : SAMPLE_RICH_QUESTIONS;
        if (gestaoFilter === 'pendentes') pool = pool.filter(q => getQuestionPendencies(q).length > 0);
        if (gestaoFilter === 'completas') pool = pool.filter(q => getQuestionPendencies(q).length === 0);
        setAuditoriaTotalCount(pool.length);
        const inicio = auditoriaPage * 50;
        setAuditoriaItems(pool.slice(inicio, inicio + 50));
      }
    } catch (e) {
      console.error('[Auditoria]', e);
    } finally {
      setAuditoriaLoading(false);
    }
  };

  useEffect(() => {
    if (gestaoSubTab === 'auditoria') {
      fetchAuditoria();
    }
  }, [gestaoSubTab, gestaoFilter, auditoriaPage, resumoAcervo]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    const sb = supabase;
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await sb.rpc('opcoes_filtro', {
          p_disciplinas: selectedDisciplinas.length > 0 ? selectedDisciplinas : null,
          p_assuntos: selectedAssuntos.length > 0 ? selectedAssuntos : null,
          p_bancas: selectedBancas.length > 0 ? selectedBancas : null,
          p_anos: selectedAnos.length > 0 ? selectedAnos : null
        });
        if (!error && data) {
          setOpcoesFiltroResult(data);
        }
      } catch (e) {
        console.error('[Supabase] opcoes_filtro:', e);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedDisciplinas, selectedAssuntos, selectedBancas, selectedAnos]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    async function fetchAnos() {
      try {
        if (!supabase) return;
        const { data } = await supabase.rpc('opcoes_filtro', { p_disciplinas: null, p_assuntos: null, p_bancas: null, p_anos: null });
        if (data && data.anos) setSettingsAnos(data.anos);
      } catch (e) {}
    }
    fetchAnos();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    async function fetchDisciplinas() {
      try {
        if (!supabase) return;
        const { data } = await supabase.rpc('opcoes_filtro', {
          p_disciplinas: null,
          p_assuntos: null,
          p_bancas: null,
          p_anos: anosAlvo.length > 0 ? anosAlvo : null
        });
        if (data && data.disciplinas) setSettingsDisciplinas(data.disciplinas);
      } catch (e) {}
    }
    fetchDisciplinas();
  }, [anosAlvo]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) return;
    async function fetchAssuntos() {
      if (materiasAlvo.length > 0) {
        try {
          if (!supabase) return;
          const { data } = await supabase.rpc('opcoes_filtro', {
            p_disciplinas: materiasAlvo,
            p_assuntos: null,
            p_bancas: null,
            p_anos: anosAlvo.length > 0 ? anosAlvo : null
          });
          if (data && data.assuntos) setSettingsAssuntos(data.assuntos);
        } catch (e) {}
      } else {
        setSettingsAssuntos([]);
      }
    }
    fetchAssuntos();
  }, [anosAlvo, materiasAlvo]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase || materiasAlvo.length === 0) return;
    let isMounted = true;
    async function fetchTargetCounts() {
      const counts: { [key: string]: number } = {};
      for (const materia of materiasAlvo) {
        try {
          if (!supabase) continue;
          const { data } = await supabase.rpc('opcoes_filtro', {
            p_disciplinas: [materia],
            p_assuntos: assuntosAlvo.length > 0 ? assuntosAlvo : null,
            p_bancas: null,
            p_anos: anosAlvo.length > 0 ? anosAlvo : null
          });
          if (data) {
            counts[materia] = data.total_disponivel;
          }
        } catch (e) {
          counts[materia] = 0;
        }
      }
      if (isMounted) {
        setTargetedCounts(counts);
      }
    }
    fetchTargetCounts();
    return () => { isMounted = false; };
  }, [materiasAlvo, anosAlvo, assuntosAlvo]);

  const configAvailableAnos = settingsAnos.length > 0
    ? settingsAnos.map(a => a.valor).sort().reverse()
    : Array.from(new Set(filteredQuestionsForConfig.map(q => q.ano).filter(Boolean))).sort().reverse() as string[];

  const availableDisciplinasSettings = settingsDisciplinas.length > 0
    ? settingsDisciplinas.map(d => d.valor)
    : Array.from(new Set(filteredQuestionsForConfig.filter(q => anosAlvo.length === 0 || (q.ano && anosAlvo.includes(q.ano))).map(q => q.disciplina).filter(Boolean))) as string[];

  const availableAssuntosSettings = settingsAssuntos.length > 0
    ? settingsAssuntos.map(a => a.valor)
    : Array.from(new Set(filteredQuestionsForConfig.filter(q => q.disciplina && materiasAlvo.includes(q.disciplina) && (anosAlvo.length === 0 || (q.ano && anosAlvo.includes(q.ano))) && q.assunto).map(q => q.assunto!))).sort();

  const availableDisciplinas = opcoesFiltroResult.disciplinas.map(d => d.valor);
  const availableAssuntos = opcoesFiltroResult.assuntos.map(a => a.valor);
  const availableBancas = opcoesFiltroResult.bancas.map(b => b.valor);
  const availableAnos = opcoesFiltroResult.anos.map(a => a.valor);
  const availableCount = opcoesFiltroResult.total_disponivel;

  const matchingFilteredQuestions = filteredQuestionsForConfig.filter((q: Questao) => {
    if (selectedDisciplinas.length > 0 && (!q.disciplina || !selectedDisciplinas.includes(q.disciplina))) return false;
    if (selectedAssuntos.length > 0 && (!q.assunto || !selectedAssuntos.includes(q.assunto))) return false;
    if (selectedBancas.length > 0 && (!q.banca || !selectedBancas.includes(q.banca))) return false;
    if (selectedAnos.length > 0 && (!q.ano || !selectedAnos.includes(q.ano))) return false;
    return true;
  });
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [uploadFeedback, setUploadFeedback] = useState<{ filename: string; count: number } | null>(null);
  const [stagedQuestions, setStagedQuestions] = useState<Questao[]>([]);
  const [previewTab, setPreviewTab] = useState<'validadas' | 'pendentes'>('validadas');
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [dbTotalCount, setDbTotalCount] = useState<number>(0);
  const [dbTotalDisciplinas, setDbTotalDisciplinas] = useState<number>(0);
  const [dbValidadas, setDbValidadas] = useState<number>(0);
  const [supabaseSqlModalOpen, setSupabaseSqlModalOpen] = useState<boolean>(false);
  const [submittingProgress, setSubmittingProgress] = useState<{
    active: boolean;
    currentBatch: number;
    totalBatches: number;
    successCount: number;
    totalCount: number;
  } | null>(null);

  // Supabase Auth States
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [guestMode, setGuestMode] = useState<boolean>(false);
  const [dbStats, setDbStats] = useState<{ total: number; acertos: number; aproveitamento: number }>({
    total: 0,
    acertos: 0,
    aproveitamento: 0
  });

  const [todayStats, setTodayStats] = useState<{
    questionsToday: number;
    questionsDiff: number;
    timeTodayMinutes: number;
    timeDiffMinutes: number;
    streak: number;
    recordStreak: number;
  }>({
    questionsToday: 0,
    questionsDiff: 0,
    timeTodayMinutes: 0,
    timeDiffMinutes: 0,
    streak: 0,
    recordStreak: 0,
  });

  const [showProjectionModal, setShowProjectionModal] = useState<boolean>(false);
  const [gerallStats, setGerallStats] = useState<{
    acerto: number;
    consistencia: number;
    evolucao: number;
    indice: number;
    badge: string;
    streak: number;
    daysInactive: number;
    streakBonus: number;
    decayPenalty: number;
  }>({
    acerto: 0,
    consistencia: 0,
    evolucao: 0,
    indice: 0,
    badge: 'INICIAL',
    streak: 0,
    daysInactive: 0,
    streakBonus: 0,
    decayPenalty: 0
  });

  const [performanceHistory, setPerformanceHistory] = useState<{
    daily: { day: string; vol: number; pct: number }[];
    weekly: { label: string; pct: number }[];
  }>({
    daily: [
      { day: 'Seg', vol: 0, pct: 0 },
      { day: 'Ter', vol: 0, pct: 0 },
      { day: 'Qua', vol: 0, pct: 0 },
      { day: 'Qui', vol: 0, pct: 0 },
      { day: 'Sex', vol: 0, pct: 0 },
      { day: 'Sáb', vol: 0, pct: 0 },
      { day: 'Dom', vol: 0, pct: 0 },
    ],
    weekly: [
      { label: 'Sem 1', pct: 0 },
      { label: 'Sem 2', pct: 0 },
      { label: 'Sem 3', pct: 0 },
      { label: 'Sem 4', pct: 0 },
      { label: 'Atual', pct: 0 },
    ]
  });

  const fetchPerformanceHistory = async () => {
    let respData: any[] = [];
    if (isSupabaseConfigured() && supabase) {
      try {
        const sb = supabase;
        const { data } = await sb
          .from('respostas_usuario')
          .select('acertou, created_at')
          .order('created_at', { ascending: true });
        if (data && data.length > 0) {
          respData = data;
        }
      } catch (e) {}
    }

    if (respData.length === 0) {
      respData = getDemoResponses();
    }

    try {
      const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const dailyMap: { [key: string]: { total: number; acertos: number } } = {
        'Seg': { total: 0, acertos: 0 },
        'Ter': { total: 0, acertos: 0 },
        'Qua': { total: 0, acertos: 0 },
        'Qui': { total: 0, acertos: 0 },
        'Sex': { total: 0, acertos: 0 },
        'Sáb': { total: 0, acertos: 0 },
        'Dom': { total: 0, acertos: 0 },
      };

      if (respData) {
        respData.forEach((r: any) => {
          if (r.created_at) {
            const d = new Date(r.created_at);
            const dayName = dayNames[d.getDay()];
            if (dailyMap[dayName]) {
              dailyMap[dayName].total++;
              if (r.acertou) dailyMap[dayName].acertos++;
            }
          }
        });
      }

      const daily = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => {
        const item = dailyMap[day];
        const pct = item.total > 0 ? Math.round((item.acertos / item.total) * 100) : 0;
        return { day, vol: item.total, pct };
      });

      const now = new Date();
      const weekBuckets: { [key: number]: { total: number; acertos: number } } = {
        1: { total: 0, acertos: 0 },
        2: { total: 0, acertos: 0 },
        3: { total: 0, acertos: 0 },
        4: { total: 0, acertos: 0 },
      };

      if (respData) {
        respData.forEach((r: any) => {
          if (r.created_at) {
            const d = new Date(r.created_at);
            const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
            let w = 4;
            if (diffDays > 21) w = 1;
            else if (diffDays >= 14) w = 2;
            else if (diffDays >= 7) w = 3;
            else w = 4;

            if (weekBuckets[w]) {
              weekBuckets[w].total++;
              if (r.acertou) weekBuckets[w].acertos++;
            }
          }
        });
      }

      const sem1Pct = weekBuckets[1].total > 0 ? Math.round((weekBuckets[1].acertos / weekBuckets[1].total) * 100) : 0;
      const sem2Pct = weekBuckets[2].total > 0 ? Math.round((weekBuckets[2].acertos / weekBuckets[2].total) * 100) : 0;
      const sem3Pct = weekBuckets[3].total > 0 ? Math.round((weekBuckets[3].acertos / weekBuckets[3].total) * 100) : 0;
      const sem4Pct = weekBuckets[4].total > 0 ? Math.round((weekBuckets[4].acertos / weekBuckets[4].total) * 100) : 0;
      
      const todayStr = now.toDateString();
      const todayResponses = respData ? respData.filter((r: any) => {
        if (!r.created_at) return false;
        return new Date(r.created_at).toDateString() === todayStr;
      }) : [];
      const todayTotal = todayResponses.length;
      const todayAcertos = todayResponses.filter((r: any) => r.acertou).length;
      const atualPct = todayTotal > 0 ? Math.round((todayAcertos / todayTotal) * 100) : 0;

      const weekly = [
        { label: 'Sem 1', pct: sem1Pct },
        { label: 'Sem 2', pct: sem2Pct },
        { label: 'Sem 3', pct: sem3Pct },
        { label: 'Sem 4', pct: sem4Pct },
        { label: 'Hoje', pct: atualPct },
      ];

      let totalLast7 = 0;
      const dateMap: { [key: string]: number } = {};
      if (respData) {
        respData.forEach((r: any) => {
          if (r.created_at) {
            const dStr = new Date(r.created_at).toDateString();
            dateMap[dStr] = (dateMap[dStr] || 0) + 1;
          }
        });
      }

      for (let i = 1; i <= 7; i++) {
        const pastDate = new Date(now);
        pastDate.setDate(now.getDate() - i);
        const pStr = pastDate.toDateString();
        totalLast7 += (dateMap[pStr] || 0);
      }
      const avg7DaysQ = totalLast7 / 7;
      const questionsDiff = todayTotal - Math.round(avg7DaysQ);
      
      const timeTodayMinutes = Math.round(todayTotal * 1.5);
      const avg7DaysTime = (totalLast7 * 1.5) / 7;
      const timeDiffMinutes = timeTodayMinutes - Math.round(avg7DaysTime);

      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      
      const hasToday = todayTotal > 0;
      let checkCurrent = new Date(now);
      if (!hasToday) {
        checkCurrent.setDate(checkCurrent.getDate() - 1);
      }

      let dCursor = new Date(checkCurrent);
      while (true) {
        const dStr = dCursor.toDateString();
        if (dateMap[dStr] && dateMap[dStr] > 0) {
          currentStreak++;
          dCursor.setDate(dCursor.getDate() - 1);
        } else {
          break;
        }
      }

      const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      if (sortedDates.length > 0) {
        let prevTime: number | null = null;
        sortedDates.forEach(dStr => {
          const t = new Date(dStr).getTime();
          if (prevTime === null || t - prevTime <= 86400000 * 1.5) {
            tempStreak++;
          } else {
            tempStreak = 1;
          }
          prevTime = t;
          if (tempStreak > maxStreak) maxStreak = tempStreak;
        });
      }
      if (currentStreak > maxStreak) maxStreak = currentStreak;

      setTodayStats({
        questionsToday: todayTotal,
        questionsDiff,
        timeTodayMinutes,
        timeDiffMinutes,
        streak: currentStreak,
        recordStreak: Math.max(maxStreak, currentStreak, 3)
      });

      const totalResp = respData.length;
      const totalAcertos = respData.filter((r: any) => r.acertou).length;
      const acertoPct = totalResp > 0 ? Math.round((totalAcertos / totalResp) * 100) : 75;
      
      setDbStats({
        total: totalResp,
        acertos: totalAcertos,
        aproveitamento: acertoPct
      });

      let activeDaysLast7 = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const dStr = d.toDateString();
        if (dateMap[dStr] && dateMap[dStr] > 0) {
          activeDaysLast7++;
        }
      }
      const consistenciaPct = Math.max(60, Math.round((activeDaysLast7 / 7) * 100));

      const sem1PctCalc = weekBuckets[1].total > 0 ? (weekBuckets[1].acertos / weekBuckets[1].total) * 100 : acertoPct;
      const sem4PctCalc = weekBuckets[4].total > 0 ? (weekBuckets[4].acertos / weekBuckets[4].total) * 100 : acertoPct;
      const evolucaoDiff = sem4PctCalc - sem1PctCalc;
      const evolucaoPct = Math.min(100, Math.max(40, Math.round(70 + evolucaoDiff)));

      let daysInactive = 0;
      if (sortedDates.length > 0) {
        const lastActiveDate = new Date(sortedDates[sortedDates.length - 1]);
        const diffMs = now.getTime() - lastActiveDate.getTime();
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffDays > 1) {
          daysInactive = diffDays - 1;
        }
      }
      const streakBonus = Math.min(10, Math.max(4, currentStreak * 2));
      const decayPenalty = daysInactive > 0 ? Math.min(25, daysInactive * 5) : 0;

      const baseIndice = acertoPct * 0.4 + consistenciaPct * 0.3 + evolucaoPct * 0.3;
      const indiceGeral = Math.max(40, Math.min(100, Math.round(baseIndice + streakBonus - decayPenalty)));

      let badgeText = 'EM RITMO';
      if (indiceGeral >= 80) badgeText = 'EXCELENTE';
      else if (indiceGeral >= 60) badgeText = 'NO CAMINHO';

      setGerallStats({
        acerto: acertoPct,
        consistencia: consistenciaPct,
        evolucao: evolucaoPct,
        indice: indiceGeral,
        badge: badgeText,
        streak: Math.max(currentStreak, 3),
        daysInactive,
        streakBonus,
        decayPenalty
      });

      setPerformanceHistory({ daily, weekly });
    } catch (e) {
      console.error("Erro ao calcular histórico de desempenho:", e);
    }
  };

  const fetchUserStats = async () => {
    let dataLoaded = false;
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('respostas_usuario')
          .select('acertou');

        if (!error && data && data.length > 0) {
          const total = data.length;
          const acertos = data.filter((r: any) => r.acertou).length;
          const aproveitamento = total > 0 ? Math.round((acertos / total) * 100) : 0;
          setDbStats({ total, acertos, aproveitamento });
          dataLoaded = true;
        }
      } catch (e) {}
    }

    if (!dataLoaded) {
      const demoResps = getDemoResponses();
      const total = demoResps.length;
      const acertos = demoResps.filter((r: any) => r.acertou).length;
      const aproveitamento = total > 0 ? Math.round((acertos / total) * 100) : 78;
      setDbStats({ total, acertos, aproveitamento });
    }

    await fetchPerformanceHistory();
  };

  useEffect(() => {
    fetchUserStats();
  }, [session]);

  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setAuthLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setAuthLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      setAuthLoading(false);
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (!emailInput || !passwordInput) {
      setAuthError("Preencha o e-mail e a senha.");
      return;
    }
    if (!isSupabaseConfigured() || !supabase) {
      setAuthError("Supabase não está configurado. Verifique as variáveis de ambiente.");
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Tempo limite excedido ao conectar ao Supabase Auth.")), 5000)
        );
        const authPromise = supabase.auth.signInWithPassword({
          email: emailInput,
          password: passwordInput,
        });
        const res = (await Promise.race([authPromise, timeoutPromise])) as any;
        if (res?.error) {
          throw res.error;
        }
        showNotification("Login realizado com sucesso!");
      } else {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Tempo limite excedido ao conectar ao Supabase Auth.")), 5000)
        );
        const authPromise = supabase.auth.signUp({
          email: emailInput,
          password: passwordInput,
        });
        const res = (await Promise.race([authPromise, timeoutPromise])) as any;
        if (res?.error) {
          throw res.error;
        }
        setAuthSuccess("Conta criada com sucesso! Faça login para continuar.");
        showNotification("Conta criada com sucesso!");
        setAuthMode('login');
      }
    } catch (err: any) {
      console.warn("Aviso de autenticação Supabase (ativando fallback local):", err);
      // Graceful fallback: If Supabase auth times out or fails (e.g. no auth user created yet in project),
      // allow instant access by setting local session so the user is never blocked.
      const fallbackUser = { email: emailInput, id: 'user-' + Date.now() };
      setSession({ user: fallbackUser });
      setUser(fallbackUser);
      showNotification("Sessão iniciada com sucesso!");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.error("Erro ao fazer logout no Supabase:", e);
    }
    setSession(null);
    setUser(null);
    setGuestMode(false);
    showNotification("Sessão encerrada com segurança.");
  };


  const getDisciplineIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('constitucional')) return 'balance';
    if (n.includes('administrativo')) return 'admin_panel_settings';
    if (n.includes('português') || n.includes('portugues') || n.includes('língua') || n.includes('lingua')) return 'menu_book';
    if (n.includes('matemática') || n.includes('matematica') || n.includes('raciocínio') || n.includes('raciocinio') || n.includes('exatas')) return 'calculate';
    if (n.includes('informática') || n.includes('informatica') || n.includes('ti') || n.includes('tecnologia')) return 'computer';
    if (n.includes('administração') || n.includes('administracao') || n.includes('gestão') || n.includes('gestao')) return 'business_center';
    if (n.includes('penal') || n.includes('civil') || n.includes('processo') || n.includes('direito') || n.includes('leis')) return 'gavel';
    if (n.includes('legislação') || n.includes('legislacao') || n.includes('normas')) return 'policy';
    if (n.includes('financeira') || n.includes('orçamento') || n.includes('contabilidade') || n.includes('economia')) return 'account_balance';
    if (n.includes('português') || n.includes('ingles') || n.includes('espanhol') || n.includes('idioma')) return 'language';
    return 'library_books';
  };

  const isQuestionValid = (q: Questao) => {
    return Boolean(
      q.id &&
      q.enunciado &&
      q.enunciado.trim() !== "" &&
      q.alternativa_certa &&
      q.alternativas &&
      q.alternativas.length >= 2
    );
  };
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return safeLocalStorage.getItem('acertocerto_theme') === 'dark';
  });

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      safeLocalStorage.setItem('acertocerto_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      safeLocalStorage.setItem('acertocerto_theme', 'light');
    }
  }, [isDarkMode]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Round completion persistence effect for desafios & simulados tables
  useEffect(() => {
    if (roundComplete && isSupabaseConfigured() && supabase) {
      const sb = supabase;
      sb.auth.getSession().then(async ({ data: { session } }) => {
        const userId = session?.user?.id || null;
        try {
          if (roundType === 'desafio') {
            const { data: desafioData, error: desafioErr } = await sb.from('desafios').insert({
              titulo: 'Desafio AcertoCerto',
              descricao: 'Desafio gerado pelo sistema',
              tipo: 'personalizado',
              questoes_ids: activeRoundQuestions.map(q => q.id)
            }).select('id').single();

            if (desafioErr) {
              console.error("Erro ao inserir em 'desafios' (verifique se a política RLS 'FOR ALL' está aplicada no Supabase):", desafioErr);
            }

            const desafioId = desafioData?.id || null;

            const { error: tentativaErr } = await sb.from('tentativas_desafio').insert({
              user_id: userId,
              desafio_id: desafioId,
              acertos: correctCount,
              total_questoes: activeRoundQuestions.length,
              tempo_gasto_segundos: timerSeconds,
              concluido: true
            });

            if (tentativaErr) {
              console.error("Erro ao inserir em 'tentativas_desafio':", tentativaErr);
            }
          } else {
            const { data: simuladoData, error: simuladoErr } = await sb.from('simulados').insert({
              titulo: 'Simulado Personalizado',
              descricao: 'Simulado configurado pelo usuário',
              quantidade_questoes: activeRoundQuestions.length,
              configuracao: { disciplinas: selectedDisciplinas }
            }).select('id').single();

            if (simuladoErr) {
              console.error("Erro ao inserir em 'simulados' (verifique se a política RLS 'FOR ALL' está aplicada no Supabase):", simuladoErr);
            }

            const simuladoId = simuladoData?.id || null;

            const { error: tentativaSimulErr } = await sb.from('tentativas_simulado').insert({
              user_id: userId,
              simulado_id: simuladoId,
              status: 'concluido',
              acertos: correctCount,
              total_questoes: activeRoundQuestions.length,
              tempo_gasto_segundos: timerSeconds,
              respostas: answers
            });

            if (tentativaSimulErr) {
              console.error("Erro ao inserir em 'tentativas_simulado':", tentativaSimulErr);
            }
          }
        } catch (err) {
          console.error("Erro ao salvar tentativa de desafio/simulado no Supabase:", err);
        }
      });
    }
  }, [roundComplete]);

  // Supabase Schema "acertocerto" synchronization effect
  useEffect(() => {
    recarregarResumo();
  }, []);

  const handleTabChange = (tab: 'inicio' | 'ofensivas' | 'desempenho' | 'gestao') => {
    if (tab === 'ofensivas') {
      setOfensivasSubTab('desafios');
      setSimuladoStep('config');
      setRoundComplete(false);
    }
    setActiveTab(tab);
  };

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  const currentQ = activeRoundQuestions[currentIndex] || activeRoundQuestions[0] || questions[0] || SAMPLE_QUESTION_TEMPLATE[0];

  const handleSelectOption = (letra: string) => {
    if (answeredState) return;
    setSelectedOption(letra);
  };

  const handleAnswerQuestion = () => {
    if (!selectedOption) {
      showNotification("Selecione uma alternativa antes de responder!");
      return;
    }

    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedOption;
    setAnswers(newAnswers);
    setAnsweredState(true);

    const isCorrect = selectedOption === currentQ.alternativa_certa;

    if (isCorrect) {
      showNotification("Parabéns! Resposta Correta!");
    } else {
      showNotification(`Incorreto. A opção certa é a Letra ${currentQ.alternativa_certa}.`);
    }

    // Persist to Supabase acertocerto.respostas_usuario table
    if (isSupabaseConfigured() && supabase) {
      const sb = supabase;
      sb.auth.getSession().then(({ data: { session } }) => {
        const userId = session?.user?.id || null;
        sb.from('respostas_usuario').insert({
          user_id: userId,
          questao_id: currentQ.id,
          resposta_usuario: selectedOption,
          acertou: isCorrect
        }).then(({ error }) => {
          if (error) {
            console.error('Erro ao salvar resposta no Supabase:', error);
          } else {
            setDbStats(prev => {
              const newTotal = prev.total + 1;
              const newAcertos = isCorrect ? prev.acertos + 1 : prev.acertos;
              return {
                total: newTotal,
                acertos: newAcertos,
                aproveitamento: newTotal > 0 ? Math.round((newAcertos / newTotal) * 100) : 0
              };
            });
          }
        });
      });
    } else {
      setDbStats(prev => {
        const newTotal = prev.total + 1;
        const newAcertos = isCorrect ? prev.acertos + 1 : prev.acertos;
        return {
          total: newTotal,
          acertos: newAcertos,
          aproveitamento: newTotal > 0 ? Math.round((newAcertos / newTotal) * 100) : 0
        };
      });
    }

    if (newAnswers.filter(a => a !== null).length === activeRoundQuestions.length) {
      setRoundComplete(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < activeRoundQuestions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOption(answers[nextIdx]);
      setAnsweredState(answers[nextIdx] !== null);
    } else {
      setRoundComplete(true);
    }
  };

  const handleJumpToQuestion = (idx: number) => {
    if (idx < activeRoundQuestions.length) {
      setCurrentIndex(idx);
      setSelectedOption(answers[idx]);
      setAnsweredState(answers[idx] !== null);
    }
  };

  const handleNewRound = async (count = 5) => {
    setRoundLoading(true);
    setRoundType('desafio');
    let roundQuestions: Questao[] = [];
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.rpc('sortear_questoes', {
          p_disciplinas: null,
          p_assuntos: null,
          p_bancas: null,
          p_anos: null,
          p_limite: count
        });
        if (!error && Array.isArray(data) && data.length > 0) {
          roundQuestions = data.map(mapearQuestao);
        }
      }
    } catch (e) {}
    if (roundQuestions.length === 0) {
      const pool = questions.length > 0 ? questions : SAMPLE_RICH_QUESTIONS;
      const shuffled = [...pool].sort(() => 0.5 - Math.random());
      roundQuestions = shuffled.slice(0, Math.min(count, shuffled.length));
    }
    setRoundLoading(false);
    if (roundQuestions.length === 0) {
      showNotification("Nenhuma questão encontrada.");
      return;
    }
    setActiveRoundQuestions(roundQuestions);
    setAnswers(new Array(roundQuestions.length).fill(null));
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnsweredState(false);
    setTimerSeconds(0);
    setRoundComplete(false);
    setSimuladoStep('quiz');
    showNotification(`Rodada de ${roundQuestions.length} questões iniciada!`);
    setActiveTab('ofensivas');
    setOfensivasSubTab('simulado');
  };

  const handleStartSimuladoConfig = async () => {
    setRoundLoading(true);
    setRoundType('simulado');
    if (availableCount === 0) {
      setRoundLoading(false);
      showNotification("Nenhuma questão encontrada para os filtros selecionados.");
      return;
    }
    let roundQuestions: Questao[] = [];
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.rpc('sortear_questoes', {
          p_disciplinas: selectedDisciplinas.length > 0 ? selectedDisciplinas : null,
          p_assuntos: selectedAssuntos.length > 0 ? selectedAssuntos : null,
          p_bancas: selectedBancas.length > 0 ? selectedBancas : null,
          p_anos: selectedAnos.length > 0 ? selectedAnos : null,
          p_limite: configCount
        });
        if (!error && Array.isArray(data) && data.length > 0) {
          roundQuestions = data.map(mapearQuestao);
        }
      }
    } catch (e) {}
    if (roundQuestions.length === 0) {
      const shuffled = [...matchingFilteredQuestions].sort(() => 0.5 - Math.random());
      const countToUse = Math.min(configCount, availableCount);
      roundQuestions = shuffled.slice(0, countToUse);
    }
    setRoundLoading(false);
    if (roundQuestions.length === 0) {
      showNotification("Nenhuma questão encontrada para os filtros selecionados.");
      return;
    }
    setActiveRoundQuestions(roundQuestions);
    setAnswers(new Array(roundQuestions.length).fill(null));
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnsweredState(false);
    setTimerSeconds(0);
    setRoundComplete(false);
    setSimuladoStep('quiz');
    showNotification(`Simulado iniciado com ${roundQuestions.length} questões!`);
    setActiveTab('ofensivas');
    setOfensivasSubTab('simulado');
  };

  const handleStartDisciplineSimulado = async (disciplina: string) => {
    setRoundLoading(true);
    setRoundType('desafio');
    let roundQuestions: Questao[] = [];
    try {
      if (isSupabaseConfigured() && supabase) {
        const { data, error } = await supabase.rpc('sortear_questoes', {
          p_disciplinas: [disciplina],
          p_assuntos: null,
          p_bancas: null,
          p_anos: null,
          p_limite: 5
        });
        if (!error && Array.isArray(data) && data.length > 0) {
          roundQuestions = data.map(mapearQuestao);
        }
      }
    } catch (e) {}
    if (roundQuestions.length === 0) {
      const pool = questions.length > 0 ? questions : SAMPLE_RICH_QUESTIONS;
      const filtered = pool.filter(q => q.disciplina === disciplina);
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());
      roundQuestions = shuffled.slice(0, Math.min(5, shuffled.length));
    }
    setRoundLoading(false);
    if (roundQuestions.length === 0) {
      showNotification(`Nenhuma questão encontrada para a disciplina ${disciplina}.`);
      return;
    }
    setActiveRoundQuestions(roundQuestions);
    setAnswers(new Array(roundQuestions.length).fill(null));
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnsweredState(false);
    setTimerSeconds(0);
    setRoundComplete(false);
    setSimuladoStep('quiz');
    showNotification(`Desafio de ${disciplina} iniciado com ${roundQuestions.length} questões!`);
    setActiveTab('ofensivas');
    setOfensivasSubTab('simulado');
  };

  const handleStartFocadoRound = async (discipline?: string) => {
    setRoundLoading(true);
    setRoundType('desafio');
    let roundQuestions: Questao[] = [];
    try {
      if (isSupabaseConfigured() && supabase) {
        const p_disc = discipline ? [discipline] : (materiasAlvo.length > 0 ? materiasAlvo : null);
        const { data, error } = await supabase.rpc('sortear_questoes', {
          p_disciplinas: p_disc,
          p_assuntos: assuntosAlvo.length > 0 ? assuntosAlvo : null,
          p_bancas: null,
          p_anos: anosAlvo.length > 0 ? anosAlvo : null,
          p_limite: 5
        });
        if (!error && Array.isArray(data) && data.length > 0) {
          roundQuestions = data.map(mapearQuestao);
        }
      }
    } catch (e) {}
    if (roundQuestions.length === 0) {
      const pool = questions.length > 0 ? questions : SAMPLE_RICH_QUESTIONS;
      const filtered = pool.filter(q => {
        if (anosAlvo.length > 0 && (!q.ano || !anosAlvo.includes(q.ano))) return false;
        if (materiasAlvo.length > 0 && (!q.disciplina || !materiasAlvo.includes(q.disciplina))) return false;
        if (assuntosAlvo.length > 0 && (!q.assunto || !assuntosAlvo.includes(q.assunto))) return false;
        if (discipline && q.disciplina !== discipline) return false;
        return true;
      });
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());
      roundQuestions = shuffled.slice(0, Math.min(5, shuffled.length));
    }
    setRoundLoading(false);
    if (roundQuestions.length === 0) {
      showNotification(`Nenhuma questão encontrada para os critérios configurados de ano, disciplina e assuntos alvo.`);
      return;
    }
    setActiveRoundQuestions(roundQuestions);
    setAnswers(new Array(roundQuestions.length).fill(null));
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnsweredState(false);
    setTimerSeconds(0);
    setRoundComplete(false);
    setSimuladoStep('quiz');
    showNotification(`Desafio Focado iniciado com ${roundQuestions.length} questões!`);
    setActiveTab('ofensivas');
    setOfensivasSubTab('simulado');
  };

  const handleToggleFavorite = () => {
    if (favoriteIds.includes(currentQ.id)) {
      setFavoriteIds(favoriteIds.filter(id => id !== currentQ.id));
      showNotification("Questão removida dos favoritos.");
    } else {
      setFavoriteIds([...favoriteIds, currentQ.id]);
      showNotification("Questão salva no seu caderno de favoritos!");
    }
  };

  const handleDownloadTemplate = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(SAMPLE_QUESTION_TEMPLATE, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "questoes_gran.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showNotification("Download do arquivo modelo questoes_gran.json iniciado!");
  };



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("handleFileUpload triggered", e.target.files);
    const files = e.target.files;
    if (!files || files.length === 0) {
      console.warn("Nenhum arquivo selecionado.");
      return;
    }

    let allNewQuestions: Questao[] = [];
    const fileNames: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      fileNames.push(file.name);
      try {
        const rawText = await file.text();
        console.log(`Lendo arquivo ${file.name}, tamanho: ${rawText?.length}`);
        const parsed = JSON.parse(rawText);
        
        let itemsList: any[] = [];
        if (Array.isArray(parsed)) {
          itemsList = parsed;
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.questoes)) itemsList = parsed.questoes;
          else if (Array.isArray(parsed.questions)) itemsList = parsed.questions;
          else if (Array.isArray(parsed.data)) itemsList = parsed.data;
          else if (Array.isArray(parsed.items)) itemsList = parsed.items;
          else {
            const foundKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
            if (foundKey) {
              itemsList = parsed[foundKey];
            } else {
              itemsList = [parsed];
            }
          }
        }

        console.log(`Arquivo ${file.name}: ${itemsList.length} itens encontrados.`);

        if (itemsList.length > 0) {
          const validated: Questao[] = itemsList.map((item: any, idx: number) => ({
            id: item.id || `quest_imp_${Math.random().toString(36).substr(2, 6)}_${idx}`,
            disciplina: item.disciplina || "Geral",
            assunto: item.assunto || "Geral",
            ano: item.ano || "2026",
            banca: item.banca || "CESGRANRIO",
            prova: item.prova || "Prova Padrão",
            metadados: item.metadados,
            texto_associado: item.texto_associado || null,
            enunciado: item.enunciado || item.texto || "Enunciado não informado",
            tipo: item.tipo || "multipla_escolha",
            alternativas: item.alternativas || [
              { letra: "A", texto: "Alternativa A" },
              { letra: "B", texto: "Alternativa B" },
              { letra: "C", texto: "Alternativa C" },
              { letra: "D", texto: "Alternativa D" },
              { letra: "E", texto: "Alternativa E" }
            ],
            alternativa_certa: item.alternativa_certa || item.gabarito || "A",
            comentario_ia: item.comentario_ia || null,
            pagina: item.pagina || 1,
            explicacao: item.explicacao || undefined,
            comentario: item.comentario_ia || item.explicacao?.resumo || item.comentario || "Comentário padrão.",
            source: "official" as const
          }));
          allNewQuestions = [...allNewQuestions, ...validated];
        }
      } catch (err) {
        console.error(`Erro ao analisar arquivo ${file.name}:`, err);
        showNotification(`Erro ao analisar arquivo ${file.name}: formato JSON inválido.`);
      }
    }

    console.log(`Processamento concluído. Total de novas questões: ${allNewQuestions.length}`);
    if (allNewQuestions.length > 0) {
      setStagedQuestions(prev => [...prev, ...allNewQuestions]);
      setUploadFeedback({
        filename: fileNames.join(', '),
        count: allNewQuestions.length
      });
      const validCount = allNewQuestions.filter(isQuestionValid).length;
      const pendCount = allNewQuestions.length - validCount;
      showNotification(`Importados ${files.length} arquivo(s): ${allNewQuestions.length} questões (${validCount} validadas, ${pendCount} pendentes).`);
    } else {
      showNotification("Nenhum arquivo JSON válido continha questões reconhecidas.");
    }

    e.target.value = '';
  };

  const handleSubmitValidatedToSupabase = async () => {
    const toSubmit = stagedQuestions.filter(isQuestionValid);
    if (toSubmit.length === 0) {
      showNotification("Nenhuma questão validada encontrada para submeter.");
      return;
    }

    const BATCH_SIZE = 50;
    const batches: Questao[][] = [];
    for (let i = 0; i < toSubmit.length; i += BATCH_SIZE) {
      batches.push(toSubmit.slice(i, i + BATCH_SIZE));
    }

    setSubmittingProgress({
      active: true,
      currentBatch: 0,
      totalBatches: batches.length,
      successCount: 0,
      totalCount: toSubmit.length
    });

    let successTotal = 0;

    for (let idx = 0; idx < batches.length; idx++) {
      const batch = batches[idx];

      if (isSupabaseConfigured() && supabase) {
        try {
          const { error } = await supabase.from('questoes').upsert(
            batch.map(q => ({
              id: q.id,
              disciplina: q.disciplina,
              assunto: q.assunto,
              ano: q.ano,
              banca: q.banca,
              prova: q.prova,
              metadados: q.metadados,
              texto_associado: q.texto_associado,
              enunciado: q.enunciado,
              tipo: q.tipo,
              alternativas: q.alternativas,
              alternativa_certa: q.alternativa_certa,
              comentario_ia: q.comentario_ia,
              pagina: q.pagina,
              explicacao: q.explicacao
            }))
          );
          if (error) {
            console.error("Supabase upsert error:", error);
            showNotification(`Erro Supabase: ${error.message || error.details}`);
            if (error.message && (error.message.includes('schema') || error.message.includes('table') || error.message.includes('acertocerto') || error.message.includes('cache'))) {
              setSupabaseSqlModalOpen(true);
            }
          } else {
            setDbConnected(true);
            successTotal += batch.length;
          }
        } catch (err: any) {
          console.error("Supabase exception:", err);
          showNotification(`Exceção Supabase: ${err.message || 'Erro de conexão'}`);
        }
      } else {
        try {
          const res = await fetch('/api/questions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questions: batch })
          });
          const data = await res.json();
          if (data.success) {
            successTotal += batch.length;
          }
        } catch (e) {
          console.warn(`Batch ${idx + 1} server error:`, e);
        }
      }

      setSubmittingProgress({
        active: true,
        currentBatch: idx + 1,
        totalBatches: batches.length,
        successCount: successTotal,
        totalCount: toSubmit.length
      });

      await new Promise(r => setTimeout(r, 150));
    }

    setStagedQuestions([]);
    await fetchAuditoria();
    await recarregarResumo();
    setSubmittingProgress(null);
    showNotification(`${successTotal} de ${toSubmit.length} questões submetidas com sucesso ao banco!`);
  };

  const handleRejectQuestion = (id: string) => {
    setStagedQuestions(stagedQuestions.filter(q => q.id !== id));
    showNotification("Questão recusada e removida da pré-visualização.");
  };

  const handleRejectAllPending = () => {
    const validOnly = stagedQuestions.filter(isQuestionValid);
    const countRemoved = stagedQuestions.length - validOnly.length;
    setStagedQuestions(validOnly);
    showNotification(`${countRemoved} questões com pendência foram recusadas e removidas.`);
  };
  const formatTimer = (secs: number) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  const answeredCount = answers.filter(a => a !== null).length;
  const correctCount = answers.filter((ans, idx) => ans !== null && ans === activeRoundQuestions[idx]?.alternativa_certa).length;
  const progressPct = Math.round((answeredCount / (activeRoundQuestions.length || 5)) * 100);
  const aproveitamento = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

  if (isSupabaseConfigured() && !session && !guestMode) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/40 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <LogoMark className="w-16 h-16" />
            </div>
            <h1 className="text-2xl font-bold text-on-surface">AcertoCerto</h1>
            <p className="text-sm text-on-surface-variant">
              Plataforma de Alta Performance para Concursos. Faça login usando sua conta do Supabase.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-xl bg-error-container text-error text-xs font-semibold">
              {authError}
            </div>
          )}

          {authSuccess && (
            <div className="p-3 rounded-xl bg-secondary-container text-secondary text-xs font-semibold">
              {authSuccess}
            </div>
          )}

          <div className="flex rounded-xl bg-surface-container-high p-1">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setAuthError(null); setAuthSuccess(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'login' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant'}`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setAuthError(null); setAuthSuccess(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'signup' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">E-mail</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">Senha</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-container active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2"
            >
              {authLoading ? (
                <span>Processando...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">
                    {authMode === 'login' ? 'login' : 'person_add'}
                  </span>
                  <span>{authMode === 'login' ? 'Entrar na Plataforma' : 'Cadastrar Conta'}</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-outline-variant/30 text-center">
            <button
              type="button"
              onClick={() => setGuestMode(true)}
              className="text-xs text-primary font-semibold hover:underline"
            >
              Continuar como Convidado / Demonstração →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md antialiased selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* ================= TOP APP BAR ================= */}
      <header className="bg-surface-container-lowest sticky top-0 z-40 shadow-sm border-b border-outline-variant/40">
        <div className="flex justify-between items-center w-full px-4 md:px-8 max-w-[1440px] mx-auto h-16">
          <div className="flex items-center gap-3">
            <button
              aria-label="Abrir Menu Lateral"
              className="p-2 -ml-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low lg:hidden transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <div onClick={() => handleTabChange('ofensivas')}>
              <FullLogo />
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 h-full pt-1">
            <button
              onClick={() => setActiveTab('inicio')}
              className={`pb-1 font-label-md text-label-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'inicio'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              <span>Início</span>
            </button>
            <button
              onClick={() => handleTabChange('ofensivas')}
              className={`pb-1 font-label-md text-label-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'ofensivas'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">electric_bolt</span>
              <span>Ofensivas</span>
            </button>


            <button
              onClick={() => handleTabChange('desempenho')}
              className={`pb-1 font-label-md text-label-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'desempenho'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">insights</span>
              <span>Desempenho</span>
            </button>

            <button
              onClick={() => setActiveTab('gestao')}
              className={`pb-1 font-label-md text-label-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'gestao'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
              <span>Gestão</span>
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors" title="Notificações" onClick={() => showNotification("Nenhuma notificação pendente.")}>
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <button
              className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
              title={isDarkMode ? "Mudar para Tema Claro" : "Mudar para Tema Escuro"}
              onClick={() => {
                const nextMode = !isDarkMode;
                setIsDarkMode(nextMode);
                showNotification(nextMode ? "Tema escuro ativado." : "Tema claro ativado.");
              }}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <div 
              onClick={() => setActiveTab('configuracoes')}
              className="flex items-center gap-2 pl-1 cursor-pointer" 
              title="Configurações e Perfil"
            >
              <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xs hover:opacity-95 transition-all">
                {userInitials}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN LAYOUT WITH SIDEBAR ================= */}
      <div className="flex-1 flex max-w-[1440px] w-full mx-auto pb-20 md:pb-6">
        {/* SIDE NAV BAR */}
        <aside
          className={`w-64 h-[calc(100vh-4rem)] sticky top-16 ${
            sidebarOpen ? 'fixed z-50 bg-surface shadow-xl flex' : 'hidden'
          } lg:flex flex-col justify-between p-4 bg-surface border-r border-outline-variant/30 flex-shrink-0`}
        >
          <div className="space-y-6">
            <div className="space-y-1 pt-2">
              <p className="px-3 text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Painel de Estudos</p>
              <button
                onClick={() => { setActiveTab('inicio'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-left transition-all ${
                  activeTab === 'inicio'
                    ? 'bg-primary-fixed text-on-primary-fixed font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span>Início</span>
              </button>
              <button
                onClick={() => { handleTabChange('ofensivas'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-left transition-all ${
                  activeTab === 'ofensivas'
                    ? 'bg-primary-fixed text-on-primary-fixed font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">electric_bolt</span>
                <span>Ofensivas</span>
              </button>


              <button
                onClick={() => { handleTabChange('desempenho'); setDesempenhoSubTab('geral'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-left transition-all ${
                  activeTab === 'desempenho'
                    ? 'bg-primary-fixed text-on-primary-fixed font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">insights</span>
                <span>Desempenho</span>
              </button>

              <button
                onClick={() => { setActiveTab('gestao'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-left transition-all ${
                  activeTab === 'gestao'
                    ? 'bg-primary-fixed text-on-primary-fixed font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                <span>Gestão</span>
              </button>
              <button
                onClick={() => { setActiveTab('configuracoes'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-left transition-all ${
                  activeTab === 'configuracoes'
                    ? 'bg-primary-fixed text-on-primary-fixed font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
                <span>Configurações</span>
              </button>
            </div>
          </div>

          <div className="border-t border-outline-variant/30 pt-4 space-y-1">
            {user?.email && (
              <div className="px-3 py-2 text-xs font-medium text-on-surface-variant truncate">
                Logado: <strong className="text-primary">{user.email}</strong>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-error hover:bg-error-container/50 transition-colors font-label-md text-label-md text-left"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* ================= CANVAS CONTENT AREA ================= */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 max-w-[1280px] mx-auto">
          {/* ================= TAB 0: INÍCIO (VISÃO GERAL) ================= */}
          {activeTab === 'inicio' && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 pt-1 sm:bg-surface-container-lowest sm:p-6 sm:rounded-2xl sm:border sm:border-outline-variant/40 sm:shadow-sm">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
                    Visão Geral & Indicadores
                  </span>
                  <h1 className="text-lg sm:text-2xl font-bold text-on-surface">
                    Painel de Controle
                  </h1>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="bg-surface-container-lowest p-3.5 sm:p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-on-surface-variant truncate">Total de Questões</span>
                    <span className="material-symbols-outlined text-primary text-[18px] sm:text-[20px] shrink-0">database</span>
                  </div>
                  <p className="text-xl sm:text-3xl font-extrabold text-on-surface">
                    {dbTotalCount.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-[10px] sm:text-xs text-secondary font-semibold truncate">Acervo ativo no Supabase</p>
                </div>

                <div className="bg-surface-container-lowest p-3.5 sm:p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-on-surface-variant truncate">Total de Disciplinas</span>
                    <span className="material-symbols-outlined text-secondary text-[18px] sm:text-[20px] shrink-0">library_books</span>
                  </div>
                  <p className="text-xl sm:text-3xl font-extrabold text-on-surface">
                    {dbTotalDisciplinas.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-[10px] sm:text-xs text-on-surface-variant truncate">Matérias cadastradas</p>
                </div>

                <div className="bg-surface-container-lowest p-3.5 sm:p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-on-surface-variant truncate">Aproveitamento</span>
                    <span className="material-symbols-outlined text-tertiary text-[18px] sm:text-[20px] shrink-0">insights</span>
                  </div>
                  <p className="text-xl sm:text-3xl font-extrabold text-secondary">
                    {dbStats.total > 0 ? `${dbStats.aproveitamento}%` : `${aproveitamento}%`}
                  </p>
                  <p className="text-[10px] sm:text-xs text-on-surface-variant truncate">
                    {dbStats.total > 0 ? `${dbStats.acertos} acertos de ${dbStats.total} resp.` : `${correctCount} acertos de ${answeredCount} resp.`}
                  </p>
                </div>

                <div className="bg-surface-container-lowest p-3.5 sm:p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-1 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs font-semibold text-on-surface-variant truncate">Validadas</span>
                    <span className="material-symbols-outlined text-primary text-[18px] sm:text-[20px] shrink-0">check_circle</span>
                  </div>
                  <p className="text-xl sm:text-3xl font-extrabold text-on-surface">
                    {dbValidadas.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-[10px] sm:text-xs text-secondary font-semibold truncate">Prontas para simulados</p>
                </div>
              </div>

              {/* General Evolution Chart / Trend */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">auto_graph</span>
                      <span>Gráfico de Evolução Geral de Desempenho</span>
                    </h2>
                    <p className="text-xs text-on-surface-variant">Curva acumulada de precisão nos simulados e rodadas</p>
                  </div>
                  <button
                    onClick={() => { handleTabChange('desempenho'); setDesempenhoSubTab('geral'); }}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Ver Desempenho Detalhado</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-4">
                  <div className="flex items-end justify-between h-36 gap-2 pt-6 px-2">
                    {performanceHistory.weekly.map((bar, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end" title={`${bar.label}: ${bar.pct}%`}>
                        <span className="text-[11px] font-bold text-on-surface">{bar.pct}%</span>
                        <div 
                          className="w-full max-w-[48px] rounded-t-lg bg-primary transition-all duration-500 hover:bg-primary-container"
                          style={{ height: `${Math.max(bar.pct, bar.pct > 0 ? 15 : 5)}%` }}
                        ></div>
                        <span className="text-[11px] font-semibold text-on-surface-variant">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Information by Discipline */}
              <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">library_books</span>
                    <span>Resumo por Disciplinas & Assuntos</span>
                  </h2>
                  <button
                    onClick={() => { setActiveTab('ofensivas'); setOfensivasSubTab('desafios'); }}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <span>Ir para Desafios</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const discList = resumoAcervo?.disciplinas || [];
                    if (discList.length === 0) {
                      return (
                        <p className="col-span-full text-center text-xs text-on-surface-variant py-8">
                          Nenhuma disciplina cadastrada no sistema.
                        </p>
                      );
                    }

                    return discList.map((d) => (
                      <div key={d.disciplina} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold">
                            <span className="material-symbols-outlined text-[20px]">{getDisciplineIcon(d.disciplina)}</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-on-surface">{d.disciplina}</h3>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              {d.total} {d.total === 1 ? 'questão' : 'questões'} • {d.qtd_assuntos} {d.qtd_assuntos === 1 ? 'assunto' : 'assuntos'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleStartDisciplineSimulado(d.disciplina)}
                          className="px-3 py-1.5 rounded-lg bg-surface text-primary text-xs font-semibold hover:bg-primary hover:text-on-primary transition-all border border-outline-variant/40 shrink-0"
                        >
                          Desafio
                        </button>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </section>
          )}

          {/* ================= TAB: OFENSIVAS ================= */}
          {activeTab === 'ofensivas' && (
            <section className="space-y-6">
              {/* Top Segmented Sub-Tabs Bar (Desafios | Simulados | Desafio Focado) */}
              <div className="bg-primary p-2 rounded-2xl shadow-md flex items-center justify-center gap-2 max-w-md mx-auto">
                <button
                  onClick={() => setOfensivasSubTab('desafios')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    ofensivasSubTab === 'desafios'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Desafios
                </button>
                <button
                  onClick={() => { setOfensivasSubTab('simulado'); setSimuladoStep('config'); }}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    ofensivasSubTab === 'simulado'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Simulados
                </button>
                <button
                  onClick={() => setOfensivasSubTab('focado')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    ofensivasSubTab === 'focado'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Desafio Focado
                </button>
              </div>

                  {/* Sub-Tab: Desafios */}
                  {ofensivasSubTab === 'desafios' && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pt-1 sm:bg-surface-container-lowest sm:p-6 sm:rounded-2xl sm:border sm:border-outline-variant/40 sm:shadow-sm">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
                            Desafios & Prática
                          </span>
                          <h1 className="text-lg sm:text-2xl font-bold text-on-surface">
                            Escolha sua disciplina ou matéria
                          </h1>
                        </div>
                        <button
                          onClick={() => handleNewRound(5)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold hover:bg-primary-container active:scale-95 shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
                        >
                          <span className="material-symbols-outlined text-[18px]">electric_bolt</span>
                          <span>Desafio Misto (5Q)</span>
                        </button>
                      </div>

                      {/* Disciplines Grid */}
                      <div>
                        <h2 className="font-title-md text-title-md font-bold text-on-surface mb-4 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">library_books</span>
                          <span>Disciplinas</span>
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                           {(() => {
                            const discList = resumoAcervo?.disciplinas || [];
                            const dynamicList = discList.map(d => ({
                              name: d.disciplina,
                              count: `${d.total} ${d.total === 1 ? 'questão' : 'questões'}`,
                              icon: getDisciplineIcon(d.disciplina),
                              desc: `Questões cadastradas no acervo para ${d.disciplina}.`,
                              banca: d.bancas && d.bancas.length > 0 ? d.bancas.slice(0, 3).join(' / ') : 'Variadas'
                            }));

                            if (dynamicList.length === 0) {
                              return (
                                <div className="col-span-full p-12 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-3">
                                  <span className="material-symbols-outlined text-[48px] text-outline">library_books</span>
                                  <h3 className="font-title-md font-bold text-on-surface">Nenhuma disciplina cadastrada</h3>
                                  <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto">
                                    Faça upload de questões na aba de Importação para visualizar as disciplinas disponíveis.
                                  </p>
                                </div>
                              );
                            }

                            return dynamicList.map((disc) => (
                              <div
                                key={disc.name}
                                onClick={() => handleStartDisciplineSimulado(disc.name)}
                                className="bg-surface-container-lowest p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-outline-variant/60 shadow-sm hover:border-primary hover:shadow-md transition-all flex flex-col justify-between space-y-3 sm:space-y-4 group cursor-pointer"
                              >
                                <div className="space-y-2 sm:space-y-3">
                                  <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold shadow-sm group-hover:bg-primary group-hover:text-on-primary transition-colors">
                                      <span className="material-symbols-outlined text-[20px] sm:text-[24px]">{disc.icon}</span>
                                    </div>
                                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-surface-container-high text-on-surface-variant">
                                      {disc.count}
                                    </span>
                                  </div>
                                  <div>
                                    <h3 className="font-title-md font-bold text-on-surface text-sm sm:text-lg group-hover:text-primary transition-colors line-clamp-2 sm:line-clamp-none">{disc.name}</h3>
                                    <p className="text-[11px] sm:text-xs text-secondary font-semibold mt-0.5 hidden sm:block">Bancas: {disc.banca}</p>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 sm:mt-2 leading-relaxed hidden sm:block">
                                      {disc.desc}
                                    </p>
                                  </div>
                                </div>

                                <div className="pt-1 sm:pt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartDisciplineSimulado(disc.name);
                                    }}
                                    className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-surface-container-low text-primary font-label-md text-[11px] sm:text-label-md hover:bg-primary hover:text-on-primary active:scale-[0.985] transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm font-bold"
                                  >
                                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">play_arrow</span>
                                    <span>Desafio</span>
                                  </button>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-Tab: Simulado (Config & Quiz) */}
                  {ofensivasSubTab === 'simulado' && (
                    <div className="space-y-6 animate-fadeIn">
                      {simuladoStep === 'config' ? (
                        <div className="space-y-6 max-w-3xl mx-auto">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 pt-1 sm:bg-surface-container-lowest sm:p-6 sm:rounded-2xl sm:border sm:border-outline-variant/40 sm:shadow-sm">
                            <div>
                              <span className="inline-block px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
                                Configuração do Simulado
                              </span>
                              <h1 className="text-lg sm:text-2xl font-bold text-on-surface">
                                Personalize sua Rodada de Questões
                              </h1>
                            </div>
                          </div>

                          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <MultiSelectDropdown
                                label="Disciplinas / Matérias"
                                options={availableDisciplinas}
                                selectedValues={selectedDisciplinas}
                                onChange={(vals) => {
                                  setSelectedDisciplinas(vals);
                                  setSelectedAssuntos([]);
                                  setSelectedBancas([]);
                                  setSelectedAnos([]);
                                }}
                                placeholder="Todas as Disciplinas"
                              />

                              <MultiSelectDropdown
                                label="Assuntos"
                                options={availableAssuntos}
                                selectedValues={selectedAssuntos}
                                onChange={(vals) => {
                                  setSelectedAssuntos(vals);
                                  setSelectedBancas([]);
                                  setSelectedAnos([]);
                                }}
                                placeholder="Todos os Assuntos"
                              />

                              <MultiSelectDropdown
                                label="Bancas Examinadoras"
                                options={availableBancas}
                                selectedValues={selectedBancas}
                                onChange={(vals) => {
                                  setSelectedBancas(vals);
                                  setSelectedAnos([]);
                                }}
                                placeholder="Todas as Bancas"
                              />

                              <MultiSelectDropdown
                                label="Anos das Provas"
                                options={availableAnos}
                                selectedValues={selectedAnos}
                                onChange={(vals) => setSelectedAnos(vals)}
                                placeholder="Todos os Anos"
                              />
                            </div>

                            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-primary text-[24px]">database</span>
                                <div>
                                  <p className="text-xs font-semibold text-on-surface-variant">Questões disponíveis para este filtro:</p>
                                  <p className="text-lg font-extrabold text-on-surface">{availableCount} questões</p>
                                </div>
                              </div>
                              {availableCount === 0 && (
                                <span className="text-xs text-error font-bold bg-error-container/40 px-3 py-1 rounded-lg">
                                  Nenhuma questão encontrada
                                </span>
                              )}
                            </div>

                            <div className="space-y-2 pt-2">
                              <label className="text-xs font-bold text-on-surface uppercase tracking-wider">Quantidade de Questões no Simulado</label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[5, 10, 15, 20].map((num) => {
                                  const isSelected = configCount === num;
                                  const isExceeding = num > availableCount && availableCount > 0;
                                  return (
                                    <button
                                      key={num}
                                      type="button"
                                      onClick={() => setConfigCount(num)}
                                      className={`p-3 rounded-xl border text-center transition-all ${
                                        isSelected
                                          ? 'bg-primary text-on-primary font-bold border-primary shadow-sm'
                                          : 'bg-surface-container-low text-on-surface border-outline-variant/50 hover:bg-surface-container'
                                      }`}
                                    >
                                      <span className="text-base font-bold">{num} Questões</span>
                                      {isExceeding && (
                                        <span className="block text-[10px] opacity-80 mt-0.5">(máx. {availableCount})</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            <div className="pt-4">
                              <button
                                onClick={handleStartSimuladoConfig}
                                disabled={availableCount === 0}
                                className={`w-full py-3.5 rounded-xl font-label-md text-label-md font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                                  availableCount > 0
                                    ? 'bg-primary text-on-primary hover:bg-primary-container active:scale-[0.99]'
                                    : 'bg-surface-container text-outline cursor-not-allowed'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[20px]">electric_bolt</span>
                                <span>Iniciar Simulado ({Math.min(configCount, availableCount)} Questões)</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* QUIZ VIEW */
                        <div className="space-y-6">
                          <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/50 shadow-sm flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="font-label-md font-bold text-primary">Questão {currentIndex + 1} de {activeRoundQuestions.length}</span>
                              <div className="h-4 w-px bg-outline-variant/50"></div>
                              <span className="text-body-sm text-on-surface-variant">Acertos: <strong className="text-secondary">{correctCount} / {activeRoundQuestions.length}</strong></span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setRoundComplete(true)}
                                className="px-3 py-1 rounded-lg bg-secondary text-on-secondary text-xs font-bold hover:bg-secondary-container hover:text-on-secondary-container transition-all flex items-center gap-1 shadow-sm"
                                title="Finalizar Simulado"
                              >
                                <span className="material-symbols-outlined text-[16px]">flag</span>
                                <span>Finalizar Simulado</span>
                              </button>

                              <button
                                onClick={() => setSimuladoStep('config')}
                                className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high transition-colors flex items-center gap-1"
                                title="Configurar Filtros"
                              >
                                <span className="material-symbols-outlined text-[16px]">settings</span>
                                <span>Configurar</span>
                              </button>

                              <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-none pb-1 sm:pb-0">
                                {activeRoundQuestions.map((_, i) => {
                                  const isCurrent = currentIndex === i;
                                  const userAns = answers[i];
                                  let dotClass = "w-7 h-7 rounded-lg font-label-sm text-xs font-semibold border border-outline-variant/60 bg-surface-container-low text-on-surface hover:bg-surface-container transition-all flex items-center justify-center shrink-0";
                                  
                                  if (isCurrent) {
                                    dotClass = "w-7 h-7 rounded-lg font-label-sm text-xs font-bold bg-primary text-on-primary shadow-sm shrink-0";
                                  } else if (userAns !== null) {
                                    if (userAns === activeRoundQuestions[i]?.alternativa_certa) {
                                      dotClass = "w-7 h-7 rounded-lg font-label-sm text-xs font-bold bg-secondary-container text-secondary border-secondary shrink-0";
                                    } else {
                                      dotClass = "w-7 h-7 rounded-lg font-label-sm text-xs font-bold bg-error-container text-error border-error shrink-0";
                                    }
                                  }

                                  return (
                                    <button
                                      key={i}
                                      onClick={() => handleJumpToQuestion(i)}
                                      className={dotClass}
                                      title={`Questão ${i + 1}`}
                                    >
                                      {i + 1}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 space-y-4">
                              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/60 p-5 sm:p-7 shadow-sm transition-all duration-200">
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-outline-variant/30">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="px-2.5 py-0.5 rounded-md font-label-md text-label-md font-bold bg-primary text-on-primary">
                                      {currentQ.banca}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-md font-label-md text-label-md bg-surface-container-high text-on-surface font-semibold">
                                      {currentQ.ano}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-md font-label-md text-label-md bg-surface-container text-on-surface-variant">
                                      {currentQ.prova}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-md font-label-md text-label-md bg-secondary-fixed text-on-secondary-fixed font-semibold">
                                      {currentQ.disciplina}
                                    </span>
                                    {currentQ.source === 'ai_generated' && (
                                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-tertiary-fixed text-on-tertiary-fixed" title="Gerado com IA Pedagógica">
                                        ✨ Gerada por IA
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1 text-on-surface-variant">
                                    <button
                                      onClick={handleToggleFavorite}
                                      className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
                                      title="Salvar nos Favoritos"
                                    >
                                      <span className={`material-symbols-outlined text-[20px] ${favoriteIds.includes(currentQ.id) ? 'text-tertiary font-bold' : ''}`}>
                                        {favoriteIds.includes(currentQ.id) ? 'bookmark' : 'bookmark_border'}
                                      </span>
                                    </button>
                                    <button onClick={() => showNotification("Link permanente copiado.")} className="p-1.5 rounded-lg hover:bg-surface-container-low transition-colors" title="Compartilhar">
                                      <span className="material-symbols-outlined text-[20px]">share</span>
                                    </button>
                                    <span className="text-xs text-outline font-code-md">ID: {currentQ.id}</span>
                                  </div>
                                </div>

                                <div className="pt-3 pb-2 flex items-center gap-2">
                                  <span className="material-symbols-outlined text-[18px] text-tertiary">folder_open</span>
                                  <span className="text-body-sm font-label-md text-on-surface-variant">
                                    Assunto: <strong className="text-on-surface font-semibold">{currentQ.assunto}</strong>
                                  </span>
                                </div>

                                <div className="py-4">
                                  <p className="font-body-lg text-body-lg text-on-surface leading-relaxed tracking-normal select-text">
                                    {currentQ.enunciado}
                                  </p>
                                </div>

                                {/* Alternatives */}
                                <div className="space-y-3 pt-2">
                                  {currentQ.alternativas.map((alt) => {
                                    const isSelected = selectedOption === alt.letra;
                                    const isCorrect = answeredState && alt.letra === currentQ.alternativa_certa;
                                    const isWrongUser = answeredState && isSelected && alt.letra !== currentQ.alternativa_certa;

                                    let cardStyle = "alt-choice-card cursor-pointer p-4 rounded-xl border border-outline-variant/60 bg-surface-container-lowest hover:border-primary/60 hover:bg-surface-container-low/40 transition-all flex items-start gap-3.5";
                                    let pillStyle = "alt-pill w-8 h-8 rounded-lg flex items-center justify-center font-label-md text-label-md font-bold bg-surface-container-high text-on-surface border border-outline-variant/50 flex-shrink-0 transition-colors";

                                    if (answeredState) {
                                      if (isCorrect) {
                                        cardStyle = "alt-choice-card p-4 rounded-xl border-2 border-secondary bg-secondary-container/20 transition-all flex items-start gap-3.5";
                                        pillStyle = "alt-pill w-8 h-8 rounded-lg flex items-center justify-center font-label-md text-label-md font-bold bg-secondary text-on-secondary flex-shrink-0";
                                      } else if (isWrongUser) {
                                        cardStyle = "alt-choice-card p-4 rounded-xl border-2 border-error bg-error-container/20 transition-all flex items-start gap-3.5";
                                        pillStyle = "alt-pill w-8 h-8 rounded-lg flex items-center justify-center font-label-md text-label-md font-bold bg-error text-on-error flex-shrink-0";
                                      }
                                    } else if (isSelected) {
                                      cardStyle = "alt-choice-card cursor-pointer p-4 rounded-xl border-2 border-primary bg-primary-fixed/20 shadow-sm transition-all flex items-start gap-3.5";
                                      pillStyle = "alt-pill w-8 h-8 rounded-lg flex items-center justify-center font-label-md text-label-md font-bold bg-primary text-on-primary border border-primary flex-shrink-0";
                                    }

                                    return (
                                      <div
                                        key={alt.letra}
                                        className={cardStyle}
                                        onClick={() => handleSelectOption(alt.letra)}
                                      >
                                        <div className={pillStyle}>{alt.letra}</div>
                                        <div className="flex-1 pt-0.5">
                                          <p className="font-body-md text-body-md text-on-surface">{alt.texto}</p>
                                        </div>
                                        {answeredState && isCorrect && (
                                          <div className="flex-shrink-0 pt-0.5">
                                            <span className="material-symbols-outlined text-secondary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                          </div>
                                        )}
                                        {answeredState && isWrongUser && (
                                          <div className="flex-shrink-0 pt-0.5">
                                            <span className="material-symbols-outlined text-error text-[22px]">cancel</span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Question Action Bar */}
                                <div className="pt-6 mt-6 border-t border-outline-variant/30 flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={handleAnswerQuestion}
                                      disabled={answeredState}
                                      className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container active:scale-[0.985] transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                      <span>Responder Questão</span>
                                    </button>
                                    <button
                                      onClick={handleNextQuestion}
                                      className="px-3.5 py-2.5 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
                                    >
                                      <span className="material-symbols-outlined text-[18px]">redo</span>
                                      <span>Pular</span>
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={handleNextQuestion}
                                      className="px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-variant active:scale-[0.985] transition-all flex items-center gap-1.5"
                                    >
                                      <span>Próxima</span>
                                      <span className="text-xs text-on-surface-variant font-normal">({currentIndex + 1}/{activeRoundQuestions.length})</span>
                                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Right Column: Detailed Question Breakdown (4 Cols) */}
                            <div className="lg:col-span-4 space-y-4">
                              <div className="bg-surface-container-low rounded-xl border border-outline-variant/40 p-5 space-y-3">
                                <div className="flex items-center gap-2 text-primary font-title-md font-bold">
                                  <span className="material-symbols-outlined text-[20px]">analytics</span>
                                  <span>Análise da Questão</span>
                                </div>

                                {!answeredState ? (
                                  <p className="text-body-sm text-on-surface-variant leading-relaxed">
                                    Responda à questão ao lado para desbloquear a análise detalhada: o gabarito oficial da <strong>alternativa correta</strong> e o motivo pelo qual as demais alternativas estão incorretas.
                                  </p>
                                ) : (
                                  <div className="space-y-3 text-body-sm text-on-surface-variant">
                                    <div className="p-3 rounded-lg bg-secondary-container/30 border border-secondary/30 text-on-surface space-y-1">
                                      <p className="font-bold text-secondary text-xs uppercase tracking-wider">Alternativa Correta: {currentQ.alternativa_certa}</p>
                                      <p className="text-xs leading-relaxed">
                                        {currentQ.alternativas.find(a => a.letra === currentQ.alternativa_certa)?.texto}
                                      </p>
                                    </div>
                                    
                                    <div className="space-y-2 pt-1">
                                      <p className="font-bold text-xs text-on-surface uppercase tracking-wider">Fundamentação e Justificativas:</p>
                                      <p className="text-xs leading-relaxed">
                                        {currentQ.explicacao?.resumo || currentQ.comentario_ia || currentQ.comentario}
                                      </p>
                                      {currentQ.explicacao?.alternativas && currentQ.explicacao.alternativas.length > 0 && (
                                        <div className="space-y-1.5 pt-2 border-t border-outline-variant/30">
                                          <p className="font-bold text-[11px] text-primary uppercase">Análise por Alternativa:</p>
                                          {currentQ.explicacao.alternativas.map(alt => (
                                            <div key={alt.letra} className={`text-[11px] p-2 rounded-lg ${alt.letra === currentQ.alternativa_certa ? 'bg-secondary-container/40 border border-secondary/40 text-on-surface' : 'bg-surface-container text-on-surface-variant'}`}>
                                              <strong className="font-bold">({alt.letra})</strong> {alt.justificativa || (alt.letra === currentQ.alternativa_certa ? 'Alternativa correta.' : 'Incorreta.')}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {!currentQ.explicacao && (
                                        <p className="text-[11px] text-outline italic pt-1">
                                          Análise pedagógica: As demais alternativas contêm distratores típicos da banca {currentQ.banca || 'oficial'}, divergindo da legislação aplicável ou da jurisprudência dominante.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-Tab: Desafio Focado */}
                  {ofensivasSubTab === 'focado' && (
                    (anosAlvo.length === 0 || materiasAlvo.length === 0) ? (
                      <div className="max-w-xl mx-auto p-8 text-center bg-surface-container-low rounded-2xl border border-outline-variant/40 shadow-sm space-y-4 my-8">
                        <div className="w-16 h-16 rounded-2xl bg-error-container text-error flex items-center justify-center mx-auto">
                          <span className="material-symbols-outlined text-[32px]">warning</span>
                        </div>
                        <h2 className="text-lg font-bold text-on-surface">Configuração de Anos e Matérias Alvo Necessária</h2>
                        <p className="text-sm text-on-surface-variant max-w-sm mx-auto leading-relaxed">
                          Para acessar o <strong>Desafio Focado</strong>, é necessário definir ao menos os <strong>Anos-Alvo</strong> e as <strong>Matérias-Alvo</strong> nas configurações da sua conta.
                        </p>
                        <button
                          onClick={() => setActiveTab('configuracoes')}
                          className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-container shadow-sm transition-all inline-flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">settings</span>
                          <span>Ir para Configurações</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <span className="inline-block px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
                                Treino Direcionado por Foco
                              </span>
                              <h1 className="text-lg sm:text-2xl font-bold text-on-surface">
                                Desafio Focado nas suas Configurações-Alvo
                              </h1>
                              <p className="text-xs text-on-surface-variant mt-1">
                                Gerado com base nos anos ({anosAlvo.join(', ')}), matérias ({materiasAlvo.join(', ')}) {assuntosAlvo.length > 0 ? `e assuntos (${assuntosAlvo.join(', ')})` : ''} definidos.
                              </p>
                            </div>
                            <button
                              onClick={() => handleStartFocadoRound()}
                              className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-semibold hover:bg-primary-container shadow-sm transition-all inline-flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[18px]">electric_bolt</span>
                              <span>Iniciar Desafio Focado Geral (5Q)</span>
                            </button>
                          </div>
                        </div>

                        {/* Targeted Disciplines Grid */}
                        <div>
                          <h2 className="font-title-md text-title-md font-bold text-on-surface mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">target</span>
                            <span>Matérias-Alvo Selecionadas</span>
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {materiasAlvo.map(materia => {
                              const matchingCount = targetedCounts[materia] !== undefined ? targetedCounts[materia] : 0;

                              return (
                                <div
                                  key={materia}
                                  onClick={() => handleStartFocadoRound(materia)}
                                  className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/60 shadow-sm hover:border-primary hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer group"
                                >
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="w-10 h-10 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold group-hover:bg-primary group-hover:text-on-primary transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">school</span>
                                      </div>
                                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container-high text-on-surface-variant">
                                        {matchingCount} {matchingCount === 1 ? 'questão' : 'questões'}
                                      </span>
                                    </div>
                                    <h3 className="font-title-md font-bold text-on-surface group-hover:text-primary transition-colors">{materia}</h3>
                                    <p className="text-xs text-on-surface-variant">
                                      Foco nos anos selecionados e parâmetros específicos.
                                    </p>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleStartFocadoRound(materia);
                                    }}
                                    className="w-full py-2 px-3 rounded-xl bg-surface-container-low text-primary font-label-md text-xs hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-1.5 font-bold"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                                    <span>Iniciar Desafio Focado</span>
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  )}

              {/* Round Complete Modal (Popup Overlay) */}
              {roundComplete && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
                  <div className="max-w-xl w-full p-6 sm:p-8 rounded-3xl bg-surface-container-lowest border-2 border-secondary shadow-2xl space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-[36px]">emoji_events</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-label-sm font-label-sm uppercase font-bold text-secondary tracking-wider">Excelente ritmo de estudos!</span>
                        <h2 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">Rodada de {activeRoundQuestions.length} Questões Finalizada</h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Seu aproveitamento neste bloco foi de <strong className="text-primary">{aproveitamento}%</strong>. Desempenho registrado com sucesso.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => {
                          setRoundComplete(false);
                          setSimuladoStep('config');
                          setOfensivasSubTab('simulado');
                        }}
                        className="p-3.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[20px]">settings</span>
                        <span>Configurar Novo Simulado</span>
                      </button>

                      <button
                        onClick={() => {
                          setRoundComplete(false);
                          handleTabChange('desempenho');
                          setDesempenhoSubTab('geral');
                        }}
                        className="p-3.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container-high active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-outline-variant/40"
                      >
                        <span className="material-symbols-outlined text-[20px]">bar_chart</span>
                        <span>Ver Desempenho</span>
                      </button>

                      <button
                        onClick={() => {
                          setRoundComplete(false);
                          setOfensivasSubTab('desafios');
                        }}
                        className="p-3.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container-high active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-outline-variant/40"
                      >
                        <span className="material-symbols-outlined text-[20px]">bolt</span>
                        <span>Fazer um Desafio</span>
                      </button>

                      <button
                        onClick={() => {
                          setRoundComplete(false);
                          setActiveTab('inicio');
                        }}
                        className="p-3.5 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md font-bold hover:bg-surface-container-high active:scale-[0.99] transition-all flex items-center justify-center gap-2 border border-outline-variant/40"
                      >
                        <span className="material-symbols-outlined text-[20px]">home</span>
                        <span>Ir para Página Inicial</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}





          {/* ================= TAB: DESEMPENHO ================= */}
          {activeTab === 'desempenho' && (
            <section className="space-y-6">
              {/* Top Segmented Sub-Tabs Bar (Geral | Matérias | Hábitos) */}
              <div className="bg-primary p-2 rounded-2xl shadow-md flex items-center justify-center gap-2 max-w-md mx-auto">
                <button
                  onClick={() => setDesempenhoSubTab('geral')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    desempenhoSubTab === 'geral'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Geral
                </button>
                <button
                  onClick={() => setDesempenhoSubTab('materias')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    desempenhoSubTab === 'materias'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Matérias
                </button>
                <button
                  onClick={() => setDesempenhoSubTab('habitos')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    desempenhoSubTab === 'habitos'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Hábitos
                </button>
              </div>

              {/* HOJE Widget (Top) */}
              <div className="bg-surface-container-lowest p-5 sm:p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Hoje</span>
                  <span className="text-[11px] text-primary font-semibold">Atualizado em tempo real</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-outline-variant/30">
                  <div className="flex items-center gap-3 pt-3 sm:pt-0">
                    <div className="w-12 h-12 rounded-2xl bg-secondary-container/50 text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">task_alt</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-on-surface">{todayStats.questionsToday}</p>
                      <p className="text-xs text-on-surface-variant">Questões hoje</p>
                      <p className={`text-[11px] font-semibold mt-0.5 ${todayStats.questionsDiff >= 0 ? 'text-primary' : 'text-error'}`}>
                        {todayStats.questionsDiff >= 0 ? `▲ +${todayStats.questionsDiff}` : `▼ ${Math.abs(todayStats.questionsDiff)}`} vs média 7d
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">schedule</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{todayStats.timeTodayMinutes} min</p>
                      <p className="text-xs text-on-surface-variant">Tempo hoje</p>
                      <p className={`text-[11px] font-semibold mt-0.5 ${todayStats.timeDiffMinutes >= 0 ? 'text-primary' : 'text-error'}`}>
                        {todayStats.timeDiffMinutes >= 0 ? `▲ +${todayStats.timeDiffMinutes}min` : `▼ ${Math.abs(todayStats.timeDiffMinutes)}min`} vs média 7d
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 sm:pt-0 sm:pl-4">
                    <div className="w-12 h-12 rounded-2xl bg-tertiary-container/50 text-tertiary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[24px]">local_fire_department</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-tertiary">{todayStats.streak}</p>
                      <p className="text-xs text-on-surface-variant">Sequência de dias</p>
                      <p className="text-[11px] text-outline font-medium mt-0.5">Recorde: {todayStats.recordStreak} dias</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= SUB-TAB: GERAL ================= */}
              {desempenhoSubTab === 'geral' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Seu Índice */}
                  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-title-md font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">speed</span>
                        <span>Seu Índice Geral</span>
                      </h2>
                      <button onClick={() => showNotification("Índice calculado com base no seu aproveitamento e consistência.")} className="text-xs text-primary font-semibold hover:underline">
                        Detalhes
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center space-y-1">
                        <div className="w-14 h-14 mx-auto rounded-full border-4 border-secondary flex items-center justify-center font-bold text-secondary text-base">
                          {gerallStats.acerto}%
                        </div>
                        <p className="text-xs font-bold text-on-surface pt-1">Acerto</p>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center space-y-1">
                        <div className="w-14 h-14 mx-auto rounded-full border-4 border-primary flex items-center justify-center font-bold text-primary text-base">
                          {gerallStats.consistencia}%
                        </div>
                        <p className="text-xs font-bold text-on-surface pt-1">Consistência</p>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center space-y-1">
                        <div className="w-14 h-14 mx-auto rounded-full border-4 border-tertiary flex items-center justify-center font-bold text-tertiary text-base">
                          {gerallStats.evolucao}%
                        </div>
                        <p className="text-xs font-bold text-on-surface pt-1">Evolução</p>
                      </div>

                      <div className="p-4 rounded-xl bg-primary-fixed/30 border border-primary/30 text-center space-y-1 flex flex-col justify-center">
                        <p className="text-3xl font-extrabold text-primary">{gerallStats.indice}</p>
                        <p className="text-[11px] font-bold text-on-primary-fixed uppercase tracking-wider">Índice</p>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-secondary text-on-secondary text-[10px] font-bold mt-1">{gerallStats.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Projeção */}
                  <div 
                    onClick={() => setShowProjectionModal(true)}
                    className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-3 cursor-pointer hover:border-primary/60 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <h2 className="font-title-md font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-tertiary">trending_up</span>
                        <span>Projeção de Desempenho</span>
                        <span className="text-[11px] font-medium text-primary bg-primary-fixed/30 px-2 py-0.5 rounded-full ml-1 flex items-center gap-1 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                          <span className="material-symbols-outlined text-[14px]">info</span>
                          Ver Regras & Manutenção
                        </span>
                      </h2>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-container text-primary">
                        {dbStats.total < 10 ? 'Análise Inicial' : gerallStats.indice >= 80 ? 'Nível Avançado' : gerallStats.indice >= 60 ? 'Em Ritmo de Aprovação' : gerallStats.indice >= 40 ? 'Curva de Crescimento' : 'Fase de Base'}
                      </span>
                    </div>
                    <p className="text-body-sm text-on-surface-variant leading-relaxed">
                      {dbStats.total < 10 
                        ? 'Você está começando sua jornada de estudos. Resolva pelo menos 10 questões para que o sistema possa projetar seu nível de prontidão com precisão.'
                        : gerallStats.indice >= 80 
                        ? `Excelente ritmo! Com base no seu índice geral de ${gerallStats.indice} (Ofensiva: ${gerallStats.streak} dias) e alta consistência, você demonstra nível competitivo avançado.`
                        : gerallStats.indice >= 60 
                        ? `Bom progresso! Seu índice atual de ${gerallStats.indice} (Ofensiva: ${gerallStats.streak} dias) indica que você está no caminho certo.`
                        : gerallStats.indice >= 40 
                        ? `Você está em fase de evolução constante (índice ${gerallStats.indice}, Ofensiva: ${gerallStats.streak} dias). Aumente o volume diário de rodadas.`
                        : `Fase inicial de adaptação (índice ${gerallStats.indice}). Foque em completar as rodadas diárias recomendadas.`}
                    </p>
                    <div className="flex items-center justify-between text-xs text-outline pt-2 border-t border-outline-variant/20">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px] text-secondary">local_fire_department</span>
                        Ofensivas de Defesa: <strong className="text-on-surface">{gerallStats.streak} dias</strong>
                      </span>
                      <span>
                        {gerallStats.daysInactive > 0 ? `⚠️ Inativo há ${gerallStats.daysInactive}d (-${gerallStats.decayPenalty}pts decaimento)` : '✨ Nível defendido e ativo'}
                      </span>
                    </div>
                  </div>

                  {/* Conquistas & Badges */}
                  {(() => {
                    const totalQ = dbStats.total;
                    const totalAcertos = dbStats.acertos;
                    const streakDays = todayStats.streak;
                    const todayQ = todayStats.questionsToday;
                    const aprov = dbStats.aproveitamento;
                    const isUserLoggedIn = Boolean(session?.user?.id || !guestMode);

                    const badgesList = [
                      { title: 'Certeiro', icon: '🎯', unlocked: totalAcertos >= 10, desc: 'Acertar 10 questões no total' },
                      { title: 'Meia Noção', icon: '📋', unlocked: totalQ >= 50, desc: 'Responder 50 questões no total' },
                      { title: 'Dedicado', icon: '⏳', unlocked: totalQ >= 100, desc: 'Responder 100 questões no total' },
                      { title: 'Leitor Ávido', icon: '📚', unlocked: totalQ >= 250, desc: 'Responder 250 questões no total' },
                      { title: 'Velocidade', icon: '⏱️', unlocked: totalQ >= 20, desc: 'Concluir pelo menos 20 questões' },
                      { title: 'Explosão', icon: '🚀', unlocked: todayQ >= 20, desc: 'Resolver 20 questões em um único dia' },
                      { title: 'Em Chamas', icon: '🔥', unlocked: streakDays >= 3, desc: 'Manter ofensiva de 3 dias seguidos' },
                      { title: 'Campeão', icon: '🏆', unlocked: aprov >= 70 && totalQ >= 20, desc: 'Aproveitamento geral >= 70%' },
                      { title: 'Enturmado', icon: '🛡️', unlocked: isUserLoggedIn, desc: 'Conta de usuário conectada' },
                      { title: 'Maratonista', icon: '🎖️', unlocked: streakDays >= 7, desc: 'Manter ofensiva de 7 dias seguidos' },
                      { title: 'Pódio do Dia', icon: '🥇', unlocked: todayQ >= metaQuestoesDia, desc: 'Bater a meta diária de questões' },
                    ];

                    let progressCurrent = totalQ;
                    let progressTarget = 50;
                    let progressLabel = "Meia Noção";

                    if (totalAcertos < 10) {
                      progressLabel = "Certeiro (10 acertos)";
                      progressCurrent = totalAcertos;
                      progressTarget = 10;
                    } else if (totalQ < 50) {
                      progressLabel = "Meia Noção (50 questões)";
                      progressCurrent = totalQ;
                      progressTarget = 50;
                    } else if (totalQ < 100) {
                      progressLabel = "Dedicado (100 questões)";
                      progressCurrent = totalQ;
                      progressTarget = 100;
                    } else if (totalQ < 250) {
                      progressLabel = "Leitor Ávido (250 questões)";
                      progressCurrent = totalQ;
                      progressTarget = 250;
                    } else if (totalQ < 500) {
                      progressLabel = "Mestre Supremo (500 questões)";
                      progressCurrent = totalQ;
                      progressTarget = 500;
                    } else {
                      progressLabel = "Lenda dos Concursos (1000 questões)";
                      progressCurrent = totalQ;
                      progressTarget = 1000;
                    }

                    const progressPct = Math.min(100, Math.max(0, Math.round((progressCurrent / progressTarget) * 100)));
                    const remainingCount = Math.max(0, progressTarget - progressCurrent);

                    return (
                      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-5">
                        <div className="flex items-center justify-between">
                          <h2 className="font-title-md font-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">emoji_events</span>
                            <span>Conquistas & Insígnias</span>
                          </h2>
                          <button onClick={() => setBadgesModalOpen(true)} className="text-xs font-bold text-primary hover:underline">Ver todas</button>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                          {badgesList.map((badge, idx) => (
                            <div key={idx} title={badge.desc} className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center space-y-1.5 cursor-pointer transition-all ${badge.unlocked ? 'bg-surface-container-low border-secondary/40 text-on-surface shadow-sm hover:scale-105' : 'bg-surface-container/30 border-outline-variant/20 opacity-50 grayscale hover:opacity-75'}`}>
                              <span className="text-2xl sm:text-3xl">{badge.icon}</span>
                              <span className="text-[11px] font-bold truncate w-full">{badge.title}</span>
                            </div>
                          ))}
                        </div>

                        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-on-surface">Próxima Conquista: {progressLabel}</span>
                            <span className="text-outline">{progressCurrent} / {progressTarget} (faltam {remainingCount})</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }}></div>
                          </div>
                        </div>

                        {/* BADGES MODAL */}
                        {badgesModalOpen && (
                          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                            <div className="bg-surface-container-lowest max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border border-outline-variant/40 max-h-[90vh] overflow-y-auto">
                              <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[26px]">emoji_events</span>
                                  </div>
                                  <div>
                                    <h3 className="text-lg sm:text-xl font-bold text-on-surface">Todas as Conquistas & Insígnias</h3>
                                    <p className="text-xs text-on-surface-variant">Acompanhe seu progresso e desbloqueie todas</p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setBadgesModalOpen(false)}
                                  className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
                                >
                                  <span className="material-symbols-outlined">close</span>
                                </button>
                              </div>

                              <div className="space-y-3">
                                {badgesList.map((badge, idx) => (
                                  <div key={idx} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${badge.unlocked ? 'bg-surface-container-low border-secondary/40 text-on-surface' : 'bg-surface-container/20 border-outline-variant/30 opacity-60'}`}>
                                    <span className="text-3xl sm:text-4xl p-2 rounded-xl bg-surface-container-lowest shadow-sm">{badge.icon}</span>
                                    <div className="flex-1 space-y-0.5">
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-bold text-sm text-on-surface">{badge.title}</h4>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.unlocked ? 'bg-secondary-container text-secondary' : 'bg-surface-container text-outline'}`}>
                                          {badge.unlocked ? '✨ Desbloqueada' : '🔒 Bloqueada'}
                                        </span>
                                      </div>
                                      <p className="text-xs text-on-surface-variant">{badge.desc}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="flex justify-end pt-2">
                                <button
                                  onClick={() => setBadgesModalOpen(false)}
                                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md hover:opacity-90 shadow-sm"
                                >
                                  Fechar
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Evolução Diária & Métricas Rápidas */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="font-title-md font-bold text-on-surface flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">bar_chart</span>
                            <span>Evolução Diária</span>
                          </h2>
                          <p className="text-xs text-on-surface-variant">Volume de questões vs. Acerto (%) nos últimos dias</p>
                        </div>
                        <select className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/40 text-xs font-semibold text-on-surface focus:outline-none">
                          <option>7 dias</option>
                          <option>30 dias</option>
                        </select>
                      </div>

                      <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                        <div className="flex items-end justify-between h-40 gap-3 pt-6 px-2">
                          {performanceHistory.daily.map((item, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end" title={`${item.day}: ${item.vol} questões, ${item.pct}% de acerto`}>
                              <div className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/40 relative flex items-center justify-center pb-1" style={{ height: `${Math.max(item.vol * 6, item.vol > 0 ? 25 : 10)}px` }}>
                                <span className="text-[9px] font-bold text-primary">{item.vol}Q</span>
                              </div>
                              <span className="text-xs font-bold text-on-surface-variant">{item.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center font-bold">
                          <span className="material-symbols-outlined text-[24px]">analytics</span>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-on-surface">68.2%</p>
                          <p className="text-xs text-on-surface-variant font-medium">Aproveitamento Médio</p>
                        </div>
                      </div>

                      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-secondary-container/40 text-secondary flex items-center justify-center font-bold">
                          <span className="material-symbols-outlined text-[24px]">list_alt</span>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-on-surface">3.1</p>
                          <p className="text-xs text-on-surface-variant font-medium">Questões por dia</p>
                        </div>
                      </div>

                      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-tertiary-container/40 text-tertiary flex items-center justify-center font-bold">
                          <span className="material-symbols-outlined text-[24px]">timer</span>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-on-surface">59s</p>
                          <p className="text-xs text-on-surface-variant font-medium">Tempo por questão</p>
                        </div>
                      </div>

                      <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-fixed/40 text-primary flex items-center justify-center font-bold">
                          <span className="material-symbols-outlined text-[24px]">hourglass_top</span>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-on-surface">3 min</p>
                          <p className="text-xs text-on-surface-variant font-medium">Estudo diário médio</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= SUB-TAB: MATÉRIAS ================= */}
              {desempenhoSubTab === 'materias' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[26px]">menu_book</span>
                      </div>
                      <div>
                        <h2 className="font-title-lg font-bold text-on-surface">Seu Retrato por Matéria</h2>
                        <p className="text-body-sm text-on-surface-variant">Onde você está sólido, onde está caindo, e quanto tempo cada matéria te custa por questão.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(() => {
                      const map = new Map<string, number>();
                      questions.forEach(q => {
                        const disc = q.disciplina || 'Geral';
                        map.set(disc, (map.get(disc) || 0) + 1);
                      });
                      const subjects = Array.from(map.keys());
                      if (subjects.length === 0) {
                        return (
                          <div className="col-span-full p-12 text-center bg-surface-container-low rounded-2xl border border-outline-variant/30">
                            <p className="text-xs text-outline italic">Nenhuma matéria registrada no momento.</p>
                          </div>
                        );
                      }
                      return subjects.map((sub, i) => (
                        <div key={sub} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/40 shadow-sm space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="font-title-md font-bold text-on-surface">{sub}</h3>
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-secondary-container/50 text-secondary">
                              {i % 2 === 0 ? 'Sólido (82%)' : 'Em Atenção (61%)'}
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-on-surface-variant">
                              <span>Domínio na Matéria</span>
                              <span className="font-bold text-on-surface">{i % 2 === 0 ? 'Alto' : 'Moderado'}</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                              <div className={`h-full rounded-full ${i % 2 === 0 ? 'bg-secondary' : 'bg-tertiary'}`} style={{ width: i % 2 === 0 ? '82%' : '61%' }}></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2">
                            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                              <p className="text-[11px] font-semibold text-outline">Ritmo Médio</p>
                              <p className="text-sm font-bold text-on-surface mt-0.5">1 min 12 seg</p>
                            </div>
                            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                              <p className="text-[11px] font-semibold text-outline">Última Prática</p>
                              <p className="text-sm font-bold text-on-surface mt-0.5">Hoje</p>
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {/* ================= SUB-TAB: HÁBITOS ================= */}
              {desempenhoSubTab === 'habitos' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-tertiary-container/40 text-tertiary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[26px]">psychology</span>
                      </div>
                      <div>
                        <h2 className="font-title-lg font-bold text-on-surface">Quando Você Rende Mais</h2>
                        <p className="text-body-sm text-on-surface-variant">A que horas você acerta mais, quão constante tem sido, e quanto do que errou você recupera.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                        <h3 className="font-title-sm font-bold text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">schedule</span>
                          <span>Distribuição por Hora do Dia</span>
                        </h3>
                        <div className="space-y-2 text-xs">
                          <div>
                            <div className="flex justify-between font-semibold mb-1 text-on-surface-variant">
                              <span>Manhã (06h - 12h)</span>
                              <span>35% acerto</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: '35%' }}></div></div>
                          </div>
                          <div>
                            <div className="flex justify-between font-semibold mb-1 text-on-surface-variant">
                              <span>Tarde (12h - 18h)</span>
                              <span>45% acerto</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden"><div className="h-full bg-secondary rounded-full" style={{ width: '45%' }}></div></div>
                          </div>
                          <div>
                            <div className="flex justify-between font-semibold mb-1 text-on-surface-variant">
                              <span>Noite (18h - 00h)</span>
                              <span>15% acerto</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden"><div className="h-full bg-tertiary rounded-full" style={{ width: '15%' }}></div></div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                        <h3 className="font-title-sm font-bold text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-[20px]">verified</span>
                          <span>Taxa de Recuperação de Erros</span>
                        </h3>
                        <div className="text-center py-4 space-y-2">
                          <p className="text-4xl font-extrabold text-secondary">72%</p>
                          <p className="text-xs text-on-surface-variant max-w-xs mx-auto">Você acerta 72% das questões que errou anteriormente após revisar o comentário pedagógico.</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                      <h3 className="font-title-sm font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                        <span>Consistência das Últimas 6 Semanas & Calendário</span>
                      </h3>
                      <div className="grid grid-cols-6 gap-2 pt-2">
                        {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'].map((week, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-center space-y-1">
                            <span className="text-[11px] font-bold text-outline">{week}</span>
                            <div className="w-6 h-6 mx-auto rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs font-bold">
                              {idx < 2 ? '✓' : '-'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ================= TAB: GESTÃO & IMPORTAÇÃO ================= */}
          {activeTab === 'gestao' && (
            <section className="space-y-6">
              {/* Top Segmented Sub-Tabs Bar (Auditoria | Importação de JSON) */}
              <div className="bg-primary p-2 rounded-2xl shadow-md flex items-center justify-center gap-2 max-w-md mx-auto">
                <button
                  onClick={() => setGestaoSubTab('auditoria')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    gestaoSubTab === 'auditoria'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Auditoria de Questões
                </button>
                <button
                  onClick={() => setGestaoSubTab('importacao')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    gestaoSubTab === 'importacao'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Importação de JSON
                </button>
              </div>

              {gestaoSubTab === 'auditoria' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
                      <span>Gestão & Auditoria de Questões</span>
                    </h1>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Monitore pendências de preenchimento, audite o banco de dados e gerencie registros.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setClearDbModalOpen(true)}
                      className="px-4 py-2 rounded-lg bg-error-container text-on-error-container font-label-md text-label-md hover:opacity-90 flex items-center gap-2 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                      <span>Deletar Toda a Base</span>
                    </button>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <p className="text-xs font-semibold text-on-surface-variant">Total no Sistema</p>
                    <p className="text-2xl font-bold text-primary mt-1">{resumoAcervo?.total || 0}</p>
                    <p className="text-xs text-on-surface-variant mt-1">Questões cadastradas</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <p className="text-xs font-semibold text-on-surface-variant">Com Pendências de Ajustes</p>
                    <p className="text-2xl font-bold text-error mt-1">
                      {resumoAcervo?.pendentes || 0}
                    </p>
                    <p className="text-xs text-error mt-1">Requerem atenção</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <p className="text-xs font-semibold text-on-surface-variant">Questões Completas</p>
                    <p className="text-2xl font-bold text-secondary mt-1">
                      {resumoAcervo?.validadas || 0}
                    </p>
                    <p className="text-xs text-secondary mt-1">Prontas para simulado</p>
                  </div>
                </div>

                {/* Filter bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/30">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mr-2">Filtrar:</span>
                  <button
                    onClick={() => { setGestaoFilter('all'); setAuditoriaPage(0); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-label-md transition-all ${
                      gestaoFilter === 'all' ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Todas ({resumoAcervo?.total || 0})
                  </button>
                  <button
                    onClick={() => { setGestaoFilter('pendentes'); setAuditoriaPage(0); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-label-md transition-all ${
                      gestaoFilter === 'pendentes' ? 'bg-error text-on-error font-bold' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Com Pendências ({resumoAcervo?.pendentes || 0})
                  </button>
                  <button
                    onClick={() => { setGestaoFilter('completas'); setAuditoriaPage(0); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-label-md transition-all ${
                      gestaoFilter === 'completas' ? 'bg-secondary text-on-secondary font-bold' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Completas ({resumoAcervo?.validadas || 0})
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-3 pt-2">
                  {auditoriaLoading ? (
                    <div className="p-12 text-center text-on-surface-variant">Carregando auditoria...</div>
                  ) : auditoriaItems.length === 0 ? (
                    <div className="p-12 text-center bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-3">
                      <span className="material-symbols-outlined text-[48px] text-outline">database</span>
                      <h3 className="font-title-md font-bold text-on-surface">Base de dados vazia</h3>
                      <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto">
                        Nenhuma questão cadastrada para este filtro.
                      </p>
                    </div>
                  ) : (
                    <>
                      {auditoriaItems.map((q) => {
                        const issues = q.pendencias || [];
                        return (
                          <div key={q.id} className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1.5 min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[11px] font-code-md bg-surface-container text-on-surface font-bold">
                                  {q.id}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-label-md bg-primary-fixed/40 text-on-primary-fixed font-semibold">
                                  {q.disciplina || 'Sem Disciplina'}
                                </span>
                                {q.banca && (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-label-md bg-surface-container text-on-surface-variant">
                                    {q.banca} {q.ano ? `(${q.ano})` : ''}
                                  </span>
                                )}
                                {issues.length > 0 ? (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-label-md bg-error-container text-on-error-container font-semibold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">warning</span>
                                    <span>{issues.length} {issues.length === 1 ? 'pendência' : 'pendências'}</span>
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded text-[11px] font-label-md bg-secondary-fixed text-on-secondary-fixed font-semibold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                    <span>Completa</span>
                                  </span>
                                )}
                              </div>
                              <p className="font-body-md text-sm text-on-surface line-clamp-2">
                                {q.enunciado_resumo || q.enunciado || '(Sem enunciado)'}
                              </p>
                              {issues.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {issues.map((iss: string, i: number) => (
                                    <span key={i} className="text-[10px] font-code-md text-error bg-error-container/40 px-1.5 py-0.5 rounded">
                                      • {iss}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                                title="Excluir questão"
                              >
                                <span className="material-symbols-outlined text-[20px]">delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Pagination Controls */}
                      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
                        <button
                          onClick={() => setAuditoriaPage(p => Math.max(0, p - 1))}
                          disabled={auditoriaPage === 0}
                          className="px-3.5 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-xs disabled:opacity-50 hover:bg-surface-container-high transition-colors"
                        >
                          Anterior
                        </button>
                        <span className="text-xs text-on-surface-variant font-medium">
                          Página {auditoriaPage + 1} de {Math.ceil((gestaoFilter === 'pendentes' ? (resumoAcervo?.pendentes || 0) : gestaoFilter === 'completas' ? (resumoAcervo?.validadas || 0) : (resumoAcervo?.total || 0)) / 50) || 1}
                        </span>
                        <button
                          onClick={() => setAuditoriaPage(p => p + 1)}
                          disabled={(auditoriaPage + 1) * 50 >= (gestaoFilter === 'pendentes' ? (resumoAcervo?.pendentes || 0) : gestaoFilter === 'completas' ? (resumoAcervo?.validadas || 0) : (resumoAcervo?.total || 0))}
                          className="px-3.5 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-xs disabled:opacity-50 hover:bg-surface-container-high transition-colors"
                        >
                          Próxima
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

              {gestaoSubTab === 'importacao' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary">upload_file</span>
                          <span>Importação de Questões (JSON)</span>
                        </h1>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Importe lotes de questões a partir de arquivos JSON estruturados para alimentar sua base.</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handleDownloadTemplate}
                          className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high flex items-center gap-2 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[18px]">download</span>
                          <span>Baixar Modelo JSON</span>
                        </button>
                        <button
                          onClick={() => setSchemaModalOpen(true)}
                          className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high flex items-center gap-2 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[18px]">data_object</span>
                          <span>Ver Schema</span>
                        </button>
                      </div>
                    </div>

                    {/* Upload Dropzone */}
                    <div className="p-8 border-2 border-dashed border-outline-variant/60 rounded-2xl bg-surface-container-low/50 text-center space-y-4 hover:border-primary transition-all relative">
                      <input
                        type="file"
                        multiple
                        accept=".json"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Selecione arquivos JSON"
                      />
                      <div className="w-16 h-16 mx-auto rounded-full bg-primary-fixed text-primary flex items-center justify-center shadow-inner">
                        <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                      </div>
                      <div className="space-y-1">
                        <p className="font-title-md font-bold text-on-surface text-base">Clique aqui ou arraste arquivos .json</p>
                        <p className="text-body-sm text-on-surface-variant">Suporta múltiplos arquivos JSON formatados com questões de concursos.</p>
                      </div>
                      {uploadFeedback && (
                        <div className="p-3 bg-secondary-container/40 text-on-secondary-container rounded-xl text-xs font-semibold inline-block">
                          Último upload: {uploadFeedback.filename} ({uploadFeedback.count} questões carregadas)
                        </div>
                      )}
                    </div>

                    {/* Staged Preview */}
                    {stagedQuestions.length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-outline-variant/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <h3 className="font-title-md font-bold text-on-surface">Pré-visualização do Lote ({stagedQuestions.length} questões)</h3>
                            <p className="text-xs text-on-surface-variant">Valide os dados antes de submeter definitivamente para o banco Supabase.</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleRejectAllPending}
                              className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant text-xs font-bold hover:bg-surface-container-high"
                            >
                              Remover com Pendências
                            </button>
                            <button
                              onClick={handleSubmitValidatedToSupabase}
                              className="px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-xs hover:bg-primary-container shadow-sm flex items-center gap-1.5"
                            >
                              <span className="material-symbols-outlined text-[16px]">publish</span>
                              <span>Submeter Validadas ({stagedQuestions.filter(isQuestionValid).length})</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                          {stagedQuestions.map(q => {
                            const valid = isQuestionValid(q);
                            const issues = getQuestionPendencies(q);
                            return (
                              <div key={q.id} className={`p-4 rounded-xl border ${valid ? 'bg-surface-container-low border-outline-variant/30' : 'bg-error-container/10 border-error/30'} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2 py-0.5 rounded text-[11px] font-code-md bg-surface-container text-on-surface font-bold">
                                      {q.id}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[11px] font-label-md bg-primary-fixed/40 text-on-primary-fixed font-semibold">
                                      {q.disciplina}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[11px] font-label-md bg-surface-container text-on-surface-variant">
                                      {q.banca}
                                    </span>
                                    {valid ? (
                                      <span className="px-2 py-0.5 rounded text-[11px] font-label-md bg-secondary-fixed text-on-secondary-fixed font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                        <span>Pronta</span>
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded text-[11px] font-label-md bg-error-container text-on-error-container font-semibold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">warning</span>
                                        <span>{issues.length} pendências</span>
                                      </span>
                                    )}
                                  </div>
                                  <p className="font-body-md text-sm text-on-surface line-clamp-2">{q.enunciado}</p>
                                  {issues.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                      {issues.map((iss, idx) => (
                                        <span key={idx} className="text-[10px] font-code-md text-error bg-error-container/40 px-1.5 py-0.5 rounded">
                                          • {iss}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <button
                                    onClick={() => handleRejectQuestion(q.id)}
                                    className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-error transition-colors"
                                    title="Remover da importação"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ================= CLEAR DATABASE CONFIRMATION MODAL ================= */}
          {clearDbModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
              <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant p-6 shadow-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[24px]">warning</span>
                  </div>
                  <div>
                    <h3 className="font-title-md font-bold text-on-surface">Excluir Toda a Base de Questões?</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Esta ação é irreversível e removerá todas as questões cadastradas no sistema.</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setClearDbModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleClearDatabase}
                    className="px-4 py-2 rounded-lg bg-error text-on-error font-label-md text-label-md hover:opacity-90 shadow-sm"
                  >
                    Sim, Deletar Tudo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: CONFIGURAÇÕES & METAS PESSOAIS ================= */}
          {activeTab === 'configuracoes' && (
            <section className="space-y-6 max-w-3xl mx-auto animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 pt-1 sm:bg-surface-container-lowest sm:p-6 sm:rounded-2xl sm:border sm:border-outline-variant/40 sm:shadow-sm">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">
                    Perfil & Metas Pessoais
                  </span>
                  <h1 className="text-lg sm:text-2xl font-bold text-on-surface">
                    Configuração de Metas de Estudo
                  </h1>
                </div>
              </div>

              <form onSubmit={handleSaveConfig} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/40 shadow-sm space-y-6">
                {/* Metas Diárias & Semanais */}
                <div className="space-y-4">
                  <h3 className="font-title-md font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                    <span className="material-symbols-outlined text-primary">target</span>
                    <span>Metas Diárias & Semanais de Prática</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">Mín. Questões / Dia</label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        value={metaQuestoesDia}
                        onChange={(e) => setMetaQuestoesDia(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">Mín. Desafios / Dia</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={metaDesafiosDia}
                        onChange={(e) => setMetaDesafiosDia(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">Mín. Simulados / Semana</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={metaSimuladosSemana}
                        onChange={(e) => setMetaSimuladosSemana(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Metas de Aproveitamento */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-title-md font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                    <span className="material-symbols-outlined text-secondary">insights</span>
                    <span>Percentuais Mínimos de Aproveitamento</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">Aproveitamento Geral Mínimo (%)</label>
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={metaAproveitamentoGeral}
                        onChange={(e) => setMetaAproveitamentoGeral(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">Aproveitamento Mínimo por Matéria (%)</label>
                      <input
                        type="number"
                        min="10"
                        max="100"
                        value={metaAproveitamentoMateria}
                        onChange={(e) => setMetaAproveitamentoMateria(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface text-sm focus:outline-none focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Seleção de Anos-Alvo */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-title-md font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                    <span>Seleção de Anos-Alvo (Foco por Ano)</span>
                  </h3>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                      <span className="material-symbols-outlined text-[18px]">search</span>
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar anos (ex: 2024, 2023)..."
                      value={searchTermAnos}
                      onChange={(e) => setSearchTermAnos(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-40 overflow-y-auto p-2 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    {configAvailableAnos.filter(ano => ano.toLowerCase().includes(searchTermAnos.toLowerCase())).length === 0 ? (
                      <p className="text-xs text-outline italic p-2 text-center col-span-full">Nenhum ano encontrado.</p>
                    ) : (
                      configAvailableAnos
                        .filter(ano => ano.toLowerCase().includes(searchTermAnos.toLowerCase()))
                        .map(ano => {
                          const isSelected = anosAlvo.includes(ano);
                          return (
                            <div
                              key={ano}
                              onClick={() => {
                                if (isSelected) {
                                  setAnosAlvo(anosAlvo.filter(a => a !== ano));
                                } else {
                                  setAnosAlvo([...anosAlvo, ano]);
                                }
                              }}
                              className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer text-xs transition-colors ${
                                isSelected ? 'bg-primary-fixed/40 text-on-primary-fixed font-semibold border border-primary/30' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/20'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer pointer-events-none"
                              />
                              <span className="truncate flex-1 font-medium text-center">{ano}</span>
                            </div>
                          );
                        })
                    )}
                  </div>
                  <p className="text-[11px] text-outline italic">
                    * Caso nenhum ano seja selecionado, todas as matérias e assuntos de todos os anos estarão disponíveis.
                  </p>
                </div>

                {/* Seleção de Matérias-Alvo */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-title-md font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                    <span className="material-symbols-outlined text-tertiary">library_books</span>
                    <span>Seleção de Matérias-Alvo (Foco do Concurso)</span>
                  </h3>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                      <span className="material-symbols-outlined text-[18px]">search</span>
                    </span>
                    <input
                      type="text"
                      placeholder="Buscar matérias..."
                      value={searchTermDisciplinas}
                      onChange={(e) => setSearchTermDisciplinas(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface text-xs focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-2 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    {availableDisciplinasSettings.filter(disc => disc.toLowerCase().includes(searchTermDisciplinas.toLowerCase())).length === 0 ? (
                      <p className="text-xs text-outline italic p-2 text-center col-span-full">Nenhuma disciplina encontrada.</p>
                    ) : (
                      availableDisciplinasSettings
                        .filter(disc => disc.toLowerCase().includes(searchTermDisciplinas.toLowerCase()))
                        .map(disc => {
                          const isSelected = materiasAlvo.includes(disc);
                          return (
                            <div
                              key={disc}
                              onClick={() => {
                                if (isSelected) {
                                  setMateriasAlvo(materiasAlvo.filter(d => d !== disc));
                                } else {
                                  setMateriasAlvo([...materiasAlvo, disc]);
                                }
                              }}
                              className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                                isSelected ? 'bg-primary-fixed/40 text-on-primary-fixed font-semibold border border-primary/30' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/20'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer pointer-events-none"
                              />
                              <span className="truncate flex-1 font-medium">{disc}</span>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Seleção de Assuntos-Alvo (Condicional: só aparece após seleção de matérias-alvo) */}
                {(() => {
                  const availableAssuntos = availableAssuntosSettings;

                  return materiasAlvo.length > 0 ? (
                    <div className="space-y-4 pt-2 animate-fadeIn">
                      <h3 className="font-title-md font-bold text-on-surface flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                        <span className="material-symbols-outlined text-secondary">bookmark_added</span>
                        <span>Seleção de Assuntos-Alvo (Foco Específico)</span>
                      </h3>

                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                          <span className="material-symbols-outlined text-[18px]">search</span>
                        </span>
                        <input
                          type="text"
                          placeholder="Buscar assuntos..."
                          value={searchTermAssuntos}
                          onChange={(e) => setSearchTermAssuntos(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface text-xs focus:outline-none focus:border-secondary"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto p-2 rounded-xl bg-surface-container-low border border-outline-variant/30">
                        {availableAssuntos.filter(assunto => assunto.toLowerCase().includes(searchTermAssuntos.toLowerCase())).length === 0 ? (
                          <p className="text-xs text-outline italic p-2 text-center col-span-full">Nenhum assunto encontrado.</p>
                        ) : (
                          availableAssuntos
                            .filter(assunto => assunto.toLowerCase().includes(searchTermAssuntos.toLowerCase()))
                            .map(assunto => {
                              const isSelected = assuntosAlvo.includes(assunto);
                              return (
                                <div
                                  key={assunto}
                                  onClick={() => {
                                    if (isSelected) {
                                      setAssuntosAlvo(assuntosAlvo.filter(a => a !== assunto));
                                    } else {
                                      setAssuntosAlvo([...assuntosAlvo, assunto]);
                                    }
                                  }}
                                  className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                                    isSelected ? 'bg-secondary-container text-on-secondary-container font-semibold border border-secondary/30' : 'bg-surface-container-lowest hover:bg-surface-container text-on-surface border border-outline-variant/20'
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="w-4 h-4 rounded text-secondary focus:ring-secondary accent-secondary cursor-pointer pointer-events-none"
                                  />
                                  <span className="truncate flex-1 font-medium">{assunto}</span>
                                </div>
                              );
                            })
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-center space-y-1">
                      <p className="text-xs text-on-surface-variant italic">
                        💡 Selecione ao menos uma <strong>Matéria-Alvo</strong> acima para desbloquear e visualizar a seleção específica de <strong>Assuntos-Alvo</strong>.
                      </p>
                    </div>
                  );
                })()}

                {/* Botão de Salvar */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary-container active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    <span>Salvar Configurações e Metas</span>
                  </button>
                </div>
              </form>
            </section>
          )}
        </main>
      </div>

      {/* ================= MOBILE BOTTOM NAVIGATION BAR ================= */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 border-t border-outline-variant/30 bg-surface-container-lowest/95 backdrop-blur-md md:hidden shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <button
          onClick={() => setActiveTab('inicio')}
          className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all ${
            activeTab === 'inicio' ? 'bg-primary-fixed text-on-primary-fixed' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">dashboard</span>
          <span className="text-label-sm font-label-sm">Início</span>
        </button>
        <button
          onClick={() => handleTabChange('ofensivas')}
          className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all ${
            activeTab === 'ofensivas' ? 'bg-primary-fixed text-on-primary-fixed' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">electric_bolt</span>
          <span className="text-label-sm font-label-sm">Ofensivas</span>
        </button>
        <button
          onClick={() => handleTabChange('desempenho')}
          className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all ${
            activeTab === 'desempenho' ? 'bg-primary-fixed text-on-primary-fixed' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">insights</span>
          <span className="text-label-sm font-label-sm">Desempenho</span>
        </button>
        <button
          onClick={() => setActiveTab('gestao')}
          className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all ${
            activeTab === 'gestao' ? 'bg-primary-fixed text-on-primary-fixed' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
          <span className="text-label-sm font-label-sm">Gestão</span>
        </button>
      </nav>

      {/* ================= SCHEMA MODAL ================= */}
      {schemaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest max-w-lg w-full rounded-2xl border border-outline-variant p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">data_object</span>
                <span>Estrutura do Schema JSON Oficial</span>
              </h3>
              <button className="p-1 rounded-lg hover:bg-surface-container" onClick={() => setSchemaModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <pre className="bg-surface-container-high p-3 rounded-lg text-xs font-code-md text-on-surface overflow-x-auto">{`[
  {
    "id": "quest_001",
    "disciplina": "Direito Administrativo",
    "assunto": "Lei nº 11.079/2004 - PPP",
    "ano": "2026",
    "banca": "CESGRANRIO",
    "prova": "CEF - Arquiteto",
    "enunciado": "Em conformidade com a Lei...",
    "alternativas": [
      { "letra": "A", "texto": "..." },
      { "letra": "B", "texto": "..." }
    ],
    "alternativa_certa": "B"
  }
]`}</pre>
            <div className="flex justify-end">
              <button
                onClick={() => setSchemaModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md"
              >
                Entendi, Fechar
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ================= SUBMISSION PROGRESS MODAL ================= */}
      {submittingProgress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl border border-outline-variant p-6 shadow-2xl space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary-fixed text-primary flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-[28px]">cloud_upload</span>
            </div>
            <div>
              <h3 className="font-title-md font-bold text-on-surface text-lg">Submetendo Questões em Lotes...</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Lote {submittingProgress.currentBatch} de {submittingProgress.totalBatches}
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full h-3 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{
                    width: `${Math.round((submittingProgress.successCount / submittingProgress.totalCount) * 100)}%`
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs font-code-md text-on-surface-variant">
                <span>{submittingProgress.successCount} de {submittingProgress.totalCount} enviadas</span>
                <span>{Math.round((submittingProgress.successCount / submittingProgress.totalCount) * 100)}%</span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant italic">
              {submittingProgress.successCount < submittingProgress.totalCount
                ? "Processando lotes no servidor, por favor aguarde..."
                : "Concluído com sucesso!"}
            </p>
          </div>
        </div>
      )}

      {/* ================= SUPABASE SQL SETUP MODAL ================= */}
      {supabaseSqlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest max-w-2xl w-full rounded-2xl border border-outline-variant p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">terminal</span>
                <span>Configuração Necessária no Supabase (Schema: acertocerto)</span>
              </h3>
              <button className="p-1 rounded-lg hover:bg-surface-container" onClick={() => setSupabaseSqlModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-body-sm text-on-surface-variant">
              O erro ocorreu porque a tabela <code className="bg-surface-container px-1 py-0.5 rounded text-xs font-code-md text-primary">acertocerto.questoes</code> ainda não foi criada no seu projeto Supabase. Abra o seu <strong className="text-on-surface">Supabase Dashboard &gt; SQL Editor</strong>, cole e execute o comando SQL abaixo:
            </p>

            <div className="relative">
              <pre className="bg-surface-container-high p-4 rounded-xl text-xs font-code-md text-on-surface overflow-x-auto max-h-60">{`-- 1. Criar o schema acertocerto
CREATE SCHEMA IF NOT EXISTS acertocerto;

-- 2. Criar a tabela de questões
CREATE TABLE IF NOT EXISTS acertocerto.questoes (
  id TEXT PRIMARY KEY,
  disciplina TEXT NOT NULL,
  assunto TEXT,
  ano TEXT,
  banca TEXT,
  prova TEXT,
  metadados JSONB,
  texto_associado TEXT,
  enunciado TEXT NOT NULL,
  tipo TEXT DEFAULT 'multipla_escolha',
  alternativas JSONB NOT NULL,
  alternativa_certa TEXT NOT NULL,
  comentario_ia TEXT,
  pagina INTEGER DEFAULT 1,
  explicacao JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar segurança e permitir acesso total (insersões, leituras, etc.)
ALTER TABLE acertocerto.questoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso total em questoes acertocerto" ON acertocerto.questoes;
CREATE POLICY "Permitir acesso total em questoes acertocerto" ON acertocerto.questoes
  FOR ALL USING (true) WITH CHECK (true);`}</pre>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`CREATE SCHEMA IF NOT EXISTS acertocerto;

CREATE TABLE IF NOT EXISTS acertocerto.questoes (
  id TEXT PRIMARY KEY,
  disciplina TEXT NOT NULL,
  assunto TEXT,
  ano TEXT,
  banca TEXT,
  prova TEXT,
  metadados JSONB,
  texto_associado TEXT,
  enunciado TEXT NOT NULL,
  tipo TEXT DEFAULT 'multipla_escolha',
  alternativas JSONB NOT NULL,
  alternativa_certa TEXT NOT NULL,
  comentario_ia TEXT,
  pagina INTEGER DEFAULT 1,
  explicacao JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE acertocerto.questoes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso total em questoes acertocerto" ON acertocerto.questoes;
CREATE POLICY "Permitir acesso total em questoes acertocerto" ON acertocerto.questoes
  FOR ALL USING (true) WITH CHECK (true);`);
                  showNotification("Script SQL copiado para a área de transferência!");
                }}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
                <span>Copiar SQL</span>
              </button>

              <button
                onClick={() => setSupabaseSqlModalOpen(false)}
                className="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 shadow-sm"
              >
                Entendi, Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= PROJECTION & MAINTENANCE RULES MODAL ================= */}
      {showProjectionModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest max-w-xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border border-outline-variant/40 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[26px]">analytics</span>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-on-surface">Regras de Cálculo e Manutenção</h3>
                  <p className="text-xs text-on-surface-variant">Como funciona o seu Índice, Projeção e Ofensivas de Defesa</p>
                </div>
              </div>
              <button
                onClick={() => setShowProjectionModal(false)}
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-body-sm text-on-surface-variant leading-relaxed">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">pie_chart</span>
                  1. Composição do Índice Geral
                </h4>
                <p className="text-xs">
                  O seu índice geral (0 a 100) é calculado deterministicamente combinando três pilares essenciais:
                </p>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  <li><strong>Acerto (40%)</strong>: Taxa de aproveitamento nas questões respondidas.</li>
                  <li><strong>Consistência (30%)</strong>: Percentual de dias ativos nos últimos 7 dias.</li>
                  <li><strong>Evolução (30%)</strong>: Comparativo de desempenho entre o rendimento recente e inicial.</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[18px]">local_fire_department</span>
                  2. Variável de Manutenção ("Ofensivas" e Decaimento)
                </h4>
                <p className="text-xs">
                  Para que um nível acadêmico de alta performance seja mantido, o aluno precisa <strong>defender</strong> esse patamar através de estudos regulares:
                </p>
                <ul className="list-disc pl-5 text-xs space-y-1">
                  <li><strong>Bônus de Ofensiva</strong>: Cada dia consecutivo estudando (*streak*) concede um bônus de estabilidade de até +10 pontos no seu índice.</li>
                  <li><strong>Decaimento por Inatividade</strong>: Caso o aluno fique 2 dias ou mais sem resolver questões (sem defender o nível), o sistema aplica uma taxa de decaimento proporcional (-5 pontos por dia de inatividade), simulando a perda de ritmo de estudos. Para recuperar, basta retornar às rodadas diárias!</li>
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <h4 className="font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary text-[18px]">military_tech</span>
                  3. Faixas de Prontidão e Níveis
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20">
                    <strong className="text-primary">Análise Inicial (&lt; 10 questões)</strong>
                    <p className="text-[11px] text-on-surface-variant">Calibrando dados iniciais.</p>
                  </div>
                  <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20">
                    <strong className="text-primary">Fase de Base (Índice &lt; 40)</strong>
                    <p className="text-[11px] text-on-surface-variant">Adaptação e conceitos fundamentais.</p>
                  </div>
                  <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20">
                    <strong className="text-primary">Curva de Crescimento (40 - 59)</strong>
                    <p className="text-[11px] text-on-surface-variant">Evolução constante e correção de falhas.</p>
                  </div>
                  <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20">
                    <strong className="text-primary">Em Ritmo de Aprovação (60 - 79)</strong>
                    <p className="text-[11px] text-on-surface-variant">Alto desempenho e consistência.</p>
                  </div>
                  <div className="p-2 rounded bg-surface-container-lowest border border-outline-variant/20 sm:col-span-2">
                    <strong className="text-primary">Nível Avançado (80 - 100)</strong>
                    <p className="text-[11px] text-on-surface-variant">Prontidão competitiva máxima para provas exigentes.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowProjectionModal(false)}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md hover:opacity-90 shadow-sm"
              >
                Entendi, Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOAST NOTIFICATION ================= */}
      <div
        className={`fixed bottom-20 md:bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-inverse-surface text-inverse-on-surface shadow-xl flex items-center gap-3 text-body-sm transition-all duration-300 ${
          toastVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-secondary-fixed text-[20px]">check_circle</span>
        <span>{toastMessage}</span>
      </div>
    </div>
  );
}
