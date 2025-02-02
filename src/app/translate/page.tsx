'use client'
import { useState } from 'react'

export default function TranslagePage() {

    const [text, setText] =useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [resultText, setResultText] = useState('')

    const callAPI = async () => {

        const API_URL = '/api/translate';
        const jsonBody = {
            text: text,
            sourceLang: 'en',
            targetLang: 'ko',
          }
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json; charset=utf-8'
                },
                body: JSON.stringify(jsonBody),
            })

            const json = await response.json()
            return json.data
        } catch (error) {
            alert('Error processing result: ' + error)
            return null
        }
    }

    const handleSubmit = async (e:any) => {
        e.preventDefault()
        setIsProcessing(true)
        setResultText('')
        const result = await callAPI()
        if (result) {
            setResultText(result)
        }
        setIsProcessing(false)
      }

    return (
        <>
                <div className='p-4 flex justify-start'>
                    <span className='text-gray-600 font-bold text-2xl'>Translate</span>
                </div>
                <div className='p-4 flex justify-start'>
                        <textarea
                            id="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full border rounded px-2 py-1 mr-2"
                            placeholder='번역할 텍스트 입력'
                            required
                        />
                        <textarea
                            id="resultText"
                            value={resultText}
                            readOnly
                            className="w-full border rounded px-2 py-1 mr-2"
                            placeholder='번역 결과'
                        />
                </div>
                <div className='px-4 flex justify-start'>

                <button 
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                    disabled={isProcessing}
                    >
                    Process
                </button>
                </div>

        </>
    )
}