import { summarizeText } from "../ai/chat.server";
import { getContextUser } from "../db/message.server";


export async function getContext(
    k: number = 10,
) {
    try {
        const context = await getContextUser();
        

        return context;

    } catch (error) {
        console.error("Failed to get context", error);
        return [];
    }
}