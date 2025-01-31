import { RekognitionClient, DetectTextCommand } from "@aws-sdk/client-rekognition";
import { NextResponse } from "next/server";

const credentials = {
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
};
const client = new RekognitionClient({ 
  region: process.env.MY_AWS_REGION,
  credentials: credentials
});

async function extractTextFromImageBuffer(imageBuffer) {

  try {
    const command = new DetectTextCommand({
      Image: { Bytes: imageBuffer },
    });

    const response = await client.send(command);
    
    // 감지된 텍스트를 필터링 및 좌표 정보와 함께 정렬
    const detectedText = response.TextDetections
      .filter(text => text.Type === "LINE")  // 라인 단위 텍스트만 사용
      .map(text => ({
        text: text.DetectedText,
        y: text.Geometry.BoundingBox.Top,  // Y 좌표 (세로 위치)
      }))
      .sort((a, b) => a.y - b.y)  // Y 좌표 기준으로 정렬
      .map(item => item.text)  // 정렬된 텍스트만 추출
      .join("\n");

    console.log("📄 Rekognition 추출된 텍스트:");
    console.log(detectedText);
    return detectedText;

  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}


export async function POST(req) {
    try {

        const formData = await req.formData()
        const image = formData.get('image')
        if (!image) {
          return NextResponse.json({ error: 'No image uploaded' }, { status: 400 })
        }
        const buffer = await image.arrayBuffer()
        const imageBuffer = Buffer.from(buffer)

        const result = await extractTextFromImageBuffer(imageBuffer);
        return NextResponse.json(JSON.stringify(result, null, 2))
    } catch (error) {
        return NextResponse.json({error: 'Internal server error'}, { status: 500 })
    }
}
