import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import { NextResponse } from "next/server";

const credentials = {
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
};
const client = new TranslateClient({ 
  region: process.env.MY_AWS_REGION,
  credentials: credentials
});

async function translateText(text, sourceLang, targetLang) {
  const command = new TranslateTextCommand({
    Text: text,
    SourceLanguageCode: sourceLang, // 원본 언어 (예: "en")
    TargetLanguageCode: targetLang, // 대상 언어 (예: "ko")
  });

  try {
    const response = await client.send(command);
    console.log("Translated Text:", response.TranslatedText);
    return response.TranslatedText;
  } catch (error) {
    console.error("Translation Error:", error);
  }
}


export async function POST(req) {
    try {

        const body = await req.json()
        console.log(body)
        const { text, sourceLang, targetLang } = body;
        if (!text || !sourceLang || !targetLang) {
          return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
        }
        const res = await translateText(text, sourceLang, targetLang)
        return NextResponse.json({data:res})
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, { status: 500 })
    }
}
