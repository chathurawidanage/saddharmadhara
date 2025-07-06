export async function POST(request: Request) {
  const body: {
    to: Array<string>;
    message: string;
  } = await request.json();

  return new Response("OK", {
    status: 200,
  });
}
