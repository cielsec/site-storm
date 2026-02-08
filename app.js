(() => {
  const body = document.body;

  const hero = document.getElementById("hero");
  const hub = document.getElementById("hub");
  const enterBtn = document.getElementById("enter-btn");

  const linesEl = document.getElementById("boot-lines");
  const actions = document.getElementById("hero-actions");

  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Parallax var
  const setScrollVar = () => {
    document.documentElement.style.setProperty("--scroll", `${window.scrollY}px`);
  };

  // Cursor custom
  const initCursor = () => {
    if (!cursorDot || !cursorRing) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    const tick = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      cursorRing.style.left = rx + "px";
      cursorRing.style.top = ry + "px";
      requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.left = mx + "px";
      cursorDot.style.top = my + "px";
      body.classList.remove("cursor-hidden");
    });

    document.addEventListener("mouseleave", () => body.classList.add("cursor-hidden"));
    document.addEventListener("mouseenter", () => body.classList.remove("cursor-hidden"));

    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("button,a,summary")) body.classList.add("cursor-hover");
    });
    document.addEventListener("mouseout", () => body.classList.remove("cursor-hover"));

    if (window.matchMedia("(pointer: coarse)").matches) {
      body.classList.add("cursor-hidden");
    }

    tick();
  };

  // ===== BOOT terminal (digitando) =====
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));

  const span = (cls, text) => `<span class="${cls}">${esc(text)}</span>`;

  const bootLines = [
    `${span("term-user","┌──(ciel)")}㉿${span("term-host","kali")}${span("term-user",")-[~]")}\n${span("term-user","└─$")} ${span("cmd","whoami")}`,
    `${span("term-ok","ciel")}`,
    `${span("term-user","└─$")} ${span("cmd","echo \"conhecimento é poder\"")}`,
    `${span("term-dim","conhecimento é poder")}`,
    `${span("term-user","└─$")} ${span("cmd","echo \"disciplina > ego\"")}`,
    `${span("term-dim","disciplina > ego")}`,
    `${span("term-user","└─$")} ${span("cmd","echo \"método vence sorte\"")}`,
    `${span("term-dim","método vence sorte")}`,
    `${span("term-user","└─$")} ${span("cmd","init --modules panel projects tools")}`,
    `${span("term-ok","[OK]")} ${span("term-dim","carregando módulos...")}`,
    `${span("term-ok","[OK]")} ${span("term-dim","preparando interface...")}`,
    `${span("term-ok","[OK]")} ${span("term-dim","pronto.")}`,
  ];

  async function typeLine(html, speed = 10) {
    const line = document.createElement("div");
    line.className = "term-line";
    linesEl.appendChild(line);

    const plain = html.replace(/<[^>]+>/g, "");
    let out = "";

    for (let i = 0; i < plain.length; i++) {
      out += plain[i];
      line.textContent = out;
      await sleep(speed);
    }

    line.innerHTML = html;
    linesEl.scrollTop = linesEl.scrollHeight;
  }

  async function boot() {
    if (!linesEl) return;

    linesEl.innerHTML = "";
    if (actions) {
      actions.classList.add("hero-actions-hidden");
      actions.classList.remove("hero-actions-visible");
    }

    await sleep(220);

    for (const l of bootLines) {
      await typeLine(l, 9);
      await sleep(220);
    }

    await sleep(200);

    if (actions) {
      actions.classList.remove("hero-actions-hidden");
      actions.classList.add("hero-actions-visible");
    }
  }

  // ===== Troca de tela (wipe/scan) =====
  function showHub() {
    body.classList.add("is-wiping");

    setTimeout(() => {
      hero.classList.add("is-exiting");
      hero.setAttribute("aria-hidden", "true");

      setTimeout(() => {
        hero.classList.remove("is-active", "is-exiting");

        hub.classList.add("is-active");
        hub.setAttribute("aria-hidden", "false");
        hub.focus?.();

        body.classList.remove("is-wiping");
      }, 420);
    }, 80);
  }

  function showHero() {
    body.classList.add("is-wiping");
    setTimeout(() => {
      hub.classList.remove("is-active");
      hub.setAttribute("aria-hidden", "true");

      hero.classList.add("is-active");
      hero.setAttribute("aria-hidden", "false");

      body.classList.remove("is-wiping");
      boot();
    }, 320);
  }

  // ===== Tabs =====
  function activatePanel(panel) {
    document.querySelectorAll(".hub-btn").forEach((b) => {
      const on = b.dataset.panel === panel;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });

    document.querySelectorAll(".hub-panel").forEach((p) => {
      const on = p.dataset.panelId === panel;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
  }

  // ===== Projetos: drop + copiar =====
  const loadCodeFromTemplate = (codeEl) => {
    const tplId = codeEl?.dataset?.template;
    if (!tplId) return;
    const tpl = document.getElementById(tplId);
    if (!tpl) return;
    const inner = tpl.content.querySelector("code");
    if (!inner) return;
    codeEl.textContent = inner.textContent || "";
  };

  function closeAllDrops(exceptKey = null) {
    document.querySelectorAll(".project-card").forEach((card) => {
      const key = card.dataset.project;
      if (exceptKey && key === exceptKey) return;
      card.classList.remove("is-open");
      const drop = card.querySelector(".project-drop");
      if (drop) drop.setAttribute("aria-hidden", "true");
    });
  }

  function toggleDrop(key) {
    const card = document.querySelector(`.project-card[data-project="${key}"]`);
    if (!card) return;

    const drop = document.getElementById(`drop-${key}`);
    if (!drop) return;

    const opening = !card.classList.contains("is-open");
    closeAllDrops(opening ? key : null);

    card.classList.toggle("is-open", opening);
    drop.setAttribute("aria-hidden", opening ? "false" : "true");

    if (opening) {
      const codeEl = drop.querySelector("code[data-template]");
      if (codeEl && !codeEl.dataset.loaded) {
        loadCodeFromTemplate(codeEl);
        codeEl.dataset.loaded = "1";
      }
      drop.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  async function copyFromSelector(sel, btn) {
    const el = document.querySelector(sel);
    if (!el) return;

    const text = el.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      const old = btn.textContent;
      btn.textContent = "COPIADO ✓";
      setTimeout(() => (btn.textContent = old), 1100);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      const old = btn.textContent;
      btn.textContent = "COPIADO ✓";
      setTimeout(() => (btn.textContent = old), 1100);
    }
  }

  // ===== Eventos =====
  window.addEventListener("scroll", setScrollVar, { passive: true });
  window.addEventListener("load", () => {
    setScrollVar();
    boot();
  });

  initCursor();

  enterBtn?.addEventListener("click", showHub);

  document.addEventListener("click", (e) => {
    const back = e.target.closest?.('[data-action="back"]');
    if (back) showHero();

    const tab = e.target.closest?.(".hub-btn");
    if (tab) activatePanel(tab.dataset.panel);

    const more = e.target.closest?.(".project-more");
    if (more) toggleDrop(more.dataset.projectOpen);

    const copy = e.target.closest?.(".copy-btn");
    if (copy) copyFromSelector(copy.dataset.copy, copy);
  });
})();
      // ===== DSTAT L7 =====
      const dstatImg = document.getElementById("dstat-img");
      const dstatUrlEl = document.getElementById("dstat-url");
      const dstatStatus = document.getElementById("dstat-status");
      const dstatRefresh = document.getElementById("dstat-refresh");
      const dstatOpen = document.getElementById("dstat-open");

      const setDstatStatus = (t, c) => {
        if(!dstatStatus) return;
        dstatStatus.textContent = t;
        dstatStatus.style.color =
          c === "ok" ? "rgba(0,255,153,.85)" :
          c === "bad" ? "rgba(255,77,77,.90)" :
          c === "warn" ? "rgba(255,210,77,.95)" :
          "rgba(0,255,153,.75)";
      };

      const buildDstatUrl = (ipOrHost) => {
        // endpoint original que você passou:
        // https://www.vedbex.com/tools/ajax/dstat/L7/graph?ip=91.212.155.101&title=false
        const ip = encodeURIComponent(ipOrHost);
        return `https://www.vedbex.com/tools/ajax/dstat/L7/graph?ip=${ip}&title=false`;
      };

      const loadDstat = () => {
        const host = (hostEl?.value || "").trim();
        if(!host){
          setDstatStatus("SEM HOST", "bad");
          if(dstatUrlEl) dstatUrlEl.textContent = "Informe um host/IP na aba Central.";
          if(dstatImg) dstatImg.removeAttribute("src");
          return;
        }

        const url = buildDstatUrl(host);
        if(dstatUrlEl) dstatUrlEl.textContent = url;

        // Cache-buster pra forçar reload
        const bust = (url.includes("?") ? "&" : "?") + "t=" + Date.now();

        setDstatStatus("LOADING", "warn");
        if(dstatImg){
          dstatImg.onload = () => setDstatStatus("OK", "ok");
          dstatImg.onerror = () => {
            setDstatStatus("FAIL", "bad");
          };
          dstatImg.src = url + bust;
        }
      };

      dstatRefresh?.addEventListener("click", loadDstat);
      dstatOpen?.addEventListener("click", () => {
        const host = (hostEl?.value || "").trim();
        if(!host) return;
        window.open(buildDstatUrl(host), "_blank", "noopener,noreferrer");
      });

      // Auto: quando sair digitando host, atualiza depois de um tempinho
      let dstatDebounce;
      hostEl?.addEventListener("input", () => {
        clearTimeout(dstatDebounce);
        dstatDebounce = setTimeout(loadDstat, 450);
      });

