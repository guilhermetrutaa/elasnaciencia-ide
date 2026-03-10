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
        stdin: body.stdin || "",
      }),
    });

    const data = await response.json();

    // Glot.io retorna stdout, stderr e compile_output
    const output = (data.compile?.output || "") + (data.stdout || "") + (data.stderr || "") || data.error || "";
    
    return NextResponse.json({
      run: {
        output: output || "Código executado com sucesso."
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro na conexão com Glot.io" }, { status: 500 });
  }
}