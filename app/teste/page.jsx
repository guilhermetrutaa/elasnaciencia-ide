"use client";

import React, { useState } from 'react';
import { Github, Play, Heart, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-[#0f0a1a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-pink-600/10 rounded-full blur-[120px] animate-pulse" />

      {/* Card Principal */}
      <main className="z-10 max-w-4xl w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 shadow-2xl transform transition-all">
        
        {/* Cabeçalho com Emoção */}
        <div className="text-center space-y-4 mb-10">
          <div className="flex justify-center mb-2">
            <div className="bg-purple-500/20 p-3 rounded-full animate-bounce">
              <Heart className="w-8 h-8 text-pink-400 fill-pink-400" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-300 to-purple-400 bg-clip-text text-transparent animate-gradient-x">
            Um Presente Especial para Você
          </h1>
          <p className="text-gray-300 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto italic">
            "Ensinar é plantar sementes que florescem para sempre. Este projeto foi construído com gratidão por todo o conhecimento compartilhado."
          </p>
        </div>

        <div className="relative group mb-12">
          {/* Brilho ao redor do vídeo */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/50 to-pink-600/50 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-700"></div>
          
          <div className="relative aspect-video w-full bg-black/40 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <video 
              className="w-full h-full object-cover"
              controls
              playsInline
              poster="/thumb-video.jpg" // Opcional: imagem que aparece antes do play
            >
              <source src="/presente.mp4" type="video/mp4" />
              Seu navegador não suporta vídeos.
            </video>
          </div>
        </div>

        {/* Botões de Navegação */}
        <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
          
          <Link href="/ide" className="group relative px-8 py-4 w-full md:w-auto overflow-hidden rounded-xl bg-purple-600 font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2">
              <Play className="w-5 h-5 fill-current" />
              ENTRAR NA IDE
              <Sparkles className="w-4 h-4" />
            </span>
          </Link>

          <a 
            href="https://github.com/SEU_USUARIO/SEU_REPO" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group px-8 py-4 w-full md:w-auto rounded-xl bg-white/5 border border-white/10 font-bold transition-all hover:bg-white/10 hover:border-purple-500/50 flex items-center justify-center gap-2"
          >
            <Github className="w-5 h-5 text-gray-400 group-hover:text-white" />
            VER REPOSITÓRIO
          </a>

        </div>
      </main>

      {/* Footer Discreto */}
      <footer className="z-10 mt-12 text-gray-500 text-center text-sm flex items-center gap-2">
        Feito com amor para a melhor professora. <br />
        Aluno: Guilherme Truta Rolim
      </footer>

      {/* CSS para animações personalizadas */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 5s ease infinite;
        }
      `}</style>
    </div>
  );
}