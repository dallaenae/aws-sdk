'use client'
import { useState } from 'react'

type ApiResponse = {
    message: string;
    result: any;
}

export default function TexTractPage() {

    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [files, setFiles] = useState<File[]>([])
    const [processedImages, setProcessedImages] = useState<string[]>([])

    const callAPI = async (file:File) => {

        const formData = new FormData() 
        formData.append('image', file)
        const API_URL = '/api/textract';
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formData
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const json = await response.json()
            return json
        } catch (error) {
            alert('Error processing image: ' + error)
            return null
        }
    }

    const handleSubmit = async (e:any) => {
        e.preventDefault()
        setIsProcessing(true)
        setProcessedImages([])
        setProgress(0)
        const results = []
        for (let i = 0; i < files.length; i++) {
          const result = await callAPI(files[i])
          if (result) {
            results.push(result)
            setProcessedImages([...results])
          }
          setProgress(((i + 1) / files.length) * 100)
        }
        setIsProcessing(false)
      }
    

    return (
        <>
            <h2>TexTract</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="photos" className="block mb-1">Images:</label>
                    <input
                        type="file"
                        id="photos"
                        onChange={(e) => {
                            if (e.target.files) {
                                setFiles(Array.from(e.target.files))
                            }
                        }}
                        className="w-full border rounded px-2 py-1"
                        accept="image/*"
                        multiple
                        required
                    />
                </div>
                <button 
                type="submit" 
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={isProcessing}
                >
                Process Images
                </button>
            </form>

            {isProcessing && (
                <div className="mt-4">
                <p>Processing images... {progress.toFixed(0)}% complete</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${progress}%`}}></div>
                </div>
                </div>
            )}

            {processedImages.length > 0 && (
                <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Processed Images:</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {processedImages.map((img, index) => (
                    <div key={index} className="border rounded p-4">
                        <h4 className="font-bold mb-2">{JSON.stringify(JSON.parse(img))}</h4>
                    </div>
                    ))}
                </div>
                </div>
            )}
        </>
    )
}