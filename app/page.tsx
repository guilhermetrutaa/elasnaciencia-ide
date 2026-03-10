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
    content: 'import java.util.*;\n\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Olá");\n    ArrayList<String> lista = new ArrayList<>();\n    lista.add("IDE ElasNaCiência pronta!");\n    System.out.println(lista.get(0));\n  }\n}' 
  }
];

function IDEContent() {
  const [files, setFiles] = useState<JavaFile[]>(DEFAULT_CODE);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  // Controle crucial para evitar sobrescrita no F5
  const [isLoaded, setIsLoaded] = useState(false);
  
  const searchParams = useSearchParams();
  const snippetId = searchParams.get('id');

  // 1. CARREGAR DADOS (Supabase ou LocalStorage)
  useEffect(() => {
    const loadData = async () => {
      // Prioridade 1: Link compartilhado (ID na URL)
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

      // Prioridade 2: Cache local do navegador
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

  // 2. AUTO-SAVE LOCAL (Só roda DEPOIS que o carregamento inicial terminou)
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
      
      // Garante primeira letra maiúscula (padrão Java)
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

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Compilando e executando...");

    try {
      // Executar apenas o arquivo ativo (o que está sendo editado)
      const activeFile = files[activeFileIndex];
      if (!activeFile) {
        setOutput("Erro: Nenhum arquivo selecionado.");
        setIsRunning(false);
        return;
      }

      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: [activeFile] }), 
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
          <button onClick={shareCode} disabled={isSharing} className="flex items-center gap-2 bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 border border-purple-500 shadow-lg hover:shadow-purple-600/50 hover:shadow-xl">
            {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            Salvar e Gerar Link
          </button>
          <button onClick={runCode} disabled={isRunning} className="flex items-center gap-2 bg-gradient-to-r from-[#00d084] to-[#00b366] hover:from-[#00e894] hover:to-[#00c478] px-5 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50 shadow-lg hover:shadow-green-600/50 hover:shadow-xl">
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            RODAR CÓDIGO
          </button>
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        {/* BARRA LATERAL DE ARQUIVOS */}
        <div className="w-56 bg-gradient-to-b from-[#1a1a1b] to-[#252526] border-r-2 border-purple-900/30 flex flex-col">
          <div className="p-3 flex justify-between items-center border-b-2 border-purple-900/50 text-[10px] font-bold text-purple-300 uppercase tracking-widest bg-gradient-to-r from-purple-900/20 to-transparent">
            📁 Gerenciador de Arquivos
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

        {/* EDITOR DE CÓDIGO */}
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

        {/* CONSOLE DE SAÍDA */}
        <div className="w-96 flex flex-col bg-gradient-to-b from-[#0a0a0b] to-[#1a1a1b] border-l-2 border-purple-900/30">
          <div className="p-3 bg-gradient-to-r from-purple-900/40 via-purple-900/20 to-transparent text-[11px] font-bold text-purple-300 border-b-2 border-purple-900/50 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
            Terminal / Output
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