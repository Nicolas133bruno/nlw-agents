const apiKeyInput = document.getElementById('apikey');
const gameSelect = document.getElementById('gameSelect');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const aiResponse = document.getElementById('aiResponse');
const form = document.getElementById('form');

const markdownToHtml = (text) => {
    const converter = new showdown.Converter();
    return converter.makeHtml(text);
}

const perguntarAI = async (question, game, apiKey) => {
    const model = 'gemini-2.0-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const pergunta = `
  ## Especialidade
Você é um especialista de meta para o jogo ${game}

## Tarefa
Você deve responder a pergunta do usuário com base no seu conhecimento do jogo, estratégias, build e dicas.

## Regras
- Se você não sabe a resposta, responda com "Não sei" e não tente inventar uma resposta.
- Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'.
- Considere a data atual ${new Date().toLocaleDateString()}.
- Faça pesquisas atualizadas sobre o patch atual para dar uma resposta corrente.
- Nunca responda itens que você não tenha certeza que existem no patch atual.

## Resposta
- Economize a resposta, seja direto e responda no máximo 500 caracteres.
- Responda em markdown.
- Não faça saudação ou despedida, apenas responda.

## Pergunta do usuário
${question}
`;

    const prompt= `
    `;

    const contents = [{
        role: 'user',
        parts: [{
            text: pergunta
        }]
    }];
    const tools = [{
        google_search: {}
}]


    try {
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({contents,
            tools
            })
        });

        const data = await response.json();
        console.log(data);
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error("Erro ao perguntar à AI:", error);
        alert("Ocorreu um erro ao tentar obter a resposta da AI. Verifique sua chave de API e tente novamente.");
        throw error;
    }
};

const enviarFormulario = async (event) => {
    event.preventDefault();

    const apiKey = apiKeyInput.value.trim();
    const game = gameSelect.value;
    const question = questionInput.value.trim();

    if (!apiKey || !game || !question) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    askButton.disabled = true;
    askButton.textContent = "Perguntando...";
    askButton.classList.add("loading");

    try {
        const text = await perguntarAI(question, game, apiKey);
        aiResponse.querySelector('.response-content').innerHTML = markdownToHtml(text);
        aiResponse.classList.remove("hidden");
    } catch (error) {
        console.error("Erro:", error);
    } finally {
        askButton.disabled = false;
        askButton.textContent = "Perguntar";
        askButton.classList.remove("loading");
    }
};

form.addEventListener("submit", enviarFormulario);
