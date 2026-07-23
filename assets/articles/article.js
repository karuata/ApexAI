const I18N = {
  pt: {
    archive: "Arquivo de artigos",
    back: "Voltar ao site",
    emptyTitle: "Nenhum artigo publicado ainda.",
    read: "Ler artigo",
    words: "palavras",
    minutes: "min"
  },
  en: {
    archive: "Article archive",
    back: "Back to site",
    emptyTitle: "No articles published yet.",
    read: "Read article",
    words: "words",
    minutes: "min"
  }
};

let activeLang = "en";
let manifest = { articles: [] };

function t(key){
  return I18N[activeLang][key] || I18N.en[key] || key;
}

function setLang(lang){
  activeLang = lang;
  localStorage.setItem("apexArticlesLang", lang);
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll(".lang button").forEach((button) => {
    button.classList.toggle("on", button.dataset.lang === lang);
  });
  document.querySelector("[data-label='archive']").textContent = t("archive");
  document.querySelector("[data-label='back']").textContent = t("back");
  renderArticles();
}

function normalizeLang(language){
  const value = String(language || "").toLowerCase();
  if (value.startsWith("pt") || value.includes("portuguese")) return "pt";
  return "en";
}

function localizeArticle(article){
  const translations = article.translations || {};
  const fallbackLang = normalizeLang(article.language_default || article.language);
  const localized = translations[activeLang] || translations[fallbackLang] || {};
  return {
    ...article,
    ...localized,
    word_count: localized.word_count || localized.metrics?.word_count || article.word_count,
    reading_time_minutes: localized.reading_time_minutes || localized.metrics?.reading_time_minutes || article.reading_time_minutes
  };
}

function renderArticles(){
  const mount = document.getElementById("articlesMount");
  const articles = (manifest.articles || [])
    .filter((article) => article.status === "published")
    .sort((a, b) => String(b.published_at || "").localeCompare(String(a.published_at || "")));
  if (!articles.length) {
    mount.innerHTML = `<div class="empty"><h2>${t("emptyTitle")}</h2></div>`;
    return;
  }
  mount.innerHTML = `<div class="article-grid">${articles.map((article) => {
    const view = localizeArticle(article);
    const minutes = view.reading_time_minutes || Math.max(1, Math.ceil((view.word_count || 0) / 250));
    const language = article.translations ? activeLang.toUpperCase() : normalizeLang(view.language).toUpperCase();
    const meta = [language, view.article_type, view.published_at].filter(Boolean).join(" · ");
    return `<article class="article-card">
      <div class="foil-top"></div>
      <div class="in">
        <span class="meta">${meta}</span>
        <h2>${view.title || "Untitled"}</h2>
        <p>${view.description || ""}</p>
        <div class="foot">
          <a href="../${article.url || ""}">${t("read")}</a>
          <span>${minutes} ${t("minutes")} · ${view.word_count || 0} ${t("words")}</span>
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

setLang(localStorage.getItem("apexArticlesLang") || "en");
