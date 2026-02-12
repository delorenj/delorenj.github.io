const server = Bun.serve({
  port: 15847,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname === "/" ? "/index.html" : url.pathname;
    
    const file = Bun.file(`.${path}`);
    if (await file.exists()) {
      return new Response(file);
    }
    
    // Try with .html extension
    const htmlFile = Bun.file(`.${path}.html`);
    if (await htmlFile.exists()) {
      return new Response(htmlFile);
    }
    
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Serving delorenj.github.io on port ${server.port}`);
