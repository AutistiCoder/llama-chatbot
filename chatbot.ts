
type Message = {role: string, content: string};
const decoder = new TextDecoder("utf-8")
const messages: Message[] = [];
async function chat()
{
    const llamaRequestBody = {"messages": messages,"model":"llama3.2"}
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
addMessage({role:"user",content:"How much wood would a woodchuck chuck if a woodchuck could chuck wood? Precise answer only."});
chat().then(async reader=>{
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
});
