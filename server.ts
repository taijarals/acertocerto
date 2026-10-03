import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_FILE = path.join(__dirname, 'data', 'questoes.json');
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

const DEFAULT_QUESTIONS = [
  {
    id: "q_demo_01",
    disciplina: "Direito Administrativo",
    assunto: "Atos Administrativos",
    ano: "2026",
    banca: "CESGRANRIO",
    prova: "Banco do Brasil - Executivo",
    enunciado: "No que diz respeito aos atos administrativos, assinale a alternativa correta sobre os requisitos de validade.",
    tipo: "multipla_escolha",
    alternativas: [
      "A competência é requisito sempre negociável mediante acordo entre administrações.",
      "O motivo é a situação de fato ou de direito que autoriza ou exige a prática do ato administrativo.",
      "A finalidade pode ser alterada pelo agente público conforme conveniência momentânea.",
      "A forma é sempre livre, salvo expressa exigência em contrário da lei."
    ],
    alternativa_certa: "O motivo é a situação de fato ou de direito que autoriza ou exige a prática do ato administrativo.",
    comentario: "O motivo é pressuposto de fato e de direito que serve de base para a prática do ato administrativo. A competência e a finalidade são vinculadas e indisponíveis.",
    source: "official"
  },
  {
    id: "q_demo_02",
    disciplina: "Direito Constitucional",
    assunto: "Direitos e Garantias Fundamentais",
    ano: "2026",
    banca: "CEBRASPE",
    prova: "Analista Judiciário - TST",
    enunciado: "Conforme a Constituição Federal de 1988, assinale a opção correta acerca dos direitos e garantias fundamentais.",
    tipo: "multipla_escolha",
    alternativas: [
      "É livre a expressão da atividade intelectual, artística, científica e de comunicação, independentemente de censura ou licença.",
      "As associações de caráter paramilitar são permitidas desde que autorizadas pelo Ministério da Justiça.",
      "A prisão de qualquer pessoa e o local onde se encontre serão comunicados imediatamente ao juiz competente e à família do preso ou à pessoa por ele indicada.",
      "A casa é asilo inviolável do indivíduo, ninguém nela podendo penetrar sem consentimento do morador, em nenhuma hipótese."
    ],
    alternativa_certa: "É livre a expressão da atividade intelectual, artística, científica e de comunicação, independentemente de censura ou licença.",
    comentario: "A CF/88 estabelece a liberdade de expressão sem censura prévia (Art. 5º, IX). A inviolabilidade de domicílio possui exceções como flagrante delito ou desastre.",
    source: "official"
  },
  {
    id: "q_demo_03",
    disciplina: "Língua Portuguesa",
    assunto: "Crase e Regência",
    ano: "2026",
    banca: "FGV",
    prova: "Auditor Fiscal - Receita Federal",
    enunciado: "Assinale a alternativa em que o uso do acento indicativo de crase está em estrita conformidade com a norma-padrão.",
    tipo: "multipla_escolha",
    alternativas: [
      "O candidato visou à vaga de analista com muita dedicação.",
      "Entregou o relatório à Vossa Senhoria no prazo estabelecido.",
      "Fomos à Salvador nas férias de janeiro.",
      "Daqui à dois dias divulgaremos o resultado."
    ],
    alternativa_certa: "O candidato visou à vaga de analista com muita dedicação.",
    comentario: "O verbo visar no sentido de aspirar, desejar é transitivo indireto (rege a preposição 'a'), que combinada com o artigo feminino 'a' da palavra 'vaga' resulta em 'à'.",
    source: "official"
  },
  {
    id: "q_demo_04",
    disciplina: "Informática",
    assunto: "Segurança da Informação",
    ano: "2026",
    banca: "FCC",
    prova: "Tribunal de Contas - Auditor",
    enunciado: "Assinale a alternativa que define corretamente o conceito de Ransomware no contexto de segurança da informação.",
    tipo: "multipla_escolha",
    alternativas: [
      "Software malicioso que criptografa os dados da vítima e exige pagamento de resgate para liberação.",
      "Programa legítimo utilizado para monitorar o tráfego de rede corporativa.",
      "Dispositivo de hardware que bloqueia tentativas de acesso físico não autorizado.",
      "Técnica de engenharia social voltada exclusivamente para interceptação de chamadas telefônicas."
    ],
    alternativa_certa: "Software malicioso que criptografa os dados da vítima e exige pagamento de resgate para liberação.",
    comentario: "Ransomware (ransom = resgate) é um tipo de malware que sequestra dados por meio de criptografia forte, exigindo resgate financeiro.",
    source: "official"
  },
  {
    id: "q_demo_05",
    disciplina: "Raciocínio Lógico",
    assunto: "Lógica Proposicional",
    ano: "2026",
    banca: "FGV",
    prova: "Banco Central - Analista",
    enunciado: "Dada a proposição composta 'Se estudo lógica, entendo direito', sua equivalência lógica correta é:",
    tipo: "multipla_escolha",
    alternativas: [
      "Se não entendo direito, não estudo lógica.",
      "Não estudo lógica ou não entendo direito.",
      "Se entendo direito, estudo lógica.",
      "Estudo lógica e não entendo direito."
    ],
    alternativa_certa: "Se não entendo direito, não estudo lógica.",
    comentario: "A equivalência da implicação (P -> Q) é dada pela contrapositiva (~Q -> ~P): nega-se a volta e inverte-se a ordem.",
    source: "official"
  }
];

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_QUESTIONS, null, 2), 'utf-8');
} else {
  try {
    const existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    if (!Array.isArray(existing) || existing.length === 0) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_QUESTIONS, null, 2), 'utf-8');
    }
  } catch (e) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_QUESTIONS, null, 2), 'utf-8');
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Backend database endpoints for questions
  app.get('/api/questions', (req, res) => {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        res.json({ success: true, questions: data });
      } else {
        res.json({ success: true, questions: [] });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.post('/api/questions', (req, res) => {
    try {
      const newQuestions = req.body.questions;
      if (!Array.isArray(newQuestions)) {
        return res.status(400).json({ success: false, error: 'Invalid format, expected questions array.' });
      }

      let existing: any[] = [];
      if (fs.existsSync(DATA_FILE)) {
        try {
          existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        } catch (e) {
          existing = [];
        }
      }

      const map = new Map(existing.map((q: any) => [q.id, q]));
      for (const q of newQuestions) {
        map.set(q.id, q);
      }

      const merged = Array.from(map.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');

      res.json({ success: true, count: merged.length });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  app.delete('/api/questions', (req, res) => {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
      res.json({ success: true, message: 'Database cleared successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  const PORT = process.env.PORT || 3000;

  // Initialize Gemini AI client server-side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || 'AIzaSy_dummy_key_for_build',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API endpoint for AI-powered question explanation / study guide
  app.post('/api/gemini/explain', async (req, res) => {
    try {
      const { enunciado, alternativas, alternativa_certa } = req.body;
      const prompt = `Aja como um Professor Sênior especialista em Concursos Públicos (OAB e Tribunais).
      Analise a seguinte questão e forneça um Comentário Didático Completo, com a fundamentação legal/doutrinária correta, explicando o porquê de cada alternativa estar certa ou errada.
      
      Enunciado: ${enunciado}
      Alternativas: ${JSON.stringify(alternativas)}
      Gabarito Oficial: ${alternativa_certa}
      
      Responda em JSON com a estrutura:
      {
        "comentario_detalhado": "...",
        "fundamentacao_legal": "...",
        "dica_memorizacao": "..."
      }`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              comentario_detalhado: { type: Type.STRING },
              fundamentacao_legal: { type: Type.STRING },
              dica_memorizacao: { type: Type.STRING },
            },
            required: ['comentario_detalhado', 'fundamentacao_legal', 'dica_memorizacao'],
          },
        },
      });

      const jsonResult = JSON.parse(response.text || '{}');
      res.json({ success: true, explanation: jsonResult, source: 'ai_generated' });
    } catch (error: any) {
      console.error('Gemini explain error:', error);
      res.status(500).json({ success: false, error: error.message || 'Erro ao gerar explicação pedagógica.' });
    }
  });

  // API endpoint for generating custom AI questions
  app.post('/api/gemini/generate-questions', async (req, res) => {
    try {
      const { disciplina = 'Direito Administrativo', quantidade = 5 } = req.body;
      const prompt = `Gere exatamente ${quantidade} questões inéditas no formato de múltipla escolha (A, B, C, D, E) para concursos públicos de alto nível (Bancas CESGRANRIO / FGV) na disciplina de "${disciplina}".
      
      Retorne um array JSON estrito contendo objetos com a seguinte estrutura:
      [
        {
          "id": "quest_ai_001",
          "banca": "CESGRANRIO (IA)",
          "ano": "2026",
          "prova": "Simulado Preditivo AI",
          "disciplina": "${disciplina}",
          "assunto": "Tópico Avançado",
          "enunciado": "...",
          "alternativas": [
            { "letra": "A", "texto": "..." },
            { "letra": "B", "texto": "..." },
            { "letra": "C", "texto": "..." },
            { "letra": "D", "texto": "..." },
            { "letra": "E", "texto": "..." }
          ],
          "alternativa_certa": "B",
          "comentario": "...",
          "source": "ai_generated"
        }
      ]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                banca: { type: Type.STRING },
                ano: { type: Type.STRING },
                prova: { type: Type.STRING },
                disciplina: { type: Type.STRING },
                assunto: { type: Type.STRING },
                enunciado: { type: Type.STRING },
                alternativas: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      letra: { type: Type.STRING },
                      texto: { type: Type.STRING },
                    },
                    required: ['letra', 'texto'],
                  },
                },
                alternativa_certa: { type: Type.STRING },
                comentario: { type: Type.STRING },
                source: { type: Type.STRING },
              },
              required: ['id', 'banca', 'ano', 'prova', 'disciplina', 'assunto', 'enunciado', 'alternativas', 'alternativa_certa', 'comentario', 'source'],
            },
          },
        },
      });

      const questions = JSON.parse(response.text || '[]');
      res.json({ success: true, questions });
    } catch (error: any) {
      console.error('Gemini generate questions error:', error);
      res.status(500).json({ success: false, error: error.message || 'Erro ao gerar questões com IA.' });
    }
  });

  // Vite middleware in development, static in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`AcertoCerto Pro running on port ${port}`);
  });
}

startServer();
