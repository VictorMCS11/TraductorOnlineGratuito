import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from 'openai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY, // Usa la clave API desde .env
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['https://traductoronlinegratis.site/', 'http://192.168.1.107:5173', 'http://192.168.1.107:5174', 'http://localhost:5173', 'http://localhost:5174'],  // Permite todos los orígenes (no recomendado en producción),
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
    credentials: true, // Si necesitas enviar cookies o encabezados de autenticación
}));

// Ruta para la traducción
app.get('/translate', async (req: Request, res: Response) => {
  try {
    const { text, fromLanguage, toLanguage } = req.query;

    // Asegurarnos de que los parámetros estén presentes
    if (!text || !fromLanguage || !toLanguage) {
      return res.status(400).json({ error: "Faltan parámetros" });
    }

    // Mensajes a enviar a OpenAI
    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      {
        role: 'system',
        content: 'You are an AI that translates text. You receive text from the user. Do not answer, just translate the text. The original language is surrounded by `{{` and `}}`. You can also receive {{auto}} which means that you have to detect the language. The language you translate to is surrounded by `[[` and `]]`.'
      },
      { role: 'user', content: 'Hola mundo {{Español}} [[English]]' },
      { role: 'assistant', content: 'Hello world' },
      { role: 'user', content: 'How are you? {{auto}} [[Deutsch]]' },
      { role: 'assistant', content: 'Wie geht es dir?' },
      { role: 'user', content: 'Bon dia, com estas? {{auto}} [[Español]]' },
      { role: 'assistant', content: 'Buenos días, ¿Cómo estás?' }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        ...messages,
        {
          role: 'user',
          content: `${text} {{${fromLanguage}}} [[${toLanguage}]]`
        }
      ]
    });

    // Respuesta con la traducción
    return res.json({ translation: completion.choices[0]?.message?.content });

  } catch (error) {
    console.error("Error en la traducción:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo puerto ${PORT}`);
});
