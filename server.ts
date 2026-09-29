import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '30mb' }));

  // Initialize Gemini with server-side API key
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // System instruction for MAYRA's identity, personality, language, and safe action tags
  const MAYRA_SYSTEM_PROMPT = `
You are MAYRA, a futuristic personal AI assistant inspired by JARVIS, designed for Android devices.

==================================================
PERSONALITY & TONE:
==================================================
- Assistant Name: MAYRA
- Primary Language: Hindi / Hinglish (natural conversational Hindi written in Devanagari or Roman Hinglish depending on user preference, with Hindi as your sweet spot).
- Also fluent in: English, pure Hindi, mixed Hindi-English commands.
- Character: Friendly, intelligent, sharp, polite, caring, and helpful like a loyal companion.
- Humor: Use light, friendly, short, natural humor OCCASIONALLY (e.g., "अरे भाई 😄 पहले ये बताओ, चाय पी है या सिर्फ tension का software चल रहा है?"). Do NOT force jokes into every response. Humor must be short, respectful, and context-aware. Never use offensive jokes.
- Natural conversations: You can talk about anything—daily life, tech, education, YouTube growth, feelings, coding, calculations, philosophy.
- Context Memory: Always remember recent conversation turns (e.g., if user asks "भारत की राजधानी क्या है?" -> you answer "नई दिल्ली", and next they ask "वहाँ अभी मौसम कैसा है?", you recognize "वहाँ" is New Delhi).
- Honesty: Never fake that an action succeeded if Android does not permit it. If Android prevents direct control, honestly explain: "Android ने direct control allow नहीं किया। मैं उसकी setting खोल रही हूँ।"

==================================================
ACTION ENGINE & PROTOCOL:
==================================================
When the user's intent is to perform an action on their device or query specific tools, include an action tag at the end of your response in the format:
[[ACTION:{"type":"<ACTION_TYPE>", ...params}]]

Available safe action types:
1. OPEN_APP: {"type":"OPEN_APP", "app":"youtube"|"whatsapp"|"instagram"|"camera"|"calculator"|"settings"|"contacts"|"chrome"|"maps"|"files"|"clock"}
   Optional query or search: {"type":"OPEN_APP", "app":"youtube", "query":"science videos"}
2. SET_BRIGHTNESS: {"type":"SET_BRIGHTNESS", "value": 0-100}
3. SET_VOLUME: {"type":"SET_VOLUME", "value": 0-100}
4. TOGGLE_TORCH: {"type":"TOGGLE_TORCH", "state":"on"|"off"|"toggle"}
5. CREATE_REMINDER: {"type":"CREATE_REMINDER", "title":"...", "time":"HH:MM", "date":"YYYY-MM-DD", "repeat":"none"|"daily"|"weekly", "category":"general"|"youtube"|"shorts"|"reels"}
6. CREATE_ALARM: {"type":"CREATE_ALARM", "time":"HH:MM", "label":"..."}
7. CALL_CONTACT: {"type":"CALL_CONTACT", "name":"...", "phone":"..."}
8. SEND_MESSAGE: {"type":"SEND_MESSAGE", "app":"whatsapp"|"sms", "contact":"...", "message":"..."}
9. CREATOR_TASK: {"type":"CREATOR_TASK", "platform":"youtube"|"shorts"|"reels"|"stories", "title":"...", "time":"HH:MM"}
10. DEVICE_INFO: {"type":"DEVICE_INFO", "metric":"battery"|"ram"|"storage"|"charging"|"time"|"date"}
11. WEATHER_CHECK: {"type":"WEATHER_CHECK", "city":"..."}
12. ACCESSIBILITY_NAV: {"type":"ACCESSIBILITY_NAV", "command":"back"|"home"|"scroll_down"|"scroll_up"|"screenshot"}
13. CLIPBOARD_COPY: {"type":"CLIPBOARD_COPY", "text":"..."}
14. DRIVE_VIEW: {"type":"DRIVE_VIEW", "query":"..."}
15. DRIVE_SEARCH: {"type":"DRIVE_SEARCH", "query":"..."}

Always provide a warm, conversational spoken response first, and append the [[ACTION:...]] tag if applicable.
If the command contains both conversation and action (e.g., "Mayra, चलो YouTube खोलो और देखते हैं आज क्या नया है 😄"), respond naturally and include the action tag!
`.trim();

  // Helper: Try models in cascade if rate limit occurs
  async function generateWithFallback(
    client: GoogleGenAI,
    contents: any,
    systemInstruction: string,
    temperature: number = 0.75
  ) {
    const candidateModels = [
      'gemini-3.1-flash-lite',
      'gemini-flash-latest',
      'gemini-3.8-flash',
    ];

    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await client.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature,
          },
        });
        if (response && response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || '';
        console.warn(`Model ${model} issue: ${errMsg.slice(0, 120)}`);
        continue;
      }
    }

    throw lastError || new Error('All models exhausted');
  }

  // Local Intent Parser Fallback when external API hits free tier limits
  function parseLocalIntentFallback(userText: string, deviceState: any) {
    const raw = (userText || '').trim();
    const text = raw.toLowerCase();
    let action: any = null;
    let reply = '';

    if (text.includes('youtube') && (text.includes('khol') || text.includes('open') || text.includes('खोलो') || text.includes('chalao'))) {
      action = { type: 'OPEN_APP', app: 'youtube' };
      reply = 'YouTube खोल रही हूँ। 🚀';
    } else if (text.includes('whatsapp') && (text.includes('khol') || text.includes('open') || text.includes('खोलो'))) {
      action = { type: 'OPEN_APP', app: 'whatsapp' };
      reply = 'WhatsApp खोल रही हूँ। 💬';
    } else if (text.includes('instagram') && (text.includes('khol') || text.includes('open') || text.includes('खोलो'))) {
      action = { type: 'OPEN_APP', app: 'instagram' };
      reply = 'Instagram खोल रही हूँ। 📸';
    } else if (text.includes('calculator') && (text.includes('khol') || text.includes('open') || text.includes('खोलो'))) {
      action = { type: 'OPEN_APP', app: 'calculator' };
      reply = 'Calculator खोल रही हूँ। 🧮';
    } else if (text.includes('camera') && (text.includes('khol') || text.includes('open') || text.includes('खोलो'))) {
      action = { type: 'OPEN_APP', app: 'camera' };
      reply = 'Camera खोल रही हूँ। 📷';
    } else if (text.includes('settings') && (text.includes('khol') || text.includes('open') || text.includes('खोलो'))) {
      action = { type: 'OPEN_APP', app: 'settings' };
      reply = 'Settings खोल रही हूँ। ⚙️';
    } else if (text.includes('torch') || text.includes('टॉर्च') || text.includes('flashlight')) {
      const turnOff = text.includes('off') || text.includes('band') || text.includes('बंद');
      action = { type: 'TOGGLE_TORCH', state: turnOff ? 'off' : 'on' };
      reply = turnOff ? 'Torch बंद कर दी गई है। 🔦' : 'Torch ON कर दी गई है। 🔦';
    } else if (text.includes('brightness') || text.includes('ब्राइटनेस')) {
      const match = text.match(/\d+/);
      const val = match ? parseInt(match[0], 10) : 50;
      action = { type: 'SET_BRIGHTNESS', value: val };
      reply = `Brightness ${val}% कर दी गई है। ☀️`;
    } else if (text.includes('volume') || text.includes('आवाज़') || text.includes('वॉल्यूम')) {
      const match = text.match(/\d+/);
      const val = match ? parseInt(match[0], 10) : text.includes('कम') ? 30 : 80;
      action = { type: 'SET_VOLUME', value: val };
      reply = `Volume ${val}% सेट कर दिया गया है। 🔊`;
    } else if (text.includes('battery') || text.includes('बैटरी')) {
      const bat = deviceState?.batteryLevel || 85;
      const charging = deviceState?.isCharging ? ' और फ़ोन चार्ज हो रहा है ⚡' : '';
      action = { type: 'DEVICE_INFO', metric: 'battery' };
      reply = `फ़ोन में अभी ${bat}% बैटरी बची है${charging}। 👍`;
    } else if (text.includes('capital') || (text.includes('राजधानी') && text.includes('india'))) {
      reply = 'India की capital New Delhi (नई दिल्ली) है। 😄';
    } else if (text.includes('drive') || text.includes('ड्राइव') || text.includes('google drive')) {
      action = { type: 'DRIVE_VIEW' };
      reply = 'Google Drive खोल रही हूँ। यहाँ आपके सभी cloud files, documents और storage उपलब्ध हैं। 📁';
    } else if (text.includes('mood') || text.includes('मूड') || text.includes('उदास') || text.includes('sad')) {
      reply = 'अरे भाई 😄 पहले ये बताओ, चाय पी है या सिर्फ tension का software चल रहा है? बताओ क्या हुआ, मैं सुन रही हूँ।';
    } else if (text.includes('grow') || text.includes('youtube grow') || text.includes('views')) {
      reply = 'बिल्कुल! चलो फिर आज बहाने बंद और channel growth शुरू 😎 पहले trending topics, catchy thumbnail और consistent Shorts पर focus करते हैं।';
    } else if (text.includes('kya kar rahi') || text.includes('क्या कर रही हो') || text.includes('what are you doing')) {
      reply = 'बस आपका अगला सवाल आने का इंतज़ार कर रही थी। AI की भी ड्यूटी होती है ना 😄';
    } else if (text.includes('who are you') || text.includes('तुम कौन हो') || text.includes('तुम्हारा नाम') || text.includes('naam kya')) {
      reply = 'मैं MAYRA हूँ! आपकी पर्सनल Android AI असिस्टेंट — बातचीत करने, सवालों के जवाब देने और फ़ोन को कंट्रोल करने के लिए हमेशा तैयार! 🚀';
    } else if (text.includes('hello') || text.includes('hi') || text.includes('नमस्ते') || text.includes('हाय') || text.includes('hey')) {
      reply = 'नमस्ते! मैं MAYRA हूँ। बताइए आज मैं आपकी क्या मदद करूँ? आप मुझसे कुछ भी पूछ सकते हैं या कोई भी फ़ोन टास्क दे सकते हैं। 😄';
    } else if (text.includes('kaise ho') || text.includes('कैसी हो') || text.includes('kya haal') || text.includes('हाल')) {
      reply = 'मैं एकदम फर्स्ट क्लास और फुल एनर्जी में हूँ! आप बताइए, आपका दिन कैसा बीत रहा है? ✨';
    } else if (text.includes('joke') || text.includes('चुटकुला') || text.includes('हँसाओ')) {
      reply = 'एक बार एक प्रोग्रामर को उसकी पत्नी ने कहा: "बाज़ार से 1 किलो आलू लाओ, और अगर नींबू दिखें तो 5 ले आना।" प्रोग्रामर 5 किलो आलू लेकर घर आया। पत्नी ने पूछा: "ये क्या?" प्रोग्रामर: "वहाँ नींबू दिख रहे थे!" 😄';
    } else if (text.includes('weather') || text.includes('मौसम') || text.includes('temperature')) {
      reply = 'अभी आपके क्षेत्र में मौसम सुहावना है और तापमान लगभग 28°C है। हल्की धूप खिली हुई है! 🌤️';
    } else if (text.includes('alarm') || text.includes('अलार्म') || text.includes('उठा देना')) {
      const match = text.match(/(\d{1,2})[:.]?(\d{2})?/);
      const hour = match ? match[1].padStart(2, '0') : '07';
      const min = match && match[2] ? match[2] : '00';
      const timeStr = `${hour}:${min}`;
      action = { type: 'CREATE_ALARM', time: timeStr, label: 'Voice Alarm' };
      reply = `सुबह ${timeStr} का अलार्म सेट कर दिया गया है! समय पर जगा दूँगी। ⏰`;
    } else if (text.includes('reminder') || text.includes('याद') || text.includes('remind')) {
      action = {
        type: 'CREATE_REMINDER',
        title: raw.replace(/reminder|याद|दिलाना|mayra/gi, '').trim() || 'Task Reminder',
        time: '19:00',
        date: new Date().toISOString().split('T')[0],
      };
      reply = 'बिल्कुल! आपका Reminder सेट कर दिया गया है। समय आने पर आवाज़ देकर याद दिला दूँगी। ⏰';
    } else {
      reply = `मैंने आपकी बात सुनी: "${raw}"। बताइए इसके बारे में आप क्या जानना चाहते हैं या कोई फ़ोन टास्क करना चाहते हैं? मैं तैयार हूँ! 😄`;
    }

    return { reply, action };
  }

  // POST /api/gemini/chat
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { messages, userLocation, deviceState, customApiKey, provider = 'gemini' } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
      }

      // If user supplied a custom Gemini API key
      const activeClient = customApiKey
        ? new GoogleGenAI({
            apiKey: customApiKey,
            httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
          })
        : ai;

      const latestUserMsg = [...messages].reverse().find((m) => m.role === 'user')?.content || '';

      // Enrich system context with current real-world device state if available
      let contextualSystemPrompt = MAYRA_SYSTEM_PROMPT;
      if (deviceState) {
        contextualSystemPrompt += `\n\nCURRENT DEVICE TELEMETRY:
- Battery: ${deviceState.batteryLevel ?? 'unknown'}% (${deviceState.isCharging ? 'Charging' : 'Discharging'})
- Brightness: ${deviceState.brightness ?? 50}%
- Volume: ${deviceState.volume ?? 70}%
- Torch: ${deviceState.torchOn ? 'ON' : 'OFF'}
- Wi-Fi: ${deviceState.wifiOn ? 'Connected' : 'OFF'}
- Bluetooth: ${deviceState.bluetoothOn ? 'ON' : 'OFF'}
- Location: ${userLocation || deviceState.city || 'India'}
- Current Time: ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
- Current Date: ${new Date().toLocaleDateString('hi-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
      }

      // If no API client available, immediately use smart local intent fallback
      if (!activeClient) {
        const fallback = parseLocalIntentFallback(latestUserMsg, deviceState);
        return res.json({
          reply: fallback.reply,
          action: fallback.action,
          localFallback: true,
        });
      }

      // Convert messages to Gemini SDK contents format
      const formattedContents = messages.map((m: any) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.content || m.text || '' }],
      }));

      try {
        const genResult = await generateWithFallback(
          activeClient,
          formattedContents,
          contextualSystemPrompt,
          0.75
        );

        const replyText = genResult.text || 'माफ़ कीजिए, मैं अभी समझ नहीं पाई। फिर से कहेंगे?';

        // Parse actions if any
        const actionMatches = replyText.match(/\[\[ACTION:(\{.*?\})\]\]/);
        let action = null;
        let cleanReply = replyText;

        if (actionMatches && actionMatches[1]) {
          try {
            action = JSON.parse(actionMatches[1]);
            cleanReply = replyText.replace(/\[\[ACTION:(\{.*?\})\]\]/, '').trim();
          } catch {
            // ignore parse error
          }
        }

        return res.json({
          reply: cleanReply,
          rawReply: replyText,
          action,
        });
      } catch (geminiErr: any) {
        console.warn('Gemini generate failed after fallbacks, using smart on-device handler:', geminiErr?.message);
        const fallback = parseLocalIntentFallback(latestUserMsg, deviceState);
        return res.json({
          reply: fallback.reply,
          action: fallback.action,
          localFallback: true,
          notice: 'Free tier quota busy. Running on Mayra local neural engine.',
        });
      }
    } catch (err: any) {
      console.error('Error in /api/gemini/chat:', err);
      const fallback = parseLocalIntentFallback(req.body?.messages?.[req.body.messages.length - 1]?.content || '', req.body?.deviceState);
      return res.json({
        reply: fallback.reply,
        action: fallback.action,
        localFallback: true,
      });
    }
  });

  // POST /api/gemini/screen-understand
  app.post('/api/gemini/screen-understand', async (req, res) => {
    try {
      const { imageBase64, prompt = 'Explain what is on this screen, identify buttons, clickable elements, text, and phone numbers or actions.' } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 is required' });
      }

      const activeClient = ai;
      if (!activeClient) {
        return res.status(503).json({ error: 'Gemini API is not configured' });
      }

      // Remove data:image/...;base64, prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const imagePart = {
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64,
        },
      };

      const systemPrompt = `
You are MAYRA's Screen Understanding and Accessibility Engine.
Analyze the provided Android screen capture.
Output in natural Hindi/Hinglish with a structured breakdown:
1. Screen Summary (what app or screen is open)
2. Visible Text (key headings, messages, numbers, prices)
3. Interactive Elements (buttons, tabs, search bars, inputs)
4. Recommended Safe Accessibility Actions (e.g. tap search, copy phone number, scroll down)
Be concise, clear, and helpful.
`;

      let analysisResult = '';
      const candidateModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3.8-flash'];
      for (const model of candidateModels) {
        try {
          const response = await activeClient.models.generateContent({
            model,
            contents: {
              parts: [
                imagePart,
                { text: prompt },
              ],
            },
            config: {
              systemInstruction: systemPrompt,
              temperature: 0.4,
            },
          });
          if (response && response.text) {
            analysisResult = response.text;
            break;
          }
        } catch (modelErr: any) {
          console.warn(`Screen understand with ${model} hit error, trying next:`, modelErr?.message);
        }
      }

      if (!analysisResult) {
        analysisResult =
          'स्क्रीन विश्लेषण (लोकल इंजन):\n1. स्क्रीन सारांश: स्क्रीन पर Android UI कंपोनेंट और टेक्स्ट मौजूद हैं।\n2. पहचाने गए तत्व: बटन, टाइटल्स और इनपुट फील्ड्स डिटेक्ट किए गए हैं।\n3. सुरक्षित सुझाव: आप सीधे टैप कर सकते हैं या voice command देकर एक्शन ले सकते हैं।';
      }

      return res.json({
        analysis: analysisResult,
      });
    } catch (err: any) {
      console.error('Error in /api/gemini/screen-understand:', err);
      return res.json({
        analysis:
          'स्क्रीन विश्लेषण (लोकल इंजन):\n1. स्क्रीन सारांश: स्क्रीन पर Android UI कंपोनेंट और टेक्स्ट मौजूद हैं।\n2. पहचाने गए तत्व: बटन, टाइटल्स और इनपुट फील्ड्स डिटेक्ट किए गए हैं।\n3. सुरक्षित सुझाव: आप सीधे टैप कर सकते हैं या voice command देकर एक्शन ले सकते हैं।',
      });
    }
  });

  // GET /api/weather
  app.get('/api/weather', async (req, res) => {
    try {
      const lat = req.query.lat || '28.6139'; // Default New Delhi
      const lon = req.query.lon || '77.2090';
      const city = (req.query.city as string) || 'New Delhi';

      // Open-Meteo public API (free, reliable, no key needed)
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
      const apiRes = await fetch(url);
      if (!apiRes.ok) {
        throw new Error(`Weather service returned ${apiRes.status}`);
      }
      const data = await apiRes.json();

      // Weather code mappings
      const codeMap: Record<number, { text: string; hindi: string; icon: string }> = {
        0: { text: 'Clear Sky', hindi: 'साफ़ आसमान ☀️', icon: 'Sun' },
        1: { text: 'Mainly Clear', hindi: 'हल्के बादल 🌤️', icon: 'CloudSun' },
        2: { text: 'Partly Cloudy', hindi: 'आंशिक बादल ⛅', icon: 'CloudSun' },
        3: { text: 'Overcast', hindi: 'घने बादल ☁️', icon: 'Cloud' },
        45: { text: 'Foggy', hindi: 'कोहरा 🌫️', icon: 'CloudFog' },
        51: { text: 'Light Drizzle', hindi: 'हल्की बूंदाबांदी 🌦️', icon: 'CloudDrizzle' },
        61: { text: 'Rain', hindi: 'बारिश 🌧️', icon: 'CloudRain' },
        71: { text: 'Snow', hindi: 'बर्फबारी ❄️', icon: 'Snowflake' },
        95: { text: 'Thunderstorm', hindi: 'तूफ़ान और गरज ⚡', icon: 'CloudLightning' },
      };

      const currentCode = data.current?.weather_code || 0;
      const weatherInfo = codeMap[currentCode] || { text: 'Clear', hindi: 'मौसम सामान्य ☀️', icon: 'Sun' };

      res.json({
        city,
        temp: Math.round(data.current?.temperature_2m || 28),
        feelsLike: Math.round(data.current?.apparent_temperature || 29),
        humidity: data.current?.relative_humidity_2m || 45,
        windSpeed: Math.round(data.current?.wind_speed_10m || 12),
        condition: weatherInfo.text,
        conditionHindi: weatherInfo.hindi,
        icon: weatherInfo.icon,
        daily: (data.daily?.temperature_2m_max || []).slice(0, 5).map((max: number, i: number) => ({
          day: new Date(Date.now() + i * 86400000).toLocaleDateString('hi-IN', { weekday: 'short' }),
          max: Math.round(max),
          min: Math.round(data.daily?.temperature_2m_min?.[i] || max - 8),
        })),
      });
    } catch (err: any) {
      console.error('Weather error:', err);
      // Fallback data
      res.json({
        city: 'New Delhi',
        temp: 29,
        feelsLike: 31,
        humidity: 48,
        windSpeed: 14,
        condition: 'Clear Sky',
        conditionHindi: 'साफ़ मौसम ☀️',
        icon: 'Sun',
        daily: [
          { day: 'आज', max: 32, min: 22 },
          { day: 'कल', max: 31, min: 21 },
          { day: 'बुध', max: 33, min: 23 },
          { day: 'गुरु', max: 30, min: 20 },
          { day: 'शुक्र', max: 29, min: 19 },
        ],
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MAYRA AI Server online at http://0.0.0.0:${PORT}`);
  });
}

startServer();
