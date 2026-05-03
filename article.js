document.addEventListener("DOMContentLoaded", async () => {
  const contentDiv = document.getElementById("markdown-content");
  const loader = document.getElementById("loader");
  const errorBox = document.getElementById("errorBox");
  
  // Get article ID from URL (e.g. article.html?id=example)
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');

  if (!articleId) {
    showError("未提供文章 ID。请从主页点击文章链接进入。");
    return;
  }

  try {
    // 1. Fetch the markdown file
    const response = await fetch(`articles/${articleId}.md`);
    if (!response.ok) throw new Error("无法加载文章内容");
    
    let markdownText = await response.text();

    // 2. Simple frontmatter parser (remove metadata block at the top if present)
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
    const match = markdownText.match(frontmatterRegex);
    let title = "";
    
    if (match) {
      markdownText = markdownText.replace(frontmatterRegex, "");
      // simple extraction for title
      const titleMatch = match[1].match(/title:\s*["']?([^"'\n]+)["']?/);
      if (titleMatch) title = titleMatch[1];
    }

    // Update page title
    if (title) document.title = `${title} — My Wiki`;

    // 3. Configure marked.js to use highlight.js for code blocks
    marked.setOptions({
      highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
      langPrefix: 'hljs language-',
      gfm: true,
      breaks: true
    });

    // 4. Parse and render HTML
    contentDiv.innerHTML = marked.parse(markdownText);
    
    // 5. Hide loader and show content
    loader.style.display = "none";
    contentDiv.style.display = "block";

  } catch (err) {
    console.error(err);
    showError();
  }

  function showError(msg) {
    loader.style.display = "none";
    errorBox.style.display = "block";
    if (msg) errorBox.querySelector("p").textContent = msg;
  }

  // Handle Theme switching for syntax highlighting (hl.js)
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const hljsThemeLink = document.getElementById('hljsTheme');
  
  function updateHljsTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    if (isDark) {
      hljsThemeLink.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/a11y-dark.min.css";
    } else {
      hljsThemeLink.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/a11y-light.min.css";
    }
  }

  themeToggleBtn?.addEventListener('click', () => {
    // slight delay to allow document element attribute to update
    setTimeout(updateHljsTheme, 10);
  });
  
  // initialize hljs theme
  updateHljsTheme();
});
