// ==UserScript==
// @name         Novel Translator - WhimsicalReads
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Traduz capítulos de whimsicalreads.com para português brasileiro
// @author       Etoshy
// @match        https://whimsicalreads.com/series/*/chapter-*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Função para extrair número do capítulo
    function getChapterNumber() {
        const breadcrumb = document.querySelector('.breadcrumb li.active');
        if (breadcrumb) {
            const text = breadcrumb.textContent;
            const match = text.match(/Chapter (\d+)/);
            if (match) return match[1];
        }

        const url = window.location.href;
        const match = url.match(/chapter-(\d+)/);
        return match ? match[1] : '1';
    }

    // Função para extrair título da obra
    function getSeriesTitle() {
        const breadcrumbLinks = document.querySelectorAll('.breadcrumb li a');
        for (let link of breadcrumbLinks) {
            if (link.href.includes('/series/')) {
                return link.textContent.trim();
            }
        }

        const url = window.location.href;
        const match = url.match(/series\/([^\/]+)/);
        if (match) {
            return match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }

        return 'Título não encontrado';
    }

    // Função para extrair título do capítulo
    function getChapterTitle() {
        const breadcrumb = document.querySelector('.breadcrumb li.active');
        if (breadcrumb) {
            const text = breadcrumb.textContent.trim();
            const match = text.match(/Chapter \d+ - (.+)/);
            if (match) return match[1].trim();
        }

        const h1 = document.querySelector('.text-left h1');
        if (h1) {
            return h1.textContent.trim();
        }

        return 'Capítulo ' + getChapterNumber();
    }

    // Função para extrair conteúdo do capítulo
    function getChapterContent() {
        const contentElement = document.querySelector('.text-left');
        if (contentElement) {
            const clonedContent = contentElement.cloneNode(true);

            // Remove scripts, ads e outros elementos desnecessários
            const unwantedElements = clonedContent.querySelectorAll('script, .code-block, ins, div[id*="bg-ssp"], h1');
            unwantedElements.forEach(el => el.remove());

            const paragraphs = clonedContent.querySelectorAll('p');
            let content = '';

            paragraphs.forEach(p => {
                const text = p.textContent.trim();
                if (text && text.length > 0 && !text.includes('CONTENT END')) {
                    content += text + '\n\n';
                }
            });

            return content.trim();
        }
        return 'Conteúdo não encontrado';
    }

    // Função para traduzir texto usando Google Translate
    async function translateText(text, targetLang = 'pt') {
        try {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data && data[0]) {
                return data[0].map(item => item[0]).join('');
            }
        } catch (error) {
            console.error('Erro na tradução:', error);
        }

        return text;
    }

    // Função para criar e baixar arquivo (formato Markdown)
    function downloadFile(filename, content) {
        const element = document.createElement('a');
        const file = new Blob([content], {type: 'text/markdown; charset=utf-8'});
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    // Função para dividir texto em chunks menores para tradução
    function splitTextIntoChunks(text, maxLength = 4000) {
        const sentences = text.split(/(?<=[.!?])\s+/);
        const chunks = [];
        let currentChunk = '';

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += (currentChunk ? ' ' : '') + sentence;
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    // Função principal para processar e traduzir
    async function processChapter(button) {
        const chapterNum = getChapterNumber();
        const seriesTitle = getSeriesTitle();
        const chapterTitle = getChapterTitle();
        const content = getChapterContent();

        console.log('Processando capítulo:', chapterNum);
        console.log('Título da obra:', seriesTitle);
        console.log('Título do capítulo:', chapterTitle);

        // Configurar botão para mostrar progresso
        const originalText = button.textContent;
        const originalStyle = button.style.cssText;

        // Configurar barra de progresso no botão
        button.style.cssText = `
            ${originalStyle}
            position: relative;
            overflow: hidden;
            background: white;
            color: black;
            pointer-events: none;
        `;

        // Criar elemento da barra de progresso
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: linear-gradient(90deg, #e3f2fd, #2196f3);
            width: 0%;
            transition: width 0.3s ease;
            z-index: -1;
        `;
        button.appendChild(progressBar);

        // Função para atualizar progresso
        function updateProgress(percentage, text) {
            progressBar.style.width = percentage + '%';
            button.textContent = text;
        }

        try {
            updateProgress(10, 'Iniciando tradução...');

            // Traduzir título do capítulo
            updateProgress(20, 'Traduzindo título...');
            const translatedChapterTitle = await translateText(chapterTitle, 'pt');

            // Dividir conteúdo em chunks e traduzir
            const contentChunks = splitTextIntoChunks(content);
            const translatedChunks = [];
            const totalChunks = contentChunks.length;

            for (let i = 0; i < contentChunks.length; i++) {
                const percentage = 20 + ((i + 1) / totalChunks) * 60; // 20% a 80%
                updateProgress(percentage, `Traduzindo... ${i + 1}/${totalChunks}`);

                const translatedChunk = await translateText(contentChunks[i], 'pt');
                translatedChunks.push(translatedChunk);

                // Pequena pausa para evitar rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            updateProgress(85, 'Finalizando...');
            const translatedContent = translatedChunks.join('\n\n');

            // Criar conteúdo final em formato Markdown
            const finalContent = `# ${translatedChapterTitle}\n\n${translatedContent.split('\n\n').map(paragraph => paragraph.trim()).filter(p => p.length > 0).join('\n\n')}`;

            // Nome do arquivo
            const filename = `${chapterNum} - ${seriesTitle}.md`;

            updateProgress(95, 'Gerando arquivo...');

            // Baixar arquivo
            downloadFile(filename, finalContent);

            // Sucesso
            updateProgress(100, 'Concluído!');
            progressBar.style.background = 'linear-gradient(90deg, #e8f5e8, #4caf50)';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.cssText = originalStyle;
                button.removeChild(progressBar);
            }, 2000);

        } catch (error) {
            console.error('Erro durante o processamento:', error);

            // Erro
            updateProgress(100, 'Erro na tradução!');
            progressBar.style.background = 'linear-gradient(90deg, #ffebee, #f44336)';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.cssText = originalStyle;
                button.removeChild(progressBar);
            }, 3000);
        }
    }

    // Criar botão para iniciar tradução (posicionado abaixo do título)
    function addTranslateButton() {
        // Encontrar o elemento do título do capítulo
        const titleElement = document.querySelector('.text-left h1');

        if (!titleElement) {
            console.log('Título não encontrado, tentando novamente...');
            setTimeout(addTranslateButton, 1000);
            return;
        }

        const button = document.createElement('button');
        button.textContent = 'Traduzir Capítulo';
        button.style.cssText = `
            background: white;
            color: black;
            border: 2px solid #ddd;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-family: Arial, sans-serif;
            font-size: 14px;
            margin-top: 10px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        `;

        button.addEventListener('click', function() {
            processChapter(this);
        });
        button.addEventListener('mouseenter', function() {
            this.style.background = '#f8f9fa';
            this.style.borderColor = '#adb5bd';
        });
        button.addEventListener('mouseleave', function() {
            this.style.background = 'white';
            this.style.borderColor = '#ddd';
        });

        // Inserir o botão logo após o título
        titleElement.parentNode.insertBefore(button, titleElement.nextSibling);
    }

    // Aguardar carregamento da página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addTranslateButton);
    } else {
        addTranslateButton();
    }

})();
