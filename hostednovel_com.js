// ==UserScript==
// @name         Novel Translator - HostedNovel
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Traduz capítulos do hostednovel.com para português brasileiro e faz o download em formato .md
// @author       Etoshy
// @match        https://hostednovel.com/novel/*/chapter-*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Função para extrair número do capítulo da URL (Funciona sem alterações)
    function getChapterNumber() {
        const url = window.location.href;
        const match = url.match(/chapter-(\d+)/);
        return match ? match[1] : '1';
    }

    // Função para extrair título da obra (Adaptada para HostedNovel)
    function getSeriesTitle() {
        // O título da obra está em uma tag <a> dentro do <h1>
        const titleElement = document.querySelector('h1.text-center a');
        if (titleElement) {
            return titleElement.textContent.trim();
        }

        // Fallback: extrair da URL
        const url = window.location.href;
        const match = url.match(/novel\/([^\/]+)/); // Alterado de "series/" para "novel/"
        if (match) {
            return match[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }

        return 'Título não encontrado';
    }

    // Função para extrair título do capítulo (Adaptada para HostedNovel)
    function getChapterTitle() {
        // O título do capítulo está em um <span> com ID específico
        const titleElement = document.querySelector('#chapter-title');
        if (titleElement) {
            return titleElement.textContent.trim();
        }
        return 'Capítulo ' + getChapterNumber();
    }

    // Função para extrair conteúdo do capítulo (Adaptada para HostedNovel)
    function getChapterContent() {
        // O conteúdo está dentro de um <div> com ID 'chapter-content'
        const contentElement = document.querySelector('#chapter-content');
        if (contentElement) {
            const clonedContent = contentElement.cloneNode(true);

            // Remove elementos indesejados (propagandas e notas do autor)
            const ads = clonedContent.querySelectorAll('div[id^="ezoic-pub-ad-placeholder"]');
            const novelNotes = clonedContent.querySelectorAll('.bg-light-200.dark\\:bg-dark-500'); // Div das "Novel Notes"
            const scripts = clonedContent.querySelectorAll('script');

            ads.forEach(ad => ad.remove());
            novelNotes.forEach(note => note.remove());
            scripts.forEach(script => script.remove());

            // Extrai o texto de todas as tags <p> restantes
            const paragraphs = clonedContent.querySelectorAll('p');
            let content = '';

            paragraphs.forEach(p => {
                // .textContent pega o texto de todos os nós filhos, ignorando as tags <font>
                const text = p.textContent.trim();
                if (text && text.length > 0) {
                    content += text + '\n\n';
                }
            });

            return content.trim();
        }
        return 'Conteúdo não encontrado';
    }

    // Função para traduzir texto usando Google Translate (Funciona sem alterações)
    async function translateText(text, targetLang = 'pt') {
        if (!text) return '';
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
        return text; // Retorna texto original se a tradução falhar
    }

    // Função para criar e baixar arquivo (formato Markdown) (Funciona sem alterações)
    function downloadFile(filename, content) {
        const element = document.createElement('a');
        const file = new Blob([content], {type: 'text/markdown; charset=utf-8'});
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    // Função para dividir texto em chunks menores para tradução (Funciona sem alterações)
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

    // Função principal para processar e traduzir (Funciona sem alterações lógicas)
    async function processChapter(button) {
        const chapterNum = getChapterNumber();
        const seriesTitle = getSeriesTitle();
        const chapterTitle = getChapterTitle();
        const content = getChapterContent();

        console.log('Processando capítulo:', chapterNum);
        console.log('Título da obra:', seriesTitle);
        console.log('Título do capítulo:', chapterTitle);

        if (content === 'Conteúdo não encontrado') {
            alert('Não foi possível encontrar o conteúdo do capítulo. Verifique o console para mais detalhes.');
            return;
        }

        const originalText = button.textContent;
        const originalStyle = button.style.cssText;

        button.style.cssText = `
            ${originalStyle}
            position: relative;
            overflow: hidden;
            background: #2d3748;
            color: white;
            pointer-events: none;
        `;

        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            background: linear-gradient(90deg, #4299e1, #3182ce);
            width: 0%;
            transition: width 0.3s ease;
            z-index: 1;
        `;
        const progressText = document.createElement('span');
        progressText.style.cssText = `
            position: relative;
            z-index: 2;
        `;
        button.textContent = '';
        button.appendChild(progressBar);
        button.appendChild(progressText);

        function updateProgress(percentage, text) {
            progressBar.style.width = percentage + '%';
            progressText.textContent = text;
        }

        try {
            updateProgress(10, 'Iniciando tradução...');

            updateProgress(20, 'Traduzindo título...');
            const translatedChapterTitle = await translateText(chapterTitle, 'pt');

            const contentChunks = splitTextIntoChunks(content);
            const translatedChunks = [];
            const totalChunks = contentChunks.length;

            for (let i = 0; i < contentChunks.length; i++) {
                const percentage = 20 + ((i + 1) / totalChunks) * 60; // 20% a 80%
                updateProgress(percentage, `Traduzindo... ${i + 1}/${totalChunks}`);
                const translatedChunk = await translateText(contentChunks[i], 'pt');
                translatedChunks.push(translatedChunk);
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            updateProgress(85, 'Finalizando...');
            const translatedContent = translatedChunks.join('\n\n');

            const finalContent = `# ${translatedChapterTitle}\n\n${translatedContent.split('\n\n').map(p => p.trim()).filter(p => p.length > 0).join('\n\n')}`;
            const filename = `${chapterNum.padStart(4, '0')} - ${seriesTitle}.md`;

            updateProgress(95, 'Gerando arquivo...');
            downloadFile(filename, finalContent);

            updateProgress(100, 'Concluído!');
            progressBar.style.background = 'linear-gradient(90deg, #68d391, #48bb78)';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.cssText = originalStyle;
            }, 2000);

        } catch (error) {
            console.error('Erro durante o processamento:', error);
            updateProgress(100, 'Erro na tradução!');
            progressBar.style.background = 'linear-gradient(90deg, #fc8181, #f56565)';

            setTimeout(() => {
                button.textContent = originalText;
                button.style.cssText = originalStyle;
            }, 3000);
        }
    }

    // Criar botão para iniciar tradução (Adaptado para HostedNovel)
    function addTranslateButton() {
        // Encontrar o elemento <h1> que contém os títulos
        const titleElement = document.querySelector('h1.text-center');

        if (!titleElement || document.querySelector('#translate-button-hostednovel')) {
            // Se o título não for encontrado, ou o botão já existir, não faz nada
            return;
        }

        const button = document.createElement('button');
        button.id = 'translate-button-hostednovel';
        button.textContent = 'Traduzir e Baixar Capítulo';
        button.style.cssText = `
            background: #1a202c; /* Cor escura do site */
            color: white;
            border: 1px solid #4a5568;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-family: inherit;
            font-size: 16px;
            font-weight: bold;
            margin-top: 20px;
            margin-bottom: 20px;
            display: block;
            margin-left: auto;
            margin-right: auto;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: all 0.2s ease-in-out;
        `;

        button.addEventListener('click', function() {
            processChapter(this);
        });
        button.addEventListener('mouseenter', function() {
            this.style.background = '#2d3748';
            this.style.borderColor = '#718096';
        });
        button.addEventListener('mouseleave', function() {
            this.style.background = '#1a202c';
            this.style.borderColor = '#4a5568';
        });

        // Inserir o botão após o H1
        titleElement.parentNode.insertBefore(button, titleElement.nextSibling);
    }

    // Tenta adicionar o botão em intervalos para lidar com carregamento dinâmico
    const observer = new MutationObserver((mutations, obs) => {
        if (document.querySelector('h1.text-center')) {
            addTranslateButton();
            obs.disconnect(); // Para de observar uma vez que o botão foi adicionado
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Fallback caso a página já esteja carregada
    if (document.readyState === 'complete') {
        addTranslateButton();
    }
})();
