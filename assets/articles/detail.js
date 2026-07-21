const labels = {
  pt: {
    back: "Voltar aos artigos",
    by: "Por",
    words: "palavras",
    minutes: "min",
    empty: "Artigo ainda não publicado.",
    generated: "Publicado a partir do Lemurian"
  },
  en: {
    back: "Back to articles",
    by: "By",
    words: "words",
    minutes: "min",
    empty: "Article not published yet.",
    generated: "Published from Lemurian"
  }
};

function normalizeLang(language){
  const value = String(language || "").toLowerCase();
  if (value.startsWith("pt") || value.includes("portuguese")) return "pt";
  return "en";
}

function label(lang, key){
  return labels[lang][key] || labels.en[key] || key;
}

function setMeta(name, content){
  if (!content) return;
  let node = document.querySelector(`meta[name="${name}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute("name", name);
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
}

function setProperty(property, content){
  if (!content) return;
  let node = document.querySelector(`meta[property="${property}"]`);
  if (!node) {
    node = document.createElement("meta");
    node.setAttribute("property", property);
    document.head.appendChild(node);
  }
  node.setAttribute("content", content);
}

async function loadArticle(){
  const shell = document.getElementById("articleShell");
  try {
    const response = await fetch("./article.json");
    if (!response.ok) throw new Error("missing article.json");
    const article = await response.json();
    const lang = normalizeLang(article.language);
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.title = article.seo_title || article.title || document.title;
    setMeta("description", article.description);
    setProperty("og:title", article.title);
    setProperty("og:description", article.description);
    setProperty("og:type", "article");
    if (article.featured_image) setProperty("og:image", article.featured_image);

    const bodyPath = article.body?.path || "body.html";
    const bodyResponse = await fetch(bodyPath);
    const body = bodyResponse.ok ? await bodyResponse.text() : `<p>${label(lang, "empty")}</p>`;
    const minutes = article.metrics?.reading_time_minutes || Math.max(1, Math.ceil((article.metrics?.word_count || 0) / 250));
    const words = article.metrics?.word_count || article.word_count || 0;
    const author = article.author?.name || "Rodrigo Masini de Melo";
    const date = article.published_at || "";

    shell.innerHTML = `
      <a class="back-link" href="../">${label(lang, "back")}</a>
      <header class="article-hero">
        <span class="eyebrow">${article.article_type || "Article"}</span>
        <h1>${article.title || "Untitled"}</h1>
        <p>${article.description || ""}</p>
        <div class="article-meta-line">${label(lang, "by")} ${author} · ${date} · ${minutes} ${label(lang, "minutes")} · ${words} ${label(lang, "words")}</div>
      </header>
      ${article.featured_image ? `<img class="featured" src="${article.featured_image}" alt="${article.title || ""}">` : ""}
      <article class="article-body">${body}</article>
      <footer class="article-note">${label(lang, "generated")}</footer>
    `;
  } catch (error) {
    shell.innerHTML = `<a class="back-link" href="../">${labels.pt.back}</a><div class="empty"><h2>${labels.pt.empty}</h2></div>`;
  }
}

loadArticle();
