import { mountApp } from "./App";

const root = document.querySelector<HTMLElement>("#root");

if (!root) {
  throw new Error("Root element #root was not found.");
}

mountApp(root);
