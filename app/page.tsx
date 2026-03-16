"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Editor from "@monaco-editor/react";
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Play, Share2, Loader2, FileCode, Plus, X } from 'lucide-react';

interface JavaFile {
  name: string;
  content: string;
}

// Frases motivacionais - 100 frases para inspirar as programadoras 👩‍💻
const MOTIVATIONAL_PHRASES = [
  "Você é capaz! Continue programando 🚀",
  "Erros são apenas degraus para o aprendizado 💜",
  "A ciência também é lugar de mulher! 👩‍🔬",
  "Cada linha de código te aproxima do seu sonho ✨",
  "Não desista, o próximo 'Hello World' vai funcionar!",
  "Você está construindo algo incrível 🌟",
  "O importante é persistir e nunca parar de aprender 📚",
  "Seu esforço de hoje é o sucesso de amanhã 💪",
  "Programar é como mágica: você cria coisas do nada! 🎩",
  "Juntas somos mais fortes! 👭",
  "Ada Lovelace te inspira! A primeira programadora do mundo 👑",
  "Mulheres na tecnologia: escrevendo o futuro, linha por linha 💻",
  "Seu código tem poder de mudar o mundo! 🌍",
  "As meninas da ciência estão revolucionando o amanhã 🔬",
  "Você é a prova que lugar de mulher é onde ela quiser, inclusive na programação! 💜",
  "Grace Hopper diria: continue compilando seus sonhos! ⚓",
  "Cada mulher na tecnologia abre caminho para muitas outras 🛤️",
  "Sua inteligência é seu superpoder! Use-o sem moderação 🦸‍♀️",
  "O futuro é feminino e cheio de código! 👩‍💻",
  "Programação não tem gênero, tem talento - e você tem de sobra! ✨",
  "Bug encontrado, bug resolvido = aprendizado adquirido! 🐛",
  "A diferença entre o sucesso e o fracasso é a persistência 💫",
  "Código que não compila hoje, compila amanhã - continue tentando! 🔄",
  "Os maiores programadores erraram muitas vezes antes de acertar 🌈",
  "Cada erro é uma lição disfarçada 👩‍🏫",
  "Não tenha medo de errar, tenha medo de não tentar 🌻",
  "Programar é 10% código e 90% persistência! 🎯",
  "A jornada de 1000 linhas começa com um 'public static void main' 🏁",
  "Se está difícil, é porque você está evoluindo! 📈",
  "Respira fundo e volta pro código - você consegue! 🧘‍♀️",
  "Seu cérebro é o melhor compilador que existe 🧠",
  "Programar é traduzir café em código ☕",
  "Seu potencial é como um loop infinito: não tem fim! 🔁",
  "Na vida e no código, sempre há uma solução 🌉",
  "Pensamento lógico + criatividade = código incrível! 🎨",
  "Programar é a arte de instruir computadores 🎭",
  "Você não está só codificando, está criando poesia em Java 📜",
  "Arrays, loops e condicionais - você domina tudo isso! 👑",
  "Código bem escrito é como uma história bem contada 📖",
  "Sua imaginação é o único limite para o que você pode programar 🌈",
  "Aquele erro chato? Ele vai te ensinar algo valioso 🎁",
  "Dias de luta, dias de código - tudo vale a pena! ⚔️",
  "Se você não entendeu ainda, é só questão de tempo ⏰",
  "Mais uma tentativa, mais perto da solução 🎯",
  "Desistir não é opção quando se tem um sonho 🌠",
  "O código perfeito não existe, mas o seu código pode ser incrível! 💖",
  "Acredite no seu potencial - ele é maior que qualquer bug 🦋",
  "Se algo não deu certo, tente de um jeito diferente 🔄",
  "A prática leva à perfeição - continue praticando! 🏋️‍♀️",
  "Você é mais forte que qualquer NullPointerException! 💪",
  "Código. Café. Coragem. Você tem tudo isso! ☕",
  "Meninas na ciência: o futuro é agora! 🚀",
  "Programe seus sonhos! ✨",
  "Java é desafio, você é solução 💜",
  "Bug? Só mais um amigo para entender 🐞",
  "Cada linha importa! 📝",
  "Você nasceu para brilhar - e programar! 🌟",
  "Aula de POO: Programando Oportunidades Ousadas! 🎓",
  "Elas na ciência, elas no código, elas no comando! 👩‍💼",
  "Código bonito é aquele que funciona - igual você! 💝",
  "Você é a programadora que suas amigas precisam conhecer! 🌸",
  "Lugar de mulher é onde ela quiser - inclusive debugando! 🐛",
  "STEM também é coisa de menina! 🔬🧪",
  "Sua mente brilhante merece estar na tecnologia ✨",
  "Quebre barreiras, escreva código, inspire outras! 🌉",
  "O mundo precisa de mais mulheres como você na computação! 🌍",
  "Você não está aprendendo Java, está construindo seu futuro! 🏗️",
  "A tecnologia é mais diversa com você nela! 🌈",
  "Seu lugar é no topo - e no console sem erros! 🏔️",
  "Programação: uma área onde você pode ser exatamente quem é 💖",
  "Juntas, programamos melhor! 👩‍👩‍👧‍👧",
  "Uma ajuda a outra: assim crescemos mais fortes! 🌱",
  "Compartilhar conhecimento é multiplicar possibilidades 📚",
  "Na nossa comunidade, todo bug é resolvido em equipe! 👥",
  "Sozinha você vai rápido, juntas vamos longe! 🌠",
  "A sororidade também existe no código! 💜",
  "Uma mão ajuda a outra - e o código funciona! 🤝",
  "Nós, mulheres na tecnologia, somos uma rede de apoio! 🕸️",
  "Cada conquista sua é conquista de todas nós! 🏆",
  "Juntas, somos uma equipe imbatível de programadoras! ⚡",
  "A vida é como um código: cheia de loops, mas sempre segue em frente 🔄",
  "Seja a exceção que lança inovação! ⚡",
  "Herde a coragem, implemente a persistência! 🧬",
  "Sobrescreva seus limites com novas conquistas! 🔄",
  "Sua jornada é um método main cheio de possibilidades 🌈",
  "Encapsule seus sonhos e proteja sua essência! 💎",
  "Polimorfismo da vida: se adapte e brilhe em qualquer forma! 🦋",
  "Cada novo conceito é uma nova classe sendo instanciada ✨",
  "A recursão da vida: acredite em si mesma infinitamente 🔁",
  "Seu potencial não tem tipo definido - é genérico e ilimitado! ⭐",
  "Nunca subestime o poder de uma mulher que programa! 🌋",
  "Java pode ser verboso, mas sua determinação é mais forte! 📢",
  "A cada erro, uma nova chance de acertar 🎲",
  "Programação é desafio, e você adora desafios! 🏆",
  "O código do sucesso tem sua assinatura! ✍️",
  "Mantenha a calma e continue programando! 🧘‍♀️",
  "Você é a variável mais importante nessa equação! ➕",
  "O mundo roda em código, e você está aprendendo a mudá-lo! 🌐",
  "Acredite: você vai olhar para trás e ver o quanto evoluiu! 📈",
  "Kodeo acredita em você! 💜🚀"
];

