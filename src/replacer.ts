/**
 * 替换资源引用
 * Replace asset references in text.
 * @param content 内容 / Content.
 * @param replacements 替换映射 / Replacement map.
 */
export function replaceReferences(content: string, replacements: Map<string, string>): string {
  let result = content;
  for (const [from, to] of replacements.entries()) {
    if (from === to) {
      continue;
    }
    result = result.split(from).join(to);
  }
  return result;
}
