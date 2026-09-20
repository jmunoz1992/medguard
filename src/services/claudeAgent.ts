import Anthropic from "@anthropic-ai/sdk";
import { retrieveRelevantInteractions } from "./retriever";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const tools: Anthropic.Tool[] = [
    {
        name: "lookup_interactions",
        description: "Look up known drug interactions for a list of medication names.",
        input_schema: {
            type: "object",
            properties: {
                drugs: { type: "array", items: { type: "string" } }
            },
            required: ["drugs"]
        }
    }
];

export async function assessRisk(currentMeds: string[], newDrug: string) {
    const messages: Anthropic.MessageParam[] = [
        {
            role: "user",
            content: `Patient is currently taking: ${currentMeds.join(", ")}. 
They are being prescribed: ${newDrug}. 
Use the lookup_interactions tool to check for known interactions, 
then summarize risk level and rationale in plain language for a pharmacist.`
        }
    ];

    let response = await client.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 1024,
        tools,
        messages
    });

    const toolUse = response.content.find(b => b.type === "tool_use");
    if (toolUse && toolUse.type === "tool_use") {
        const input = toolUse.input as { drugs: string[] };
        const results = retrieveRelevantInteractions(input.drugs);

        messages.push({ role: "assistant", content: response.content });
        messages.push({
            role: "user",
            content: [
                {
                    type: "tool_result",
                    tool_use_id: toolUse.id,
                    content: JSON.stringify(results)
                }
            ]
        });

        response = await client.messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 1024,
            tools,
            messages
        });
    }

    const finalText = response.content.find(b => b.type === "text");
    return finalText && finalText.type === "text" ? finalText.text : "";
}