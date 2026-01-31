import { NextResponse } from "next/server";
import OpenAI from "openai";

// Force Node.js runtime for file handling
export const runtime = "nodejs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get("audio") as File;
        const language = (formData.get("language") as string) || "en";

        if (!audioFile) {
            return NextResponse.json(
                { error: "No audio file provided" },
                { status: 400 }
            );
        }

        // Call OpenAI Whisper API directly
        const response = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            language: language,
        });

        return NextResponse.json({ text: response.text });
    } catch (error: any) {
        console.error("Speech to text error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to transcribe audio" },
            { status: 500 }
        );
    }
}
