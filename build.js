import { build } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const outDir = "assets";
const entryFile = "todo-app/src/main.tsx";
const cssFile = "todo-app/src/index.css";

// 清理输出目录
fs.rmSync(outDir, { recursive: true, force: true });

async function buildApp() {
  const hash = crypto.createHash("sha256")
    .update(Date.now().toString())
    .digest("hex")
    .slice(0, 4);

  // 构建配置
  const config = {
    root: "todo-app", // 设置项目根目录为todo-app
    plugins: [react()],
    build: {
      outDir: path.resolve(outDir), // 解析为绝对路径
      emptyOutDir: true,
      minify: true,
      rollupOptions: {
        input: entryFile,
        output: {
          entryFileNames: `todo-[hash].js`,
          assetFileNames: `todo-[hash].[ext]`,
          format: "es"
        }
      }
    }
  };

  console.log("Building todo-app...");
  await build(config);

  // 生成HTML文件
  const jsFiles = fs.readdirSync(outDir).filter(f => f.endsWith(".js"));
  const cssFiles = fs.readdirSync(outDir).filter(f => f.endsWith(".css"));

  const jsPath = path.join(outDir, jsFiles[0]);
  const cssPath = cssFiles.length > 0 ? path.join(outDir, cssFiles[0]) : null;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Todo App</title>
  ${cssPath ? `<link rel="stylesheet" href="${path.basename(cssPath)}">` : ''}
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${path.basename(jsPath)}"></script>
</body>
</html>`;

  const htmlPath = path.join(outDir, `todo.html`);
  fs.writeFileSync(htmlPath, htmlContent);

  console.log(`Build completed! Output in ${outDir}/`);
  console.log(`HTML file: ${htmlPath}`);
  console.log(`Access the app at: http://localhost:8000/todo.html`);
}

buildApp().catch(err => {
  console.error("Build failed:", err);
  process.exit(1);
});