import prettier from 'prettier/standalone';
import parserBabel from 'prettier/plugins/babel.mjs';
import parserTypescript from 'prettier/plugins/typescript.mjs';
import parserHtml from 'prettier/plugins/html.mjs';
import parserPostcss from 'prettier/plugins/postcss.mjs';
import parserEstree from 'prettier/plugins/estree.mjs';

type Language = 'javascript' | 'typescript' | 'html' | 'css' | 'json';

export const formatCode = (code: string, language: Language): string => {
  const parserMap: Record<Language, string> = {
    javascript: 'babel',
    typescript: 'typescript',
    html: 'html',
    css: 'css',
    json: 'json',
  };

  const parser = parserMap[language];
  const pluginSet = [parserEstree];

  if (language === 'javascript' || language === 'json') pluginSet.push(parserBabel);
  if (language === 'typescript') pluginSet.push(parserTypescript);
  if (language === 'html') pluginSet.push(parserHtml);
  if (language === 'css') pluginSet.push(parserPostcss);

  try {
    return prettier.format(code, {
      parser,
      plugins: pluginSet,
      semi: true,
      singleQuote: true,
    });
  } catch (err) {
    console.error('Format error:', err);
    return code;
  }
};