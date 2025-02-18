"use client";

import Message from "@/app/components/message";
import { useChat } from "@ai-sdk/react";
import React from "react";
import { processDocument } from "../tool/document";
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";

export default function Home() {
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_KEY!
  );

  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    modelName: "text-embedding-3-small"
  });

  const vectorStore = new SupabaseVectorStore(embeddings, {
    client: supabaseClient,
    tableName: 'documents',
    queryName: 'match_documents'
  });

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
    body: {
      vectorStore
    }
  });
  // Add state for uploaded files
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
  // Add loading state
  const [processingFiles, setProcessingFiles] = React.useState<{[key: string]: boolean}>({});

  // Add file upload handler with type restriction
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/html'
    ];

    if (file && allowedTypes.includes(file.type)) {
      setUploadedFiles(prev => [...prev, file]);
    } else {
      alert('Please upload only PDF, Word, TXT, or HTML files');
    }
  };

  // Handle process button click
  const handleProcess = async (file: File) => {
    // Set loading state for this specific file
    setProcessingFiles(prev => ({ ...prev, [file.name]: true }));
    
    try {
        const text = await file.text();
        const result = await processDocument(text, file.name);
        
        if (result.success) {
            alert(result.message);
        } else {
            alert(`Failed to process document: ${result.message}`);
        }
    } catch (error: any) {
        alert(`Error processing file: ${error.message}`);
    } finally {
        // Clear loading state
        setProcessingFiles(prev => ({ ...prev, [file.name]: false }));
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar for uploaded files */}
      <div className="w-64 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-white text-lg font-semibold mb-4">Uploaded Files</h2>
        {uploadedFiles.map((file, index) => (
          <div key={index} className="mb-3 p-2 bg-gray-700 rounded-lg">
            <p className="text-white text-sm truncate">{file.name}</p>
            <button
              onClick={() => handleProcess(file)}
              disabled={processingFiles[file.name]}
              className={`mt-2 w-full px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm disabled:bg-blue-300 flex items-center justify-center`}
            >
              {processingFiles[file.name] ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                'Process'
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col max-w-6xl w-full mx-auto">
        <h1 className="text-3xl text-center mt-10 font-bold tracking-tight text-white/90">Weather AI Chatbot</h1>
        <div className="flex-1 overflow-y-auto">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        </div>

        <div className="w-full p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg bg-transparent text-white outline-none"
            />
            {/* Add file upload input and button */}
            <input
              type="file"
              id="fileUpload"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.html"
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => document.getElementById('fileUpload')?.click()}
              className="px-4 py-2 border rounded-lg hover:bg-white/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </button>
            <button
              type="submit"
              className="px-4 py-2 border rounded-lg hover:bg-white/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}