const labels = {
  pt: {
    back: "Voltar aos artigos",
    by: "Por",
    words: "palavras",
    minutes: "min",
    empty: "Artigo ainda não publicado.",
    generated: "Publicado a partir do Lemurian™ — informação e qualidade assistidas por IA, com curadoria responsável."
  },
  en: {
    back: "Back to articles",
    by: "By",
    words: "words",
    minutes: "min",
    empty: "Article not published yet.",
    generated: "Published from Lemurian™ — AI-assisted insight and quality, responsibly curated."
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

function localizedArticle(article, lang){
  const translations = article.translations || {};
  const fallbackLang = normalizeLang(article.language_default || article.language);
  const localized = translations[lang] || translations[fallbackLang] || {};
  return {
    ...article,
    ...localized,
    body: localized.body || article.body,
    metrics: localized.metrics || article.metrics || {}
  };
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

async function renderArticle(article, lang){
  const shell = document.getElementById("articleShell");
  const view = localizedArticle(article, lang);
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.title = view.seo_title || view.title || document.title;
  setMeta("description", view.description);
  setProperty("og:title", view.title);
  setProperty("og:description", view.description);
  setProperty("og:type", "article");
  if (view.featured_image) setProperty("og:image", view.featured_image);

  const bodyPath = view.body?.path || "body.html";
  const bodyResponse = await fetch(bodyPath);
  const body = bodyResponse.ok ? await bodyResponse.text() : `<p>${label(lang, "empty")}</p>`;
  const minutes = view.metrics?.reading_time_minutes || Math.max(1, Math.ceil((view.metrics?.word_count || 0) / 250));
  const words = view.metrics?.word_count || view.word_count || 0;
  const author = view.author?.name || "Rodrigo Masini de Melo";
  const date = view.published_at || "";
  const hasTranslations = Boolean(article.translations?.pt && article.translations?.en);

  shell.innerHTML = `
    <div class="article-tools">
      <a class="back-link" href="../">${label(lang, "back")}</a>
      ${hasTranslations ? `<div class="lang article-lang" role="group" aria-label="Idioma / Language">
        <button data-article-lang="pt" class="${lang === "pt" ? "on" : ""}">PT</button><button data-article-lang="en" class="${lang === "en" ? "on" : ""}">EN</button>
      </div>` : ""}
    </div>
    <header class="article-hero">
      <span class="eyebrow">${view.article_type || "Article"}</span>
      <h1>${view.title || "Untitled"}</h1>
      <p>${view.description || ""}</p>
      <div class="article-meta-line">${label(lang, "by")} ${author} · ${date} · ${minutes} ${label(lang, "minutes")} · ${words} ${label(lang, "words")}</div>
    </header>
    ${view.featured_image ? `<img class="featured" src="${view.featured_image}" alt="${view.title || ""}">` : ""}
    <article class="article-body">${body}</article>
    <footer class="article-note">${label(lang, "generated")}</footer>
  `;

  document.querySelectorAll("[data-article-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem("apexArticleLang", button.dataset.articleLang);
      renderArticle(article, button.dataset.articleLang);
    });
  });
}

async function loadArticle(){
  const shell = document.getElementById("articleShell");
  try {
    const response = await fetch("./article.json");
    if (!response.ok) throw new Error("missing article.json");
    const article = await response.json();
    const storedLang = localStorage.getItem("apexArticleLang");
    const defaultLang = normalizeLang(article.language_default || article.language);
    const lang = article.translations?.[storedLang] ? storedLang : defaultLang;
    await renderArticle(article, lang);
  } catch (error) {
    shell.innerHTML = `<a class="back-link" href="../">${labels.pt.back}</a><div class="empty"><h2>${labels.pt.empty}</h2></div>`;
  }
}

loadArticle();
