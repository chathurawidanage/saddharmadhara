import { getSmsBalance } from "../../../lib/sms";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const balanceData = await getSmsBalance();
        return new Response(JSON.stringify({
            balance: balanceData,
        }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store, max-age=0",
                "Access-Control-Allow-Origin": "*", // Allow usage from admin app
            },
        });
    } catch (error) {
        console.error("Failed to fetch SMS balance:", error);
        return new Response("Failed to fetch SMS balance", { status: 500 });
    }
}
