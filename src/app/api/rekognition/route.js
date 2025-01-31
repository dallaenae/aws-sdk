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
    
    // 감지된 텍스트 정리
    const detectedTexts = response.TextDetections
      .filter(text => text.Type === "LINE")
      .map(text => ({
        text: text.DetectedText,
        x: text.Geometry.BoundingBox.Left + text.Geometry.BoundingBox.Width / 2, // 중심 X 좌표
        y: text.Geometry.BoundingBox.Top + text.Geometry.BoundingBox.Height / 2, // 중심 Y 좌표
      }));

    if (detectedTexts.length === 0) {
      console.log("❌ 텍스트를 감지하지 못했습니다.");
      return;
    }

    // **1. 전체 중심 좌표 계산**
    const centerX = detectedTexts.reduce((sum, t) => sum + t.x, 0) / detectedTexts.length;
    const centerY = detectedTexts.reduce((sum, t) => sum + t.y, 0) / detectedTexts.length;

    // **2. 텍스트 위치에 따라 정렬 방식 결정**
    const isMostlyHorizontal = detectedTexts.filter(t => Math.abs(t.y - centerY) < 0.1).length > detectedTexts.length / 2;

    let sortedTexts;
    if (isMostlyHorizontal) {
      // 🎯 대부분 수평 정렬 → X 좌표 기준 정렬
      sortedTexts = detectedTexts.sort((a, b) => a.x - b.x);
    } else {
      // 🌀 반원형/비정형 구조 → 중심 기준 각도 정렬
      sortedTexts = detectedTexts
        .map(t => ({
          text: t.text,
          angle: Math.atan2(t.y - centerY, t.x - centerX), // 중심을 기준으로 각도 계산
        }))
        .sort((a, b) => a.angle - b.angle);
    }

    // 정렬된 텍스트만 추출
    const extractedText = sortedTexts.map(t => t.text).join(" ");

    console.log("📜 정렬된 Rekognition 추출 텍스트:");
    console.log(extractedText);
    return extractedText;

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
