// server.ts
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
var __dirname = path.dirname(fileURLToPath(import.meta.url));
async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = process.env.PORT || 3e3;
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "AIzaSy_dummy_key_for_build",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
  app.post("/api/gemini/explain", async (req, res) => {
    try {
      const { enunciado, alternativas, alternativa_certa } = req.body;
      const prompt = `Aja como um Professor S\xEAnior especialista em Concursos P\xFAblicos (OAB e Tribunais).
      Analise a seguinte quest\xE3o e forne\xE7a um Coment\xE1rio Did\xE1tico Completo, com a fundamenta\xE7\xE3o legal/doutrin\xE1ria correta, explicando o porqu\xEA de cada alternativa estar certa ou errada.
      
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
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              comentario_detalhado: { type: Type.STRING },
              fundamentacao_legal: { type: Type.STRING },
              dica_memorizacao: { type: Type.STRING }
            },
            required: ["comentario_detalhado", "fundamentacao_legal", "dica_memorizacao"]
          }
        }
      });
      const jsonResult = JSON.parse(response.text || "{}");
      res.json({ success: true, explanation: jsonResult, source: "ai_generated" });
    } catch (error) {
      console.error("Gemini explain error:", error);
      res.status(500).json({ success: false, error: error.message || "Erro ao gerar explica\xE7\xE3o pedag\xF3gica." });
    }
  });
  app.post("/api/gemini/generate-questions", async (req, res) => {
    try {
      const { disciplina = "Direito Administrativo", quantidade = 5 } = req.body;
      const prompt = `Gere exatamente ${quantidade} quest\xF5es in\xE9ditas no formato de m\xFAltipla escolha (A, B, C, D, E) para concursos p\xFAblicos de alto n\xEDvel (Bancas CESGRANRIO / FGV) na disciplina de "${disciplina}".
      
      Retorne um array JSON estrito contendo objetos com a seguinte estrutura:
      [
        {
          "id": "quest_ai_001",
          "banca": "CESGRANRIO (IA)",
          "ano": "2026",
          "prova": "Simulado Preditivo AI",
          "disciplina": "${disciplina}",
          "assunto": "T\xF3pico Avan\xE7ado",
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
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
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
                      texto: { type: Type.STRING }
                    },
                    required: ["letra", "texto"]
                  }
                },
                alternativa_certa: { type: Type.STRING },
                comentario: { type: Type.STRING },
                source: { type: Type.STRING }
              },
              required: ["id", "banca", "ano", "prova", "disciplina", "assunto", "enunciado", "alternativas", "alternativa_certa", "comentario", "source"]
            }
          }
        }
      });
      const questions = JSON.parse(response.text || "[]");
      res.json({ success: true, questions });
    } catch (error) {
      console.error("Gemini generate questions error:", error);
      res.status(500).json({ success: false, error: error.message || "Erro ao gerar quest\xF5es com IA." });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`AcertoCerto Pro running on port ${PORT}`);
  });
}
startServer();
