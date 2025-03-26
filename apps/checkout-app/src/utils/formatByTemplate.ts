/**
 * 格式化字符串，根据模板字符串
 * @param str
 * @param template
 * @example
 *
 * ```js
 * formatByTemplate('1234567890', '000-0000-0000') // '123-4567-8900'
 * ```
 */
function formatByTemplate(str: string, template?: string) {
  if (!str || !template) {
    return str;
  }
  const end = str.match(/([_\-\s/]+)$/g)
  // 移除模板中定义的所有非数字字符，只保留数字
  const regex = new RegExp('[' + template.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + ']', 'g');
  const digitsOnly = str.replace(regex, '');

  let formattedString = '';
  let index = 0;

  for (let i = 0; i < template.length; i++) {
    const char = template[i];

    if (char === '*') {
      formattedString += digitsOnly[index] || '';
      index++;
    } else {
      formattedString += char;
    }

    if (template[i + 1]?.match(/[_\-\s/]/)) {
      formattedString += template[i + 1];
      i++;
    }
  }
  formattedString += digitsOnly.slice(index);
  return formattedString.replace(/[_\-\s/]+$/, '') + (end?.[0] || '');
}

export const formatNumberSpaced = (template?: string) => (str: string) => formatByTemplate(str, template);

export default formatByTemplate;
