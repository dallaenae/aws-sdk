'use client'
import { useState } from 'react'

export default function PollyPage() {

    const [text, setText] =useState('')
    const [audioUrl, setAudioUrl] = useState(null);
    const [loading, setLoading] = useState(false);
  

    const callAPI = async () => {

        const API_URL = '/api/polly';
        const jsonBody = {
            text: text
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(jsonBody),
        })

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        } else {
          console.error("Failed to synthesize speech");
          alert("음성 변환 중 오류가 발생했습니다.");
        }

    }

    const handleSubmit = async () => {

        if (!text) {
            alert("텍스트를 입력하세요.");
            return;
        }

        setLoading(true);
        setAudioUrl(null); // 기존 오디오 URL 초기화

        await callAPI()

        setLoading(false);

      }

    return (
        
        <div className="p-4 max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-2">AWS Polly Text-to-Speech</h2>
          <textarea
            className="w-full p-2 border rounded-md"
            
            placeholder="변환할 텍스트를 입력하세요."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "변환 중..." : "음성 변환"}
          </button>

          {audioUrl && (
            <div className="mt-4">
              <audio controls src={audioUrl} className="w-full"></audio>
              <a href={audioUrl} download="speech.mp3" className="block mt-2 text-blue-500">
                음성 파일 다운로드
              </a>
            </div>
          )}
        </div>
                

    )
}