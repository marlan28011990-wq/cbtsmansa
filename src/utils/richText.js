const allowed = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'SUB', 'SUP', 'P', 'BR', 'UL', 'OL', 'LI'])

export function sanitizeRichText(value = '') {
  if (typeof DOMParser === 'undefined') return String(value).replace(/<[^>]*>/g, '')
  const document = new DOMParser().parseFromString(String(value), 'text/html')
  const clean = (parent) => {
    for (const node of [...parent.childNodes]) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        clean(node)
        if (!allowed.has(node.tagName)) node.replaceWith(...node.childNodes)
        else [...node.attributes].forEach((attribute) => node.removeAttribute(attribute.name))
      } else if (node.nodeType !== Node.TEXT_NODE) node.remove()
    }
  }
  clean(document.body)
  return document.body.innerHTML
}
