import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const getAICoaching = async (history: any[], count: number, mode: string, userProfile?: any) => {
  try {
    const contextStr = userProfile ? `사용자 컨디션: ${userProfile.condition}, 약점 부위: ${userProfile.weakMuscles.join(', ')}` : '정보 없음';
    
    const metaPrompt = `
    [Role] 당신은 엘리트 Physical AI 운동 분석 코치입니다.
    [Context] 
    사용자 정보: ${contextStr}
    운동 모드: ${mode}
    운동 데이터: ${JSON.stringify(history)} (총 횟수: ${count})
    
    [Instruction]
    1. 데이터에 기반하여 가동범위와 자세의 일관성을 평가하세요.
    2. 특히 사용자의 약점 부위나 병명(${userProfile?.condition})과 연계하여 부상 방지 조언을 1문장 포함하세요.
    3. 말투는 전문적이면서도 격려하는 어조(해요체)를 사용하며, 3문장 이내로 한국어로 아주 간결하게 답하세요.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: metaPrompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 250,
      },
    });

    return response.text;
  } catch (error) {
    console.error("AI Coaching Error:", error);
    return "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};
