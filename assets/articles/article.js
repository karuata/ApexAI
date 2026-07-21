const I18N = {
  pt: {
    archive: "Arquivo de artigos",
    intro: "Textos publicados a partir do Lemurian aparecerão aqui em formato estático, com versão em português e inglês quando disponível.",
    back: "Voltar ao site",
    emptyTitle: "Nenhum artigo publicado ainda.",
    emptyBody: "A estrutura já está pronta para receber artigos gerados e revisados no Lemurian.",
    read: "Ler artigo",
    words: "palavras",
    minutes: "min"
  },
  en: {
    archive: "Article archive",
    intro: "Texts published from Lemurian will appear here as static pages, with Portuguese and English versions when available.",
    back: "Back to site",
    emptyTitle: "No articles published yet.",
    emptyBody: "The structure is ready to receive articles generated and reviewed in Lemurian.",
    read: "Read article",
    words: "words",
    minutes: "min"
  }
};

let activeLang = "pt";
let manifest = { articles: [] };

function t(key){
  return I18N[activeLang][key] || I18N.en[key] || key;
}

function setLang(lang){
  activeLang = lang;
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll(".lang button").forEach((button) => {
    button.classList.toggle("on", button.dataset.lang === lang);
  });
  document.querySelector("[data-label='archive']").textContent = t("archive");
  document.querySelector("[data-label='intro']").textContent = t("intro");
  document.querySelector("[data-label='back']").textContent = t("back");
  renderArticles();
}

function normalizeLang(language){
  const value = String(language || "").toLowerCase();
  if (value.startsWith("pt") || value.includes("portuguese")) return "pt";
  return "en";
}

function renderArticles(){
  const mount = document.getElementById("articlesMount");
  const articles = (manifest.articles || []).filter((article) => article.status === "published");
  if (!articles.length) {
    mount.innerHTML = `<div class="empty"><h2>${t("emptyTitle")}</h2><p>${t("emptyBody")}</p></div>`;
    return;
  }
  mount.innerHTML = `<div class="article-grid">${articles.map((article) => {
    const minutes = article.reading_time_minutes || Math.max(1, Math.ceil((article.word_count || 0) / 250));
    const language = normalizeLang(article.language).toUpperCase();
    const meta = [language, article.article_type, article.published_at].filter(Boolean).join(" · ");
    return `<article class="article-card">
      <div class="foil-top"></div>
      <div class="in">
        <span class="meta">${meta}</span>
        <h2>${article.title || "Untitled"}</h2>
        <p>${article.description || ""}</p>
        <div class="foot">
          <a href="../${article.url || ""}">${t("read")}</a>
          <span>${minutes} ${t("minutes")} · ${article.word_count || 0} ${t("words")}</span>
        </div>
      </div>
    </article>`;
  }).join("")}</div>`;
}

fetch("./manifest.json")
  .then((response) => response.ok ? response.json() : { articles: [] })
  .then((data) => {
    manifest = data;
    renderArticles();
  })
  .catch(() => renderArticles());

document.querySelectorAll(".lang button").forEach((button) => {
  button.addEventListener("click", () => setLang(button.dataset.lang));
});

setLang("pt");
