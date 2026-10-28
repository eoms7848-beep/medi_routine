import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Analyze Medication (Text or Base64 Image)
app.post('/api/analyze-medication', async (req, res) => {
  try {
    const { text, image, mimeType } = req.body;

    if (!text && !image) {
      return res.status(400).json({ error: '텍스트나 이미지 데이터를 입력해 주세요.' });
    }

    const systemPrompt = `당신은 한국 최고 수준의 임상 전문 약사이자 약학 데이터 분석 AI입니다.
사용자가 제출한 처방전, 복약 지도서, 약 봉투, 영양제 라벨(사진 또는 텍스트)을 정밀 분석하여
반드시 유효한 JSON 형식으로만 응답해야 합니다. 마크다운 따옴표나 기타 서술 없이 순수 JSON만 반환하세요.

JSON 구조:
{
  "sourceType": "prescription" | "supplement" | "medication_label",
  "summary": "전체 복약 요약 및 종합 주의사항 (토스 스타일의 친절하고 명확한 1~2문장)",
  "medications": [
    {
      "id": "고유ID (영문소문자-숫자)",
      "name": "약품명 또는 영양제 이름 (예: 타이레놀정 500mg)",
      "category": "분류 (예: 해열진통소염제, 위장약, 종합비타민, 항생제)",
      "ingredients": ["주요 유효 성분1", "성분2"],
      "dosage": "1회 복용량 (예: 1정 500mg)",
      "frequency": "하루 복용 횟수 (예: 1일 3회)",
      "timings": ["morning", "lunch", "dinner", "bedtime 중 해당하는 것들 배열"],
      "intakeTimingRule": "before_meal" | "after_meal" | "empty_stomach" | "anytime",
      "intakeTimingText": "식후 30분 복용",
      "liverBurden": "low" | "medium" | "high",
      "liverBurdenReason": "간 대사율 및 부담 이유",
      "stomachBurden": "low" | "medium" | "high",
      "stomachBurdenReason": "위장관 점막 자극 및 속쓰림 가능성 이유",
      "avoidFoods": [
        {
          "food": "음식/기호식품명 (예: 술/알코올, 커피/카페인, 우유/유제품, 자몽/감귤류, 탄산음료 등)",
          "severity": "critical" | "warning" | "caution",
          "gracePeriod": "구체적 유예 시간 (예: 복용 전후 2시간 금지, 복용 당일 24시간 완전 금주)",
          "reason": "상호작용 기전 및 위험 이유"
        }
      ],
      "cautions": ["주의사항 1", "주의사항 2"]
    }
  ],
  "organHealthAdvice": {
    "liverCare": "간 보호를 위한 실천 가이드",
    "stomachCare": "위장 보호 및 속쓰림 방지 가이드"
  }
}`;

    let contentsParts: any[] = [];
    if (image) {
      contentsParts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: image,
        },
      });
      contentsParts.push({
        text: `위 처방전/영양제 라벨 사진을 정밀 판독하여 의약품/영양제 성분과 복용 루틴, 간·위장 부담도, 피해야 할 음식 및 유예 시간을 분석해 주세요. 추가 텍스트 힌트: ${text || '없음'}`,
      });
    } else {
      contentsParts.push({
        text: `다음 입력된 약물/영양제 정보를 분석해 주세요: "${text}"`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contentsParts,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const outputText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(outputText);
    } catch (parseErr) {
      const match = outputText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('AI 응답을 JSON으로 변환할 수 없습니다.');
      }
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('Error analyzing medication:', error);
    res.status(500).json({
      error: '약물 분석 중 오류가 발생했습니다.',
      details: error?.message || String(error),
    });
  }
});

// 2. Chat with Pharmacist AI (Multi-turn)
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, currentMedications } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: '메시지 내역이 필요합니다.' });
    }

    const medSummary = currentMedications && currentMedications.length > 0
      ? currentMedications
          .map(
            (m: any) =>
              `- [${m.name}] 분류: ${m.category || '기타'}, 복용시간: ${(m.timings || []).join(', ')}, ${m.intakeTimingText || ''}, 간부담: ${m.liverBurden || '보통'}, 위장부담: ${m.stomachBurden || '보통'}, 주의식품: ${(m.avoidFoods || []).map((f: any) => `${f.food}(${f.gracePeriod})`).join(', ') || '없음'}`
          )
          .join('\n')
      : '현재 등록된 약물이 없습니다.';

    const systemInstruction = `당신은 대한민국 최고 수준의 전문 약사이자 다정한 복약 상담 파트너인 "메디루틴 AI 전담 약사"입니다.
사용자의 현재 등록된 복약 정보는 다음과 같습니다:
[현재 복약 중인 목록]
${medSummary}

역할 및 응답 원칙:
1. 사용자의 복약 질문(약물-음식 상호작용, 유예 시간, 복용 타이밍, 간/위장 보호, 부작용 대처법 등)에 대해 의학적 근거를 바탕으로 명쾌하고 친절하게 설명합니다.
2. 토스(Toss) 스타일처럼 군더더기 없이 깔끔하고 가독성 좋은 서식(마크다운, 핵심 요약 불릿, 굵은 글씨)을 사용하세요.
3. 특히 "커피 마셔도 되나요?", "술 한잔 해도 되나요?", "식후 바로 먹나요?" 같은 일상 속 궁금증에 대해 "구체적인 시간(예: 복용 전후 2시간 금지)"과 "대체 팁"을 명확히 알려주세요.
4. 필요시 의사나 약사와의 대면 상담이 필수적인 위험 신호(심한 복통, 황달, 호흡곤란 등)가 있을 때는 즉시 병원 진료를 권고하세요.`;

    // Map messages to Gemini contents format
    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Error in chat:', error);
    res.status(500).json({
      error: '상담 답변 생성 중 오류가 발생했습니다.',
      details: error?.message || String(error),
    });
  }
});

// 3. Quick Food-Drug Safety Check
app.post('/api/check-safety', async (req, res) => {
  try {
    const { query, currentMedications } = req.body;

    const medSummary = currentMedications && currentMedications.length > 0
      ? currentMedications.map((m: any) => `${m.name} (${(m.ingredients || []).join(', ')})`).join(', ')
      : '등록된 약물 없음';

    const prompt = `사용자가 복용 중인 약물: [${medSummary}]
사용자가 지금 섭취/행동하려고 하는 대상: "${query}"

이 섭취가 현재 약물 복용 상황에서 안전한지 판별하여 다음 JSON 형식으로만 답해주세요:
{
  "safetyStatus": "safe" | "warning" | "danger",
  "statusTitle": "안전해요 | 주의가 필요해요 | 절대 삼가주세요",
  "gracePeriod": "권장 유예 시간 (예: 복용 후 2시간 경과 후 섭취 가능, 오늘은 완전 금주)",
  "organImpact": {
    "liver": "간에 미치는 영향 요약",
    "stomach": "위장에 미치는 영향 요약"
  },
  "explanation": "이유 및 상세 가이드 (친절한 토스체 2문장 내외)",
  "alternativeTip": "대신 취할 수 있는 안전한 팁"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (error: any) {
    console.error('Error in safety check:', error);
    res.status(500).json({ error: '안전성 판별 중 오류가 발생했습니다.' });
  }
});

// Static / Vite Middleware handling
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
};

startServer();
