"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Editor from "@monaco-editor/react";
import { supabase } from '@/lib/supabase';
import Image from 'next/image'

import { useSearchParams } from 'next/navigation';
import { Play, Share2, Loader2, FileCode, Plus, X } from 'lucide-react';

interface JavaFile {
  name: string;
  content: string;
}

const DEFAULT_CODE = [
  { 
    name: 'Main.java', 
    content: 'import java.util.Scanner;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner scanner = new Scanner(System.in);\n\n    System.out.print("Digite seu nome: ");\n    String nome = scanner.nextLine();\n\n    System.out.print("Digite sua idade: ");\n    String idadeStr = scanner.nextLine();\n    int idade = Integer.parseInt(idadeStr);\n\n    System.out.println("Olá, " + nome + "! Você tem " + idade + " anos.");\n\n    scanner.close();\n  }\n}' 
  }
];

function IDEContent() {
  const [files, setFiles] = useState<JavaFile[]>(DEFAULT_CODE);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const searchParams = useSearchParams();
  const snippetId = searchParams.get('id');

  // Regex para encontrar chamadas de métodos de entrada do Scanner
  const INPUT_PATTERN = /\bnext(Line|Int|Double|Float|Long|Short|Byte|Boolean)\s*\(/g;

  useEffect(() => {
    const loadData = async () => {
      if (snippetId) {
        const { data } = await supabase
          .from('snippets')
          .select('code')
          .eq('id', snippetId)
          .single();

        if (data) {
          try {
            const parsed = JSON.parse(data.code);
            setFiles(Array.isArray(parsed) ? parsed : [{ name: 'Main.java', content: data.code }]);
            setIsLoaded(true);
            return;
          } catch (e) {
            console.error("Erro ao parsear código do banco");
          }
        }
      }

      const savedFiles = localStorage.getItem('elasnaciencia_code');
      if (savedFiles) {
        try {
          setFiles(JSON.parse(savedFiles));
        } catch (e) {
          setFiles(DEFAULT_CODE);
        }
      }
      setIsLoaded(true);
    };

    loadData();
  }, [snippetId]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('elasnaciencia_code', JSON.stringify(files));
    }
  }, [files, isLoaded]);

  const addNewFile = () => {
    const name = prompt("Nome do arquivo (ex: Pessoa.java):");
    if (name) {
      let className = name.replace('.java', '').trim();
      if (className.length === 0) return;
      
      className = className.charAt(0).toUpperCase() + className.slice(1);
      const formattedName = className + '.java';
      
      const newFile = { 
        name: formattedName, 
        content: `import java.util.*;\n\npublic class ${className} {\n  public static void main(String[] args) {\n    System.out.println("Olá");\n    ArrayList<String> lista = new ArrayList<>();\n    lista.add("Classe ${className} pronta!");\n    System.out.println(lista.get(0));\n  }\n}` 
      };
      
      setFiles(prev => [...prev, newFile]);
      setActiveFileIndex(files.length);
    }
  };

  const removeFile = (index: number) => {
    if (files.length === 1) return alert("Você precisa de pelo menos um arquivo.");
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setActiveFileIndex(0);
  };

  const updateCurrentCode = (val: string | undefined) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[activeFileIndex]) {
        newFiles[activeFileIndex].content = val || "";
      }
      return newFiles;
    });
  };

  // Coleta as entradas necessárias via prompt, baseado no código
  const collectInputsFromCode = (code: string): string[] | null => {
    const matches = [...code.matchAll(INPUT_PATTERN)];
    if (matches.length === 0) return []; // nenhuma entrada necessária

    const inputs: string[] = [];
    for (let i = 0; i < matches.length; i++) {
      const method = matches[i][0]; // ex: nextLine, nextInt
      const userInput = prompt(`Digite o valor para a ${i + 1}ª entrada (${method}):`);
      
      if (userInput === null) {
        alert("Execução cancelada.");
        return null; // usuário cancelou
      }
      inputs.push(userInput);
    }
    return inputs;
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Preparando execução...");

    try {
      const activeFile = files[activeFileIndex];
      if (!activeFile) {
        setOutput("Erro: Nenhum arquivo selecionado.");
        setIsRunning(false);
        return;
      }

      // Coleta as entradas baseadas no código
      const inputs = collectInputsFromCode(activeFile.content);
      if (inputs === null) {
        // Usuário cancelou, interrompe execução
        setIsRunning(false);
        setOutput("");
        return;
      }

      // Constrói o stdin com as entradas coletadas (cada linha uma entrada)
      const stdin = inputs.join('\n');

      setOutput("Compilando e executando...");

      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          files: [activeFile],
          stdin: stdin
        }), 
      });

      const data = await response.json();
      
      if (data.run) {
        const result = (data.run.output || "") + (data.run.stderr || "") + (data.run.stdout || "");
        setOutput(result || "Código executado com sucesso.");
      } else {
        setOutput("Erro ao processar resposta do servidor.");
      }
    } catch (error: any) {
      setOutput(`Erro de conexão: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const shareCode = async () => {
    setIsSharing(true);
    try {
      const { data } = await supabase
        .from('snippets')
        .insert([{ code: JSON.stringify(files) }])
        .select()
        .single();

      if (data) {
        const url = `${window.location.origin}/?id=${data.id}`;
        await navigator.clipboard.writeText(url);
        alert("Link gerado e copiado! Salve este link para acessar seus arquivos depois.");
      }
    } catch (error) {
      alert("Erro ao salvar.");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white overflow-hidden font-sans">
      <header className="p-4 border-b-2 border-purple-900 flex justify-between items-center bg-gradient-to-r from-[#6b2d8a] via-[#8b3fa3] to-[#6b2d8a] shadow-2xl shadow-purple-900/50">
        <div className='flex justify-center items-center gap-4'>
          <div className="transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/logo.svg"
              width={70}
              height={100}
              alt="Logo ElasNaCiência"
            />
          </div>
          <h1 className="text-[2.2rem] font-black tracking-wider text-white drop-shadow-lg" style={{textShadow: '0 0 20px rgba(139, 63, 163, 0.8)'}}>ElasNaCiência IDE</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={shareCode} disabled={isSharing} className="flex items-center gap-2 bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50">
            {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Salvar e Gerar Link
          </button>
          <button onClick={runCode} disabled={isRunning} className="flex items-center gap-2 bg-gradient-to-r from-[#d000cd] to-[#b3009b] px-5 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            RODAR CÓDIGO
          </button>
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        <div className="w-56 bg-gradient-to-b from-[#1a1a1b] to-[#252526] border-r-2 border-purple-900/30 flex flex-col">
          <div className="p-3 flex justify-between items-center border-b-2 border-purple-900/50 text-[10px] font-bold text-purple-300 uppercase tracking-widest bg-gradient-to-r from-purple-900/20 to-transparent">
            Gerenciador de Arquivos
            <button onClick={addNewFile} title="Novo arquivo Java" className="hover:text-white p-1.5 bg-purple-700/50 hover:bg-purple-600 rounded-md transition-all text-white transform hover:scale-110 shadow-lg">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {files.map((file, index) => (
              <div 
                key={file.name + index}
                onClick={() => setActiveFileIndex(index)}
                className={`flex items-center justify-between group px-3 py-2.5 cursor-pointer text-sm transition-all duration-200 ${activeFileIndex === index ? 'bg-gradient-to-r from-purple-900/50 to-purple-800/30 text-white border-l-4 border-purple-500 shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:bg-purple-900/20 hover:text-purple-300'}`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileCode className={`w-4 h-4 transition-colors ${activeFileIndex === index ? 'text-purple-400 animate-pulse' : 'text-gray-500 group-hover:text-purple-400'}`} />
                  <span className="truncate font-medium">{file.name}</span>
                </div>
                {files.length > 1 && (
                   <X onClick={(e) => { e.stopPropagation(); removeFile(index); }} className="w-3 h-3 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all transform hover:scale-125" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 border-r-2 border-purple-900/30 relative bg-gradient-to-br from-[#1e1e1e] to-[#252526]">
          <div className="absolute top-0 left-0 bg-gradient-to-r from-purple-900/40 to-transparent px-4 py-2 text-[11px] text-purple-300 z-10 border-b-2 border-r-2 border-purple-900/50 font-bold uppercase tracking-wider">
            ⚙️ {files[activeFileIndex]?.name}
          </div>
          <Editor 
            key={activeFileIndex}
            height="100%" 
            defaultLanguage="java" 
            theme="vs-dark"
            value={files[activeFileIndex]?.content}
            options={{ 
                fontSize: 16, 
                minimap: { enabled: false }, 
                padding: { top: 50 },
                automaticLayout: true,
                tabSize: 2,
                fontFamily: '"Fira Code", "Courier New", monospace',
                fontLigatures: true
            }}
            onChange={updateCurrentCode}
          />
          <style jsx>{`
            :global(.monaco-editor) {
              background: linear-gradient(135deg, #1e1e1e 0%, #252526 100%);
            }
            :global(.token.keyword),
            :global(.token.type) {
              color: #b19cd9 !important;
              font-weight: bold;
            }
            :global(.token.class) {
              color: #c77dff !important;
            }
          `}</style>
        </div>

        {/* Painel de saída - removida a área de entrada */}
        <div className="w-96 flex flex-col bg-gradient-to-b from-[#0a0a0b] to-[#1a1a1b] border-l-2 border-purple-900/30">
          <div className="flex h-full flex-col">
            <div className="flex-1 flex flex-col">
              <div className="p-3 bg-gradient-to-r from-purple-900/40 via-purple-900/20 to-transparent text-[11px] font-bold text-purple-300 border-b-2 border-purple-900/50 uppercase tracking-wider flex items-center gap-2">
                Saída do Programa
              </div>
              <div className="p-4 font-mono text-sm overflow-y-auto flex-1 leading-relaxed scrollbar-thin scrollbar-thumb-purple-700 scrollbar-track-transparent">
                {output ? (
                  <pre className="whitespace-pre-wrap text-green-400 drop-shadow-md" style={{
                    textShadow: '0 0 10px rgba(74, 222, 128, 0.3)'
                  }}>
                    {output.split('\n').map((line, i) => (
                      <div key={i} className="hover:bg-purple-900/20 px-2 rounded transition-colors">
                        <span className="text-purple-400 mr-2">{'>'}</span>
                        {line}
                      </div>
                    ))}
                  </pre>
                ) : (
                  <div className="text-gray-500 italic opacity-40 font-sans tracking-normal">
                    <div className="mb-2">💜 Pronto para executar seu código!</div>
                    <div className="text-[10px] opacity-60">Clique em "RODAR CÓDIGO" para ver o resultado aqui...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="bg-[#1e1e1e] h-screen flex items-center justify-center text-white font-mono">Iniciando ElasNaCiência IDE...</div>}>
      <IDEContent />
    </Suspense>
  );
}