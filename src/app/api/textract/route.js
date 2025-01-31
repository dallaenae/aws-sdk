import { TextractClient, AnalyzeDocumentCommand } from "@aws-sdk/client-textract";
import { NextResponse } from "next/server";


const credentials = {
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
};
const client = new TextractClient({ 
  region: process.env.MY_AWS_REGION,
  credentials: credentials
});

async function extractTextFromImageBuffer(imageBuffer) {

  const params = {
    Document: {
      Bytes: imageBuffer,
    },
    FeatureTypes: ["TABLES", "FORMS"], // 추출할 데이터 타입
  };

  try {
    const command = new AnalyzeDocumentCommand(params);
    const response = await client.send(command);
    return response
    // console.log("Full Response:", JSON.stringify(response, null, 2));

    // // 텍스트 라인만 추출
    // const blocks = response.Blocks.filter((block) => block.BlockType === "LINE");
    // const lines = blocks.map((block) => block.Text).join("\n");

    // console.log("Extracted Lines:\n", lines);
    // return lines;
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
