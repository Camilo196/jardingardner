(function () {
  const pairs = [
    ['Ãƒâ€˜', 'Ñ'], ['ÃƒÂ‘', 'Ñ'], ['Ãƒâ€œ', 'Ó'], ['ÃƒÂ³', 'ó'],
    ['ÃƒÂ©', 'é'], ['ÃƒÂ¡', 'á'], ['ÃƒÂ­', 'í'], ['ÃƒÂº', 'ú'],
    ['ÃƒÂ±', 'ñ'], ['Ã¡', 'á'], ['Ã©', 'é'], ['Ã­', 'í'],
    ['Ã³', 'ó'], ['Ãº', 'ú'], ['Ã±', 'ñ'], ['Ã‘', 'Ñ'],
    ['Ã‰', 'É'], ['Ã“', 'Ó'], ['Ã', 'Í'], ['Ãš', 'Ú'],
    ['Â¿', '¿'], ['Â¡', '¡'], ['Â·', '·'], ['Â°', '°'],
    ['â€“', '-'], ['â€”', '-'], ['â€¦', '...'], ['â†’', '->'],
    ['â€œ', '"'], ['â€', '"'], ['â€˜', "'"], ['â€™', "'"],
    ['â–¼', '▼'], ['âœ…', 'OK'], ['âŒ', 'Error'],
    ['âš ï¸', 'Advertencia'], ['âœ”', 'Aprobado'], ['âœ˜', 'Por mejorar'],
    ['Ã¢â€â‚¬', '-'], ['Ã¢â€¢Â', '='], ['â”€', '-'], ['â•', '='],
  ];

  function fixText(value) {
    if (!value || !/[ÃÂâ�]/.test(value)) return value;
    let output = value;
    for (let i = 0; i < 3; i += 1) {
      for (const [bad, good] of pairs) output = output.split(bad).join(good);
    }
    return output;
  }

  function fixNode(node) {
    if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const text = walker.currentNode;
      const fixed = fixText(text.nodeValue);
      if (fixed !== text.nodeValue) text.nodeValue = fixed;
    }
    node.querySelectorAll('[placeholder],[title],[aria-label],[alt]').forEach((el) => {
      ['placeholder', 'title', 'aria-label', 'alt'].forEach((attr) => {
        if (!el.hasAttribute(attr)) return;
        const current = el.getAttribute(attr);
        const fixed = fixText(current);
        if (fixed !== current) el.setAttribute(attr, fixed);
      });
    });
  }

  function start() {
    fixNode(document.body);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const fixed = fixText(node.nodeValue);
            if (fixed !== node.nodeValue) node.nodeValue = fixed;
          } else {
            fixNode(node);
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