// Dicionário de dicas para erros comuns (usando crases para strings com aspas internas)
const ERROR_HINTS: Record<string, string> = {
  "';' expected": "Faltou um ponto e vírgula (;) no final da linha. Toda instrução simples em Java termina com ;",
  "'(' expected": "Faltou abrir parênteses. Verifique chamadas de método ou expressões.",
  "')' expected": "Faltou fechar parênteses. Confira se todos os parênteses abertos foram fechados.",
  "'{' expected": "Faltou abrir chave. Blocos de código (classes, métodos, loops) devem começar com {.",
  "'}' expected": "Faltou fechar chave. Verifique se todas as chaves abertas foram fechadas.",
  "']' expected": "Faltou fechar colchete. Ao declarar arrays, use [ e ] corretamente.",
  "illegal start of expression": "Expressão mal formada. Pode ser falta de operador, parêntese ou chave na linha indicada.",
  "illegal start of type": "Declaração de tipo inválida. Verifique se você não usou palavras reservadas incorretamente.",
  "unclosed string literal": "Faltou fechar as aspas duplas da string. Toda string deve começar e terminar com \".",
  "unclosed character literal": "Faltou fechar as aspas simples do caractere. Use aspas simples para char, ex: 'a'.",
  "not a statement": "Instrução inválida. Muitas vezes é uma expressão solta ou esquecimento de operador.",
  "incompatible types": "Tipos incompatíveis. Você está tentando atribuir um valor de um tipo a uma variável de outro tipo. Ex: não pode colocar String em int sem conversão.",
  "cannot find symbol": "Símbolo não encontrado. Verifique se a variável/método foi declarado e se o nome está escrito corretamente (maiúsculas/minúsculas).",
  "cannot be resolved to a variable": "A variável não foi declarada ou está fora do escopo. Declare a variável antes de usá-la.",
  "cannot be resolved to a type": "O tipo (classe) não foi encontrado. Verifique o nome da classe ou se você esqueceu de importá-la.",
  "duplicate class": "Classe duplicada. Você declarou duas classes com o mesmo nome no mesmo arquivo ou em arquivos diferentes no mesmo pacote.",
  "duplicate method": "Método duplicado. Você já tem um método com a mesma assinatura nesta classe.",
  "duplicate variable": "Variável duplicada. Você já declarou uma variável com o mesmo nome no mesmo escopo.",
  "variable might not have been initialized": "A variável pode não ter sido inicializada. Atribua um valor antes de usá-la (ex: int x = 0;).",
  "variable is already defined": "Variável já definida no escopo. Escolha outro nome.",
  "cannot assign a value to final variable": "Você tentou modificar uma variável declarada como final. Variáveis finais não podem ser alteradas após a inicialização.",
  "missing return statement": "O método deve retornar um valor, mas não há return em todos os caminhos. Adicione return no final ou em todas as ramificações.",
  "this method must return a result of type": "O tipo do valor retornado não corresponde ao declarado. Verifique se o return está devolvendo o tipo correto.",
  "method does not override or implement a method from a supertype": "Você usou @Override, mas o método não está sobrescrevendo ou implementando nenhum método da superclasse/interface. Verifique a assinatura.",
  "overrides method in superclass": "Método sobrescreve, mas a assinatura não é exatamente igual. Confira os parâmetros e o tipo de retorno.",
  "illegal modifier for class": "Modificador inválido para a classe. Classes só podem ser public, abstract, final ou (padrão).",
  "illegal modifier for method": "Modificador inválido para o método. Métodos podem ter public, private, protected, static, final, abstract, synchronized, native.",
  "illegal modifier for variable": "Modificador inválido para variável. Variáveis podem ter public, private, protected, static, final, transient, volatile.",
  "array dimension missing": "Faltou especificar o tamanho do array na declaração. Use new int[10] ou int[] array = {1,2,3};",
  "array required, but java.lang.String found": "Você está tentando acessar uma String como se fosse um array. Use charAt() para acessar caracteres de uma String.",
  "array required, but found": "Esperava um array, mas encontrou outro tipo. Verifique se a variável é de fato um array.",
  "bad operand types for binary operator": "Operador aplicado a tipos incompatíveis. Por exemplo, somar String com int sem conversão. Use operadores corretos ou converta os tipos.",
  "operator cannot be applied to": "O operador não pode ser usado com esses tipos. Ex: '+' entre booleanos não funciona.",
  "incomparable types": "Tipos não comparáveis. Você está tentando comparar tipos que não podem ser comparados (ex: String com int usando ==). Use equals() para objetos.",
  "package does not exist": "O pacote importado não existe. Verifique o nome do pacote ou se a biblioteca está no classpath.",
  "import cannot be resolved": "A importação não pode ser resolvida. Verifique se a classe realmente existe e se o nome está correto.",
  "unreachable statement": "Instrução inalcançável. Código após um return, break, continue ou throw não será executado. Remova ou reorganize.",
  "missing return in lambda expression": "Lambda expression deve retornar um valor em todos os caminhos. Verifique a lógica dentro da lambda.",
  "nullpointerexception": "Tentativa de acessar um objeto que é null. Certifique-se de que o objeto foi instanciado com new ou inicializado antes de usar.",
  "arrayindexoutofboundsexception": "Índice do array fora dos limites. O índice começa em 0 e vai até length-1. Verifique se o índice não ultrapassa o tamanho.",
  "stringindexoutofboundsexception": "Índice da string fora dos limites. Use charAt() com índice válido.",
  "arithmeticexception": "Erro aritmético, como divisão por zero. Evite dividir por zero.",
  "classcastexception": "Tentativa de conversão (cast) inválida entre tipos. Verifique se o objeto realmente é do tipo para o qual você está convertendo.",
  "numberformatexception": "Erro ao converter string para número. A string deve conter um número válido (ex: \"123\", não \"abc\").",
  "filenotfoundexception": "Arquivo não encontrado. Verifique o caminho e nome do arquivo.",
  "ioexception": "Erro de entrada/saída. Pode ser problema de leitura/escrita de arquivo ou rede.",
  "interruptedexception": "Thread foi interrompida durante uma operação.",
  "illegalargumentexception": "Argumento inválido passado para um método. Verifique os valores permitidos.",
  "nosuchmethodexception": "Método não encontrado, geralmente em reflexão. Verifique o nome do método.",
  "nosuchfieldexception": "Campo não encontrado, geralmente em reflexão.",
  "enum types cannot be instantiated": "Enum não pode ser instanciado com new. Use os valores definidos no enum.",
  "enum declaration must not include a body when it is a constant": "Declaração de enum inválida.",
  "generic array creation": "Não é possível criar arrays genéricos diretamente. Use ArrayList ou contorne com warnings suprimidos.",
  "type argument cannot be of primitive type": "Genéricos não aceitam tipos primitivos. Use as classes wrapper (Integer, Double, etc.).",
  "cannot infer type arguments": "O compilador não conseguiu inferir os tipos genéricos. Especifique explicitamente.",
  "the switch expression does not cover all possible input values": "No switch expression, você deve cobrir todos os casos ou usar default.",
  "record declaration must not have a body when it is a compact": "Declaração de record inválida.",
  "exception in thread \"main\"": "Ocorreu uma exceção não tratada no programa principal. Leia a pilha de erros abaixo para identificar a causa.",
  "could not find or load main class": "A classe principal não foi encontrada. Verifique o nome da classe e se ela tem o método main.",
  "unreported exception must be caught or declared to be thrown": "Uma exceção verificada não foi tratada. Use try-catch ou declare throws no método.",
  "no suitable method found to override": "Não há método para sobrescrever na superclasse. Verifique a assinatura.",
  "static method cannot be referenced from a non-static context": "Você está tentando chamar um método estático como se fosse de instância. Use o nome da classe para chamar métodos estáticos.",
  "non-static method cannot be referenced from a static context": "Dentro de um método estático (main), você não pode chamar métodos não estáticos diretamente. Crie uma instância da classe.",
  "static variable cannot be referenced from a non-static context": "Variável estática pode ser acessada de contexto não estático, mas prefira usar o nome da classe.",
  "cannot make a static reference to the non-static field": "Referência estática a campo não estático. Crie uma instância ou torne o campo estático.",
};

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
  
  // Estados do robô
  const [robotMessage, setRobotMessage] = useState<string>("Olá! Sou a Kodeo, sua assistente de programação. Vamos codar? 💜");
  const [lastErrorOutput, setLastErrorOutput] = useState<string | null>(null);
  const [showRobotBalloon, setShowRobotBalloon] = useState(true);
  const [robotMessageType, setRobotMessageType] = useState<'motivation' | 'error'>('motivation');

  const searchParams = useSearchParams();
  const snippetId = searchParams.get('id');

  // Regex para encontrar chamadas de métodos de entrada do Scanner
  const INPUT_PATTERN = /\bnext(Line|Int|Double|Float|Long|Short|Byte|Boolean)\s*\(/g;

  // Carregar dados iniciais
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

  // Salvar no localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('elasnaciencia_code', JSON.stringify(files));
    }
  }, [files, isLoaded]);

  // Intervalo para frases motivacionais (a cada 5 minutos)
  useEffect(() => {
    if (!isLoaded) return;

    const interval = setInterval(() => {
      setRobotMessageType('motivation');
      setRobotMessage(getRandomMotivation());
      setShowRobotBalloon(true);
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [isLoaded]);

  // Função para pegar frase motivacional aleatória
  const getRandomMotivation = (): string => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
    return MOTIVATIONAL_PHRASES[randomIndex];
  };

  // Função para analisar erro e gerar dica
  const parseJavaError = (errorText: string): string | null => {
    const lines = errorText.split('\n');
    for (const line of lines) {
      const match = line.match(/(.+?\.java):(\d+): error: (.+)/);
      if (match) {
        const [, file, lineNum, message] = match;
        const cleanMessage = message.trim();
        
        let hint = "Vamos dar uma olhada no código? Às vezes um parêntese ou chave está faltando.";
        for (const key in ERROR_HINTS) {
          if (cleanMessage.toLowerCase().includes(key.toLowerCase())) {
            hint = ERROR_HINTS[key];
            break;
          }
        }
        return `Na linha ${lineNum} do ${file} encontrei isso: "${cleanMessage}".\n\n💡 Dica: ${hint}`;
      }
    }
    if (errorText.toLowerCase().includes('error')) {
      return "Ops! Algo deu errado. Vamos revisar o código juntas? Se precisar, me chame clicando aqui!";
    }
    return null;
  };

  // Função para executar código
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

      const inputs = collectInputsFromCode(activeFile.content);
      if (inputs === null) {
        setIsRunning(false);
        setOutput("");
        return;
      }

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

        const fullError = data.run.stderr || data.run.output;
        if (fullError && (fullError.toLowerCase().includes('error') || fullError.toLowerCase().includes('exception'))) {
          const advice = parseJavaError(fullError);
          if (advice) {
            setRobotMessageType('error');
            setRobotMessage(advice);
            setShowRobotBalloon(true);
            setLastErrorOutput(fullError);
          }
        } else {
          setRobotMessageType('motivation');
          setRobotMessage(getRandomMotivation());
          setShowRobotBalloon(true);
          setLastErrorOutput(null);
        }
      } else {
        setOutput("Erro ao processar resposta do servidor.");
      }
    } catch (error: any) {
      setOutput(`Erro de conexão: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const collectInputsFromCode = (code: string): string[] | null => {
    const matches = [...code.matchAll(INPUT_PATTERN)];
    if (matches.length === 0) return [];

    const inputs: string[] = [];
    for (let i = 0; i < matches.length; i++) {
      const method = matches[i][0];
      const userInput = prompt(`Digite o valor para a ${i + 1}ª entrada (${method}):`);
      
      if (userInput === null) {
        alert("Execução cancelada.");
        return null;
      }
      inputs.push(userInput);
    }
    return inputs;
  };

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

  const handleRobotClick = () => {
    if (lastErrorOutput) {
      const advice = parseJavaError(lastErrorOutput);
      if (advice) {
        setRobotMessageType('error');
        setRobotMessage(advice);
      } else {
        setRobotMessage("Não encontrei o erro agora, mas você pode tentar rodar o código novamente!");
      }
    } else {
      setRobotMessageType('motivation');
      setRobotMessage(getRandomMotivation());
    }
    setShowRobotBalloon(true);
  };

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-white overflow-hidden font-sans">
      <header className="p-4 border-b-2 border-purple-900 flex justify-between items-center bg-linear-to-r from-[#6b2d8a] via-[#8b3fa3] to-[#6b2d8a] shadow-2xl shadow-purple-900/50">
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
          <button onClick={runCode} disabled={isRunning} className="flex items-center gap-2 bg-linear-to-r from-[#d000cd] to-[#b3009b] px-5 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50">
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            RODAR CÓDIGO
          </button>
        </div>
      </header>
      
      <main className="flex-1 flex overflow-hidden">
        <div className="w-56 bg-linear-to-b from-[#1a1a1b] to-[#252526] border-r-2 border-purple-900/30 flex flex-col">
          <div className="p-3 flex justify-between items-center border-b-2 border-purple-900/50 text-[10px] font-bold text-purple-300 uppercase tracking-widest bg-linear-to-r from-purple-900/20 to-transparent">
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
                className={`flex items-center justify-between group px-3 py-2.5 cursor-pointer text-sm transition-all duration-200 ${activeFileIndex === index ? 'bg-linear-to-r from-purple-900/50 to-purple-800/30 text-white border-l-4 border-purple-500 shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:bg-purple-900/20 hover:text-purple-300'}`}
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

        <div className="flex-1 border-r-2 border-purple-900/30 relative bg-linear-to-br from-[#1e1e1e] to-[#252526]">
          <div className="absolute top-0 left-0 bg-linear-to-r from-purple-900/40 to-transparent px-4 py-2 text-[11px] text-purple-300 z-10 border-b-2 border-r-2 border-purple-900/50 font-bold uppercase tracking-wider">
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

        <div className="w-96 flex flex-col bg-linear-to-b from-[#0a0a0b] to-[#1a1a1b] border-l-2 border-purple-900/30">
          <div className="flex h-full flex-col">
            <div className="flex-1 flex flex-col">
              <div className="p-3 bg-linear-to-r from-purple-900/40 via-purple-900/20 to-transparent text-[11px] font-bold text-purple-300 border-b-2 border-purple-900/50 uppercase tracking-wider flex items-center gap-2">
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

      {/* Robô Kodeo */}
      <div className="fixed bottom-4 left-4 flex items-end gap-2 z-50">
        {showRobotBalloon && (
          <div className="relative bg-linear-to-br from-purple-800 to-purple-900 text-white p-4 rounded-2xl max-w-sm shadow-2xl border-2 border-purple-300 animate-fadeIn">
            <div className="absolute left-0 bottom-4 transform -translate-x-2 rotate-45 w-4 h-4 bg-purple-800 border-l-2 border-b-2 border-purple-300"></div>
            <button 
              onClick={() => setShowRobotBalloon(false)}
              className="absolute top-1 right-2 text-white/50 hover:text-white"
            >
              ✕
            </button>
            <p className="font-medium leading-relaxed whitespace-pre-line">
              {robotMessage}
            </p>
          </div>
        )}

        <button 
          onClick={handleRobotClick}
          className="relative group focus:outline-none"
          title="Clique em mim para dicas!"
        >
          <div className="w-20 h-20 bg-linear-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-110 animate-float">
            <Image
              src="/robo-kodeo.svg"
              width={60}
              height={60}
              alt="Robô Kodeo"
              className="object-contain"
            />
          </div>
          {lastErrorOutput && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
          )}
        </button>
      </div>
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