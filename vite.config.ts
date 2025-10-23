import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import fs from "fs";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Configuração do servidor de desenvolvimento
  const serverConfig: any = {
    host: "::",
    port: 8080,
    strictPort: true,
    hmr: {
      port: 8081,
    },
  };

  // Adicionar HTTPS apenas em desenvolvimento local
  if (mode === "development" && fs.existsSync('./localhost-key.pem') && fs.existsSync('./localhost.pem')) {
    serverConfig.https = {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem'),
    };
  }

  return {
    server: serverConfig,
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
