
import { readFile } from "fs";
import * as fs from "fs/promises";
import * as readline from "readline";
import pdf from "pdf-parse-debugging-disabled";
import path, { extname, parse } from "path";
import { Message } from "./types";
const decoder = new TextDecoder("utf-8")

export async function chat(messages: Message[])
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

export async function parsePDF(fileBuffer: Buffer)
{
    const pdfData = await pdf(fileBuffer);
    return pdfData;
};
