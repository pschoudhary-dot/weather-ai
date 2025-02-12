import { useChat } from "@ai-sdk/react";
import Message from "@/app/components/message";


export default function Home() {
  const {messages, input, handleInputChange, handleSubmit} = useChat();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col h-screen max-w-6xl w-full mx-auto">
          <div className="flex-1 overflow-y-auto">
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
