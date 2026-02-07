(() => {
  const body = document.body;

  const hero = document.getElementById("hero");
  const hub = document.getElementById("hub");
  const enterBtn = document.getElementById("enter-btn");

  const linesEl = document.getElementById("boot-lines");
  const actions = document.getElementById("hero-actions");

  const hubButtons = document.querySelectorAll(".hub-btn");
  const hubPanels = document.querySelectorAll(".hub-panel");

  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Scroll parallax var
  const setScrollVar = () => {
    document.documentElement.style.setProperty("--scroll", `${window.scrollY}px`);
  };
  window.addEventListener("scroll", setScrollVar, { passive: true });
  window.addEventListener("load", setScrollVar);

  // Cursor (sem duplicar)
  const initCursor = () => {
    if (!cursorDot || !cursorRing) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.left = `${mx}px`;
      cursorDot.style.top = `${my}px`;
      body.classList.remove("cursor-hidden");
    };

    const tick = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      cursorRing.style.left = `${rx}px`;
      cursorRing.style.top = `${ry}px`;
      requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", () => body.classList.add("cursor-hidden"));
    document.addEventListener("mouseenter", () => body.classList.remove("cursor-hidden"));

    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("button, a, summary")) body.classList.add("cursor-hover");
    });
    document.addEventListener("mouseout", () => body.classList.remove("cursor-hover"));

    if (window.matchMedia("(pointer: coarse)").matches) {
      body.classList.add("cursor-hidden");
    }

    tick();
  };

  // Tabs do hub
  const activatePanel = (target) => {
    hubButtons.forEach(btn => {
      const on = btn.dataset.panel === target;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });

    hubPanels.forEach(panel => {
      const on = panel.dataset.panelId === target;
      panel.classList.toggle("is-active", on);
      panel.hidden = !on;
    });
  };

  hubButtons.forEach((button) => {
    button.addEventListener("click", () => activatePanel(button.dataset.panel));
  });

  // ===== Terminal boot =====
  const bootLines = [
    { text: `┌──(ciel㉿kali)-[~]\n└─$ whoami`, cls: "term-line", wait: 350 },
    { text: `ciel`, cls: "term-line term-ok", wait: 220 },

    { text: `└─$ echo "conhecimento é poder"`, cls: "term-line", wait: 260 },
    { text: `conhecimento é poder`, cls: "term-line term-dim", wait: 200 },

    { text: `└─$ echo "disciplina > ego"`, cls: "term-line", wait: 260 },
    { text: `disciplina > ego`, cls: "term-line term-dim", wait: 200 },

    { text: `└─$ echo "silêncio. precisão. controle."`, cls: "term-line", wait: 260 },
    { text: `silêncio. precisão. controle.`, cls: "term-line term-dim", wait: 240 },

    { text: `└─$ init --modules panel projects tools`, cls: "term-line", wait: 340 },
    { text: `[OK] carregando módulos...`, cls: "term-line term-ok", wait: 220 },
    { text: `[OK] preparando interface...`, cls: "term-line term-ok", wait: 220 },
    { text: `[OK] pronto.`, cls: "term-line term-ok", wait: 180 },
  ];

  async function typeLine(text, cls = "term-line", speed = 12) {
    if (!linesEl) return;

    const line = document.createElement("div");
    line.className = cls;
    linesEl.appendChild(line);

    // digitando com suporte a \n (multi-linha)
    let out = "";
    for (let i = 0; i < text.length; i++) {
      out += text[i];
      line.textContent = out;
      await sleep(speed);
    }
    linesEl.scrollTop = linesEl.scrollHeight;
  }

  async function boot() {
    if (!linesEl) return;

    // reseta
    linesEl.innerHTML = "";

    // esconde botão até final
    if (actions) {
      actions.classList.add("hero-actions-hidden");
      actions.classList.remove("hero-actions-visible");
    }

    await sleep(220);

    for (const l of bootLines) {
      await typeLine(l.text, l.cls, 10);
      await sleep(l.wait);
    }

    if (actions) {
      actions.classList.remove("hero-actions-hidden");
      actions.classList.add("hero-actions-visible");
    }
  }

  // ===== Troca de tela com wipe =====
  const goHub = () => {
    if (!hero || !hub) return;
    if (hero.classList.contains("is-exiting")) return;

    body.classList.add("is-wiping");
    hero.classList.add("is-exiting");
    hero.setAttribute("aria-hidden", "true");

    setTimeout(() => {
      hero.classList.remove("is-active", "is-exiting");

      hub.classList.add("is-active");
      hub.setAttribute("aria-hidden", "false");
      hub.focus?.();

      body.classList.remove("is-wiping");
    }, 520);
  };

  const goHero = () => {
    if (!hero || !hub) return;

    body.classList.add("is-wiping");

    setTimeout(() => {
      hub.classList.remove("is-active");
      hub.setAttribute("aria-hidden", "true");

      hero.classList.add("is-active");
      hero.setAttribute("aria-hidden", "false");

      body.classList.remove("is-wiping");

      boot();
    }, 420);
  };

  enterBtn?.addEventListener("click", goHub);

  document.addEventListener("click", (e) => {
    const back = e.target.closest?.('[data-action="back"]');
    if (back) goHero();
  });

  // Init
  initCursor();
  window.addEventListener("load", boot);
})();
