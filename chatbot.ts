
import { readFile } from "fs";
import * as fs from "fs/promises";
import * as readline from "readline";
import pdf from "pdf-parse-debugging-disabled";
type Message = {role: string, content: string};
const decoder = new TextDecoder("utf-8")
const messages: Message[] = [];
async function chat()
{
//    console.log(messages); // Debugging: Ensure the messages array has the document text
    const llamaRequestBody = {"messages": messages,"model":"llama3.2","options":{"num_ctx":4096}}
    const llamaResponse = await fetch("http://localhost:11434/api/chat",{
        body: JSON.stringify(llamaRequestBody),method:"POST"
    });
    if (!llamaResponse.ok)
        throw llamaResponse.status;
    if (!llamaResponse.body)
        throw "null response body";
    const reader = llamaResponse.body.getReader();
    return reader;
};
function addMessage(message: Message)
{
    messages.push(message);
}
const rl = readline.createInterface(process.stdin,process.stdout);
const logOutput = async (reader: ReadableStreamDefaultReader)=>{
    let assistantResponse = {role:"assistant",content:""};
    while (true)
    {
        const {done,value} = await reader.read();
        if (done)
            break;
        const parsed = JSON.parse(decoder.decode(value)) as {message: Message};
        assistantResponse.content += parsed.message.content;
        process.stdout.write(parsed.message.content);
    }
};
rl.question("which document?", async (answer) => {
    try {
        const fileBuffer = await fs.readFile(answer);
        const pdfData = await pdf(fileBuffer);

        addMessage({ role: "system", content: `Here is the document content. Answer user questions strictly based on this content. No outside knowledge.\n\n${pdfData.text}` });

        rl.question("What would you like to say to the chatbot? ", async (userInput) => {
            addMessage({ role: "user", content: userInput });

            const reader = await chat();
            await logOutput(reader);
        });
    } catch (err) {
        console.error("Error reading file:", err);
    }
});

