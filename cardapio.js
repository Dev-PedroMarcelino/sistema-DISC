require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY;

async function verCardapio() {
    try {
        console.log("Buscando o cardápio de modelos do Google...");
        const resposta = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const dados = await resposta.json();

        console.log("\n=== MODELOS DISPONÍVEIS PARA GERAR TEXTO ===");
        dados.models.forEach(modelo => {
            // Filtra para mostrar apenas os modelos que servem para gerar conteúdo (texto)
            if (modelo.supportedGenerationMethods && modelo.supportedGenerationMethods.includes("generateContent")) {
                // Remove a palavra "models/" do nome para facilitar a sua cópia
                console.log("👉", modelo.name.replace("models/", ""));
            }
        });
        console.log("============================================\n");
    } catch (erro) {
        console.error("Erro ao buscar cardápio:", erro);
    }
}

verCardapio();