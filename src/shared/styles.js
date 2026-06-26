/**
 * Convert a single "prop: value;" declaration into a [camelCaseName, value] pair.
 * @param {string} declaration e.g. "background-color: #fff;"
 * @returns {[string, string]}
 */
export function parseStyleDeclaration(declaration) {
  const rawName = declaration.split(":")[0].trim();
  const value = declaration.split(":")[1].split(";")[0].trim();
  const name = rawName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  return [name, value];
}

/**
 * Apply an array of "prop: value;" declarations to an element's inline style.
 * @param {HTMLElement} element
 * @param {string[]} declarations
 */
export function applyDeclarations(element, declarations) {
  for (const declaration of declarations) {
    const [name, value] = parseStyleDeclaration(declaration);
    element.style[name] = value;
  }
}
