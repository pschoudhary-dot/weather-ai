import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from "@supabase/supabase-js";

export async function processDocument(fileContent: string, fileName: string) {
    try {
        // Initialize text splitter with smaller chunks and more overlap
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50,
            //separators: ["\n\n", "\n", " ", ""], // Explicit separators
        });

        // Clean and normalize the text content
        const cleanContent = fileContent
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
            .replace(/\\u[0-9a-fA-F]{4}/g, ""); // Remove Unicode escape sequences

        // Split text into chunks
        const docs = await textSplitter.createDocuments(
            [cleanContent],
            [{ source: fileName }] // Add source metadata
        );

        // Initialize OpenAI embeddings
        const embeddings = new OpenAIEmbeddings({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            modelName: "text-embedding-3-small" // Specify model explicitly
        });

        // Initialize Supabase client
        const client = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PRIVATE_KEY!
        );

        // Store documents in vector store
        const vectorStore = await SupabaseVectorStore.fromDocuments(
            docs,
            embeddings,
            {
                client,
                tableName: 'documents',
                queryName: 'match_documents'
            }
        );

        return {
            success: true,
            message: `Successfully processed ${fileName}. Created ${docs.length} chunks.`,
            chunks: docs.length
        };

    } catch (error: any) {
        console.error('Document processing error:', error);
        return {
            success: false,
            message: error.message || 'Unknown error occurred'
        };
    }
}