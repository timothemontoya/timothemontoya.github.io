// Les fichiers .txt sont importés comme une chaîne (raw-loader, voir next.config.ts).
declare module "*.txt" {
  const content: string;
  export default content;
}
