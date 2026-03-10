import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch("https://glot.io/api/run/java/latest", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.GLOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        files: body.files.map((f: any) => ({
          name: f.name,
          content: f.content,
        })),
      }),
    });

    const data = await response.json();

    // Combinamos stdout e stderr para garantir que erros apareçam no console
    return NextResponse.json({
      run: {
        output: (data.stdout || "") + (data.stderr || "") || (data.error || "")
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro na conexão com Glot" }, { status: 500 });
  }
}