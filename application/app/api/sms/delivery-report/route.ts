export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const campaignId = searchParams.get("campaignId");
  const msisdn = searchParams.get("msisdn");
  const status = searchParams.get("status");

  console.log("Delivery Report Received:", {
    campaignId,
    msisdn,
    status,
  });

  return new Response("OK", {
    status: 200,
  });
}
