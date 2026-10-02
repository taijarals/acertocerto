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
