# DISC Quiz

Projeto DISC com quiz, resultado e relatório em PDF. Inclui integração opcional com Gemini para gerar análise comportamental.

## Como usar a chave da API sem expô-la

1. **Não coloque a chave no frontend.**
2. Crie um arquivo `.env` na raiz do projeto com:

```
GEMINI_API_KEY=seu_valor_aqui
```

3. Instale dependências:

```bash
npm install
```

4. Inicie o servidor local:

```bash
npm start
```

5. Acesse:

```bash
http://localhost:3000/index.html
```

## Deploy recomendado

### GitHub + Vercel / Render / Railway

- Suba o repositório no GitHub.
- Configure `GEMINI_API_KEY` como variável de ambiente no serviço de deploy.
- Não comite o arquivo `.env`.

### Como fica seguro

- O frontend faz requisição para `/api/gemini`.
- O backend usa `process.env.GEMINI_API_KEY`.
- A chave não aparece no código cliente, nem no GitHub.

## Notas

- Se você quiser apenas apresentar o projeto, pode executar localmente com `npm start`.
- Se quiser publicar, use uma plataforma que suporte Node.js e variáveis de ambiente.
