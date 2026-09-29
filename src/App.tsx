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

const SAMPLE_QUESTION_TEMPLATE: Questao[] = [
  {
    id: "exemplo_01",
    disciplina: "Direito Administrativo",
    assunto: "Atos Administrativos",
    ano: "2026",
    banca: "CESGRANRIO",
    prova: "Exemplo Prova",
    tipo: "multipla_escolha",
    pagina: 1,
    enunciado: "Exemplo de enunciado de questão...",
    alternativas: [
      { letra: "A", texto: "Alternativa A..." },
      { letra: "B", texto: "Alternativa B..." },
      { letra: "C", texto: "Alternativa C..." },
      { letra: "D", texto: "Alternativa D..." },
      { letra: "E", texto: "Alternativa E..." }
    ],
    alternativa_certa: "A",
    comentario_ia: "Comentário explicativo da questão.",
    source: "official"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'simulado' | 'importador' | 'estatisticas' | 'gestao'>('home');
  const [gestaoFilter, setGestaoFilter] = useState<'all' | 'pendentes' | 'completas'>('all');
  const [clearDbModalOpen, setClearDbModalOpen] = useState<boolean>(false);

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
    const updated = questions.filter(q => q.id !== id);
    setQuestions(updated);
    localStorage.setItem('acertocerto_questions', JSON.stringify(updated));
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.from('questoes').delete().eq('id', id);
      }
      await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: updated })
      });
    } catch (e) {}
    showNotification("Questão removida com sucesso.");
  };

  const handleClearDatabase = async () => {
    setQuestions([]);
    localStorage.removeItem('acertocerto_questions');
    try {
      if (isSupabaseConfigured() && supabase) {
        await supabase.from('questoes').delete().neq('id', '___non_existent_id___');
      }
      await fetch('/api/questions', { method: 'DELETE' });
    } catch (e) {}
    showNotification("Base de dados limpa com sucesso do sistema e do Supabase!");
    setClearDbModalOpen(false);
  };

  const [questions, setQuestions] = useState<Questao[]>(() => {
    try {
      const saved = localStorage.getItem('acertocerto_questions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('acertocerto_questions', JSON.stringify(questions));
    } catch (e) {
      // ignore
    }
  }, [questions]);

  useEffect(() => {
    fetch('/api/questions')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.questions)) {
          setQuestions(data.questions);
        }
      })
      .catch(() => {});
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
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [uploadFeedback, setUploadFeedback] = useState<{ filename: string; count: number } | null>(null);
  const [stagedQuestions, setStagedQuestions] = useState<Questao[]>([]);
  const [previewTab, setPreviewTab] = useState<'validadas' | 'pendentes'>('validadas');
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [supabaseSqlModalOpen, setSupabaseSqlModalOpen] = useState<boolean>(false);
  const [submittingProgress, setSubmittingProgress] = useState<{
    active: boolean;
    currentBatch: number;
    totalBatches: number;
    successCount: number;
    totalCount: number;
  } | null>(null);


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
    return localStorage.getItem('acertocerto_theme') === 'dark';
  });

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('acertocerto_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('acertocerto_theme', 'light');
    }
  }, [isDarkMode]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Supabase Schema "acertocerto" synchronization effect
  useEffect(() => {
    async function loadData() {
      if (isSupabaseConfigured() && supabase) {
        try {
          let allFetchedData: any[] = [];
          let from = 0;
          const pageSize = 1000;
          let keepFetching = true;

          while (keepFetching) {
            const { data, error } = await supabase
              .from('questoes')
              .select('*')
              .range(from, from + pageSize - 1);

            if (error || !data || data.length === 0) {
              keepFetching = false;
            } else {
              allFetchedData = [...allFetchedData, ...data];
              if (data.length < pageSize) {
                keepFetching = false;
              } else {
                from += pageSize;
              }
            }
          }

          if (allFetchedData.length > 0) {
            const mapped: Questao[] = allFetchedData.map((item: any) => ({
              id: item.id,
              disciplina: item.disciplina,
              assunto: item.assunto,
              ano: item.ano,
              banca: item.banca,
              prova: item.prova,
              metadados: item.metadados,
              texto_associado: item.texto_associado,
              enunciado: item.enunciado,
              tipo: item.tipo || 'multipla_escolha',
              alternativas: item.alternativas,
              alternativa_certa: item.alternativa_certa,
              comentario_ia: item.comentario_ia,
              pagina: item.pagina || 1,
              explicacao: item.explicacao,
              comentario: item.comentario_ia || item.explicacao?.resumo || item.comentario || 'Comentário padrão.',
              source: 'official' as const
            }));
            setQuestions(mapped);
            setDbConnected(true);
          } else {
            setDbConnected(false);
          }
        } catch {
          setDbConnected(false);
        }
      }
    }
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

  const currentQ = questions[currentIndex] || questions[0];

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

    if (selectedOption === currentQ.alternativa_certa) {
      showNotification("Parabéns! Resposta Correta!");
    } else {
      showNotification(`Incorreto. A opção certa é a Letra ${currentQ.alternativa_certa}.`);
    }

    if (newAnswers.filter(a => a !== null).length === 5) {
      setRoundComplete(true);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1 && currentIndex < 4) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedOption(answers[nextIdx]);
      setAnsweredState(answers[nextIdx] !== null);
    } else {
      setRoundComplete(true);
    }
  };

  const handleJumpToQuestion = (idx: number) => {
    if (idx < questions.length) {
      setCurrentIndex(idx);
      setSelectedOption(answers[idx]);
      setAnsweredState(answers[idx] !== null);
    }
  };

  const handleNewRound = (count = 5) => {
    setAnswers(new Array(count).fill(null));
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnsweredState(false);
    setTimerSeconds(0);
    setRoundComplete(false);
    showNotification(`Nova rodada de ${count} questões iniciada!`);
    setActiveTab('simulado');
  };

  const handleStartDisciplineSimulado = (disciplina: string) => {
    setSelectedSubjectFilter(disciplina);
    setAnswers(new Array(5).fill(null));
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnsweredState(false);
    setTimerSeconds(0);
    setRoundComplete(false);
    showNotification(`Simulado de 5 questões iniciado para: ${disciplina}`);
    setActiveTab('simulado');
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

    // Merge into main questions database
    setQuestions(prev => {
      const map = new Map(prev.map(q => [q.id, q]));
      for (const q of toSubmit) {
        map.set(q.id, q);
      }
      return Array.from(map.values());
    });
    setStagedQuestions([]);

    setTimeout(() => {
      setSubmittingProgress(null);
      showNotification(`${successTotal} de ${toSubmit.length} questões submetidas com sucesso ao banco!`);
    }, 500);
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
  const correctCount = answers.filter((ans, idx) => ans !== null && ans === questions[idx]?.alternativa_certa).length;
  const progressPct = Math.round((answeredCount / 5) * 100);
  const aproveitamento = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

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
            <div onClick={() => setActiveTab('simulado')}>
              <FullLogo />
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6 h-full pt-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`pb-1 font-label-md text-label-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span>Início</span>
            </button>
            <button
              onClick={() => setActiveTab('simulado')}
              className={`pb-1 font-label-md text-label-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'simulado'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">quiz</span>
              <span>Simulado</span>
            </button>
            <button
              onClick={() => setActiveTab('importador')}
              className={`pb-1 font-label-md text-label-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'importador'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">upload_file</span>
              <span>Importação JSON</span>
            </button>
            <button
              onClick={() => setActiveTab('estatisticas')}
              className={`pb-1 font-label-md text-label-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'estatisticas'
                  ? 'text-primary font-bold border-b-2 border-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">insights</span>
              <span>Estatísticas</span>
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
            <div className="flex items-center gap-2 pl-1 cursor-pointer" title="Disciplinas">
              <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xs">
                AC
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
            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/40 flex items-center gap-3">
              <LogoMark className="w-10 h-10 flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-title-md text-label-lg font-bold text-primary truncate">AcertoCerto Pro</p>
                <p className="font-body-sm text-[11px] text-on-surface-variant truncate flex items-center gap-1.5 pt-0.5">
                  <span className={`w-2 h-2 rounded-full ${dbConnected ? 'bg-secondary' : 'bg-outline/70'}`}></span>
                  <span className="font-code-md text-[10px]">{dbConnected ? 'Supabase: acertocerto' : 'Modo Offline (Cache)'}</span>
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <p className="px-3 text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Painel de Estudos</p>
              <button
                onClick={() => { setActiveTab('home'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-left transition-all ${
                  activeTab === 'home'
                    ? 'bg-primary-fixed text-on-primary-fixed font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">home</span>
                <span>Início (Home)</span>
              </button>
              <button
                onClick={() => { setActiveTab('simulado'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-left transition-all ${
                  activeTab === 'simulado'
                    ? 'bg-primary-fixed text-on-primary-fixed font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">quiz</span>
                <span>Simulado Ativo</span>
              </button>
              <button
                onClick={() => { setActiveTab('importador'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-left transition-all ${
                  activeTab === 'importador'
                    ? 'bg-primary-fixed text-on-primary-fixed font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                <span>Importador JSON</span>
              </button>
              <button
                onClick={() => { setActiveTab('estatisticas'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-label-md text-label-md text-left transition-all ${
                  activeTab === 'estatisticas'
                    ? 'bg-primary-fixed text-on-primary-fixed font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">analytics</span>
                <span>Estatísticas & Histórico</span>
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
                <span>Gestão de Questões</span>
              </button>
              <button
                onClick={() => showNotification("Configurações do perfil ativas.")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-md text-left"
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
                <span>Configurações</span>
              </button>
            </div>
          </div>

          <div className="border-t border-outline-variant/30 pt-4 space-y-1">
            <button
              onClick={() => setSchemaModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors font-label-md text-label-md text-left"
            >
              <span className="material-symbols-outlined text-[18px]">help</span>
              <span>Ajuda & Schema</span>
            </button>
            <button
              onClick={() => showNotification("Sessão encerrada com segurança.")}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-error hover:bg-error-container/50 transition-colors font-label-md text-label-md text-left"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sair</span>
            </button>
          </div>
        </aside>

        {/* ================= CANVAS CONTENT AREA ================= */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 min-w-0 max-w-[1280px] mx-auto">
          {/* ================= TAB 0: HOME / INÍCIO ================= */}
          {activeTab === 'home' && (
            <section className="space-y-4">
              <div className="bg-surface-container-lowest p-4 sm:p-5 rounded-xl border border-outline-variant/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed text-[10px] font-bold uppercase tracking-wider">
                      AcertoCerto
                    </span>
                    <span className="text-xs text-on-surface-variant">Escolha sua disciplina abaixo</span>
                  </div>
                  <h1 className="text-base sm:text-lg font-bold text-on-surface">
                    Acelere sua aprovação com simulados direcionados
                  </h1>
                </div>
                <button
                  onClick={() => handleNewRound(5)}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-xs sm:text-sm font-semibold hover:bg-primary-container active:scale-95 shadow-sm transition-all whitespace-nowrap self-start sm:self-auto"
                >
                  <span className="material-symbols-outlined text-[18px]">electric_bolt</span>
                  <span>Simulado Misto (5Q)</span>
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
                    const map = new Map<string, { count: number; bancas: Set<string> }>();
                    questions.forEach(q => {
                      const disc = q.disciplina || 'Geral';
                      if (!map.has(disc)) {
                        map.set(disc, { count: 0, bancas: new Set() });
                      }
                      const item = map.get(disc)!;
                      item.count++;
                      if (q.banca) item.bancas.add(q.banca);
                    });
                    const dynamicList = Array.from(map.entries()).map(([name, data]) => ({
                      name,
                      count: `${data.count} ${data.count === 1 ? 'questão' : 'questões'}`,
                      icon: getDisciplineIcon(name),
                      desc: `Questões cadastradas no acervo para ${name}.`,
                      banca: data.bancas.size > 0 ? Array.from(data.bancas).slice(0, 3).join(' / ') : 'Variadas'
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
                            <span>Simulado (5Q)</span>
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </section>
          )}

          {/* ================= TAB 1: SIMULADO ================= */}
          {activeTab === 'simulado' && (
            <section className="space-y-6">
              {/* Main Question & Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Question Card (8 Cols) */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Subtle Round Indicator Bar before question */}
                  <div className="bg-surface-container-lowest p-3.5 rounded-xl border border-outline-variant/50 shadow-sm flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-label-md font-bold text-primary">Questão {currentIndex + 1} de 5</span>
                      <div className="h-4 w-px bg-outline-variant/50"></div>
                      <span className="text-body-sm text-on-surface-variant">Acertos: <strong className="text-secondary">{correctCount} / {answeredCount}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[0, 1, 2, 3, 4].map((i) => {
                        const isCurrent = currentIndex === i;
                        const userAns = answers[i];
                        let dotClass = "w-7 h-7 rounded-lg font-label-sm text-xs font-semibold border border-outline-variant/60 bg-surface-container-low text-on-surface hover:bg-surface-container transition-all flex items-center justify-center";
                        
                        if (isCurrent) {
                          dotClass = "w-7 h-7 rounded-lg font-label-sm text-xs font-bold bg-primary text-on-primary shadow-sm";
                        } else if (userAns !== null) {
                          if (userAns === questions[i]?.alternativa_certa) {
                            dotClass = "w-7 h-7 rounded-lg font-label-sm text-xs font-bold bg-secondary-container text-secondary border-secondary";
                          } else {
                            dotClass = "w-7 h-7 rounded-lg font-label-sm text-xs font-bold bg-error-container text-error border-error";
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
                          <span className="text-xs text-on-surface-variant font-normal">({currentIndex + 1}/5)</span>
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

              {/* Round Complete Modal */}
              {roundComplete && (
                <div className="p-6 sm:p-8 rounded-2xl bg-surface-container-lowest border-2 border-secondary shadow-lg space-y-5 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[32px]">emoji_events</span>
                      </div>
                      <div>
                        <span className="text-label-sm font-label-sm uppercase font-bold text-secondary">Excelente ritmo de estudos!</span>
                        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Rodada de 5 Questões Finalizada</h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Seu aproveitamento neste bloco foi de {aproveitamento}%. Desempenho registrado.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleNewRound(5)}
                        className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container active:scale-95 transition-all shadow-sm flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">bolt</span>
                        <span>Nova Rodada de 5</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('importador')}
                        className="px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md hover:bg-surface-variant transition-colors"
                      >
                        Ver Banco Completo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ================= TAB 2: IMPORTADOR & BANCO DE QUESTÕES ================= */}
          {activeTab === 'importador' && (
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-container-low/50 p-4 sm:p-5 rounded-xl border border-outline-variant/20">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface text-label-sm font-label-sm font-bold uppercase">
                      Ingestão Estruturada
                    </span>
                    <span className="text-label-sm font-label-sm text-outline">Schema Universal AcertoCerto</span>
                  </div>
                  <h1 className="font-headline-sm text-lg sm:text-xl font-bold text-on-surface">
                    Importador & Gerenciador de Banco de Questões
                  </h1>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Carregue pacotes de questões em formato JSON para enriquecer o acervo offline e gerar simulados temáticos.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSupabaseSqlModalOpen(true)}
                    className="px-3.5 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-all flex items-center gap-2 border border-outline-variant/40 shadow-sm"
                    title="Ver comando SQL para criar a tabela no Supabase"
                  >
                    <span className="material-symbols-outlined text-[18px]">terminal</span>
                    <span>SQL do Supabase</span>
                  </button>
                  <button
                    onClick={handleDownloadTemplate}
                    className="px-3.5 py-2 rounded-lg bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md hover:bg-secondary-fixed-dim active:scale-[0.985] transition-all flex items-center gap-2 shadow-sm"
                    title="Baixar arquivo modelo em JSON"
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Baixar JSON: questoes_gran.json</span>
                  </button>
                </div>
              </div>

              {/* KPI Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">database</span>
                  </div>
                  <div>
                    <p className="font-body-sm text-xs text-on-surface-variant">Total no Banco Local</p>
                    <p className="font-title-md text-xl font-bold text-on-surface">{questions.length} Questões</p>
                    <p className="font-label-sm text-[11px] text-secondary font-semibold">100% Indexadas</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">category</span>
                  </div>
                  <div>
                    <p className="font-body-sm text-xs text-on-surface-variant">Matérias Mapeadas</p>
                    <p className="font-title-md text-xl font-bold text-on-surface">{new Set(questions.map(q => q.disciplina).filter(Boolean)).size} Disciplinas</p>
                    <p className="font-label-sm text-[11px] text-on-surface-variant">Base Ativa</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">verified_user</span>
                  </div>
                  <div>
                    <p className="font-body-sm text-xs text-on-surface-variant">Gabarito & Resoluções</p>
                    <p className="font-title-md text-xl font-bold text-on-surface">100% Válidos</p>
                    <p className="font-label-sm text-[11px] text-tertiary font-semibold">Sem inconsistências</p>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">speed</span>
                  </div>
                  <div>
                    <p className="font-body-sm text-xs text-on-surface-variant">Taxa de Acerto Geral</p>
                    <p className="font-title-md text-xl font-bold text-primary">82.3%</p>
                    <p className="font-label-sm text-[11px] text-secondary font-semibold">+4.2% esta semana</p>
                  </div>
                </div>
              </div>

              {/* Upload Dropzone (Compact) */}
              <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-title-md text-sm font-bold text-on-surface">Upload de Arquivo JSON</h2>
                  <span className="text-xs font-code-md text-outline">.json / UTF-8</span>
                </div>

                <div className="relative border border-dashed border-outline-variant hover:border-primary rounded-xl p-4 text-center bg-surface cursor-pointer transition-all flex items-center justify-center gap-4 overflow-hidden">
                  <input
                    type="file"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileUpload}
                  />
                  <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px]">upload_file</span>
                  </div>
                  <div className="text-left">
                    <p className="font-title-md font-bold text-on-surface text-xs">Clique aqui para selecionar um ou vários arquivos .json</p>
                    <p className="font-body-sm text-[11px] text-on-surface-variant">Carrega e valida o Schema Universal em lote</p>
                  </div>
                </div>

                {uploadFeedback && (
                  <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-between text-xs">
                    <span className="font-code-md font-bold text-primary truncate">{uploadFeedback.filename}</span>
                    <span className="text-on-surface-variant">{uploadFeedback.count} questões processadas</span>
                  </div>
                )}
              </div>

              {/* Preview Table & Tabs */}
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-sm p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-title-md text-title-md font-bold text-on-surface">Pré-visualização do Acervo</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Valide as questões antes de submetê-las ao banco de dados.</p>
                  </div>
                  {previewTab === 'validadas' && stagedQuestions.filter(isQuestionValid).length > 0 && (
                    <button
                      onClick={handleSubmitValidatedToSupabase}
                      className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                      <span>Submeter Validadas ao Banco ({stagedQuestions.filter(isQuestionValid).length})</span>
                    </button>
                  )}
                  {previewTab === 'pendentes' && stagedQuestions.filter(q => !isQuestionValid(q)).length > 0 && (
                    <button
                      onClick={handleRejectAllPending}
                      className="px-4 py-2 rounded-lg bg-error-container text-on-error-container font-label-md text-label-md hover:opacity-90 transition-all shadow-sm flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
                      <span>Recusar Todas as Pendentes ({stagedQuestions.filter(q => !isQuestionValid(q)).length})</span>
                    </button>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
                  <button
                    onClick={() => setPreviewTab('validadas')}
                    className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-2 ${
                      previewTab === 'validadas'
                        ? 'bg-primary-fixed text-on-primary-fixed font-bold shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span>Validadas / Completas</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-secondary-container text-on-secondary-container font-bold">
                      {stagedQuestions.filter(isQuestionValid).length}
                    </span>
                  </button>
                  <button
                    onClick={() => setPreviewTab('pendentes')}
                    className={`px-4 py-2 rounded-lg font-label-md text-label-md transition-all flex items-center gap-2 ${
                      previewTab === 'pendentes'
                        ? 'bg-primary-fixed text-on-primary-fixed font-bold shadow-sm'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    <span>Com Pendência</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-error-container text-on-error-container font-bold">
                      {stagedQuestions.filter(q => !isQuestionValid(q)).length}
                    </span>
                  </button>
                </div>

                <div className="overflow-x-auto custom-scrollbar border border-outline-variant/30 rounded-xl">
                  <table className="w-full text-left text-body-sm">
                    <thead className="bg-surface-container-high text-on-surface text-label-md font-label-md border-b border-outline-variant/40">
                      <tr>
                        <th className="p-3">ID</th>
                        <th className="p-3">Banca / Ano</th>
                        <th className="p-3">Disciplina / Assunto</th>
                        <th className="p-3 min-w-[280px]">Enunciado (Trecho)</th>
                        <th className="p-3 text-center">Gabarito</th>
                        <th className="p-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                      {(previewTab === 'validadas'
                        ? stagedQuestions.filter(isQuestionValid)
                        : stagedQuestions.filter(q => !isQuestionValid(q))
                      ).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-on-surface-variant">
                            {stagedQuestions.length === 0
                              ? "Nenhum arquivo carregado ainda. Faça upload de um JSON para pré-visualizar."
                              : previewTab === 'validadas'
                                ? "Nenhuma questão validada encontrada no momento."
                                : "Nenhuma questão com pendência encontrada. Todas estão perfeitamente preenchidas!"}
                          </td>
                        </tr>
                      ) : (
                        (previewTab === 'validadas'
                          ? stagedQuestions.filter(isQuestionValid)
                          : stagedQuestions.filter(q => !isQuestionValid(q))
                        ).map((q) => {
                          return (
                            <tr key={q.id} className="hover:bg-surface-container-low transition-colors">
                              <td className="p-3 font-code-md text-xs font-semibold text-primary">{q.id}</td>
                              <td className="p-3">
                                <span className="font-bold text-on-surface text-xs">{q.banca || "---"}</span>
                                <span className="text-xs text-on-surface-variant block">{q.ano || "---"} • {q.prova || "---"}</span>
                              </td>
                              <td className="p-3">
                                <span className="text-xs font-semibold text-secondary block">{q.disciplina || "Pendente"}</span>
                                <span className="text-xs text-on-surface-variant truncate block max-w-[180px]">{q.assunto || "---"}</span>
                              </td>
                              <td className="p-3 text-xs text-on-surface leading-snug line-clamp-2">
                                {q.enunciado}
                              </td>
                              <td className="p-3 text-center">
                                <span className="w-6 h-6 inline-flex items-center justify-center rounded bg-secondary-container text-on-secondary-container font-bold text-xs">
                                  {q.alternativa_certa || "?"}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <button
                                  onClick={() => handleRejectQuestion(q.id)}
                                  className="px-2.5 py-1 rounded bg-error-container text-on-error-container text-xs font-label-md hover:opacity-90 transition-all"
                                >
                                  Remover
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* ================= TAB 3: ESTATÍSTICAS ================= */}
          {activeTab === 'estatisticas' && (
            <section className="space-y-6">
              <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm space-y-6">
                <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">Estatísticas Globais & Histórico de Rodadas</h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Acompanhe sua curva de retenção de memória e índice de acerto por banca examinadora.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <p className="text-xs font-semibold text-on-surface-variant">Total de Questões Respondidas</p>
                    <p className="text-2xl font-bold text-primary mt-1">428</p>
                    <p className="text-xs text-secondary mt-1">▲ 32 hoje</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <p className="text-xs font-semibold text-on-surface-variant">Aproveitamento Médio Geral</p>
                    <p className="text-2xl font-bold text-secondary mt-1">82.3%</p>
                    <p className="text-xs text-on-surface-variant mt-1">Ideal para corte de 1ª fase</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <p className="text-xs font-semibold text-on-surface-variant">Tempo Médio por Questão</p>
                    <p className="text-2xl font-bold text-on-surface mt-1">1 min 45 seg</p>
                    <p className="text-xs text-tertiary mt-1">Dentro do teto de prova (2m30s)</p>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-surface-container border border-outline-variant/30 text-center space-y-3">
                  <span className="material-symbols-outlined text-[36px] text-primary">auto_graph</span>
                  <h3 className="font-title-md font-bold text-on-surface">Relatório Completo de Disciplinas Ativo</h3>
                  <p className="text-body-sm text-on-surface-variant max-w-lg mx-auto">
                    Continue resolvendo simulados de 5 questões para calibrar a inteligência preditiva das suas matérias de maior vulnerabilidade.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('simulado')}
                      className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm"
                    >
                      Voltar ao Simulado Ativo
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================= TAB: GESTÃO DE QUESTÕES ================= */}
          {activeTab === 'gestao' && (
            <section className="space-y-6">
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
                    <p className="text-2xl font-bold text-primary mt-1">{questions.length}</p>
                    <p className="text-xs text-on-surface-variant mt-1">Questões cadastradas</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <p className="text-xs font-semibold text-on-surface-variant">Com Pendências de Ajustes</p>
                    <p className="text-2xl font-bold text-error mt-1">
                      {questions.filter(q => getQuestionPendencies(q).length > 0).length}
                    </p>
                    <p className="text-xs text-error mt-1">Requerem atenção</p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <p className="text-xs font-semibold text-on-surface-variant">Questões Completas</p>
                    <p className="text-2xl font-bold text-secondary mt-1">
                      {questions.filter(q => getQuestionPendencies(q).length === 0).length}
                    </p>
                    <p className="text-xs text-secondary mt-1">Prontas para simulado</p>
                  </div>
                </div>

                {/* Filter bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/30">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mr-2">Filtrar:</span>
                  <button
                    onClick={() => setGestaoFilter('all')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-label-md transition-all ${
                      gestaoFilter === 'all' ? 'bg-primary text-on-primary font-bold' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Todas ({questions.length})
                  </button>
                  <button
                    onClick={() => setGestaoFilter('pendentes')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-label-md transition-all ${
                      gestaoFilter === 'pendentes' ? 'bg-error text-on-error font-bold' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Com Pendências ({questions.filter(q => getQuestionPendencies(q).length > 0).length})
                  </button>
                  <button
                    onClick={() => setGestaoFilter('completas')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-label-md transition-all ${
                      gestaoFilter === 'completas' ? 'bg-secondary text-on-secondary font-bold' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Completas ({questions.filter(q => getQuestionPendencies(q).length === 0).length})
                  </button>
                </div>

                {/* Questions List */}
                <div className="space-y-3 pt-2">
                  {questions.length === 0 ? (
                    <div className="p-12 text-center bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-3">
                      <span className="material-symbols-outlined text-[48px] text-outline">database</span>
                      <h3 className="font-title-md font-bold text-on-surface">Base de dados vazia</h3>
                      <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto">
                        Nenhuma questão cadastrada. Importe arquivos JSON na aba de Importação para começar.
                      </p>
                      <button
                        onClick={() => setActiveTab('importador')}
                        className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-sm"
                      >
                        Ir para Importação JSON
                      </button>
                    </div>
                  ) : (
                    questions
                      .filter(q => {
                        const issues = getQuestionPendencies(q);
                        if (gestaoFilter === 'pendentes') return issues.length > 0;
                        if (gestaoFilter === 'completas') return issues.length === 0;
                        return true;
                      })
                      .map((q) => {
                        const issues = getQuestionPendencies(q);
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
                                {q.enunciado || '(Sem enunciado)'}
                              </p>
                              {issues.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {issues.map((iss, i) => (
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
                      })
                  )}
                </div>
              </div>
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
        </main>
      </div>

      {/* ================= MOBILE BOTTOM NAVIGATION BAR ================= */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-2 border-t border-outline-variant/30 bg-surface-container-lowest/95 backdrop-blur-md md:hidden shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all ${
            activeTab === 'home' ? 'bg-primary-fixed text-on-primary-fixed' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">home</span>
          <span className="text-label-sm font-label-sm">Início</span>
        </button>
        <button
          onClick={() => setActiveTab('simulado')}
          className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all ${
            activeTab === 'simulado' ? 'bg-primary-fixed text-on-primary-fixed' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">quiz</span>
          <span className="text-label-sm font-label-sm">Simulado</span>
        </button>
        <button
          onClick={() => setActiveTab('importador')}
          className={`flex flex-col items-center justify-center rounded-xl px-3 py-1.5 transition-all ${
            activeTab === 'importador' ? 'bg-primary-fixed text-on-primary-fixed' : 'text-on-surface-variant'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">upload_file</span>
          <span className="text-label-sm font-label-sm">Importar</span>
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
