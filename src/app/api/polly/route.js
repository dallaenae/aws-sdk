import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { NextResponse } from "next/server";

const credentials = {
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
};
const client = new PollyClient({ 
  region: process.env.MY_AWS_REGION,
  credentials: credentials
});

const textToSpeech = async (text, voiceId = "Joanna", format = "mp3") => {
  try {
    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: format,
      VoiceId: voiceId,
    });

    const response = await client.send(command);
    if (response.AudioStream) {
      console.log(`✅ Audio Stream OK.`);
    } else {
      console.error("❌ No audio stream received.");
    }
    return response

  } catch (error) {
    console.error("❌ Error synthesizing speech:", error);
  }
};

export async function POST(req, res) {
    try {

        const body = await req.json()
        const { text } = body;
        
        if (!text ) {
          return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
        }

        const response = await textToSpeech(text)

        return new Response(response.AudioStream, {
          headers: {
            "Content-Type": "audio/mpeg",
            "Content-Disposition": 'attachment; filename="speech.mp3"',
          },
        });
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, { status: 500 })
    }
}
