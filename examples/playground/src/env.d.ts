/// <reference types="vite/client" />

/**
 * Vue 单文件模块声明
 * Vue SFC module declaration.
 */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
