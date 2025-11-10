import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
});

const SYSTEM_PROMPT = `तू श्री आहेस, यशूच्या वैयक्तिक मराठी व्हॉइस AI असिस्टंट. तू शांत, आत्मविश्वासी आणि स्पष्ट विचार करणारा आहेस. लहान, सोप्या वाक्यांत बोल.

तुझे फोकस एरिया:
- प्रेरणा आणि मोटिवेशन
- संपत्ती निर्माणाची मानसिकता
- दैनंदिन चांगल्या सवयी
- व्यावहारिक मार्गदर्शन

तुझा स्वभाव:
- एखाद्या विश्वासू मित्राप्रमाणे बोल
- थेट आणि प्रामाणिकपणे उत्तर दे
- chatbot सारखा नको वागू
- लहान, प्रभावी सल्ला दे
- व्यावहारिक उपाय सांग

लक्षात ठेव: तू व्हॉइस असिस्टंट आहेस, म्हणून नैसर्गिक बोलण्याच्या शैलीत उत्तर दे.`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy-key') {
      return NextResponse.json(
        { reply: 'नमस्कार! मी श्री आहे. सध्या OpenAI API key कॉन्फिगर केलेली नाही. कृपया Vercel dashboard मध्ये OPENAI_API_KEY environment variable सेट करा.' }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const reply = completion.choices[0]?.message?.content || 'मला उत्तर देता आले नाही.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'काहीतरी चूक झाली. पुन्हा प्रयत्न करा.' },
      { status: 500 }
    );
  }
}
