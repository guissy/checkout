// scripts/check-hook-deps.ts
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

// 检查文件是否为 TypeScript 文件
const isTypeScriptFile = (file: string): boolean => {
  return file.endsWith('.ts') || file.endsWith('.tsx');
};

// 从依赖项数组中检测可疑的 setState 对
const detectSuspiciousDeps = (deps: ts.NodeArray<ts.Expression>, sourceFile: ts.SourceFile): string[] => {
  const suspiciousPairs: string[] = [];
  const depStrings = deps.map(dep => {
    const text = dep.getText(sourceFile);
    return text.trim();
  });

  // 创建状态变量和 setter 的映射
  const stateVars = new Set<string>();
  const stateSetters = new Map<string, string>();

  // 首先收集所有状态变量和 setter
  for (const dep of depStrings) {
    if (dep.startsWith('set') && dep[3] === dep[3].toUpperCase()) {
      const stateVar = dep[3].toLowerCase() + dep.slice(4);
      stateSetters.set(stateVar, dep);
    } else {
      stateVars.add(dep);
    }
  }

  // 检查是否有状态变量和对应的 setter 同时存在
  for (const [stateVar, setter] of stateSetters.entries()) {
    if (stateVars.has(stateVar)) {
      suspiciousPairs.push(`"${stateVar}" and "${setter}"`);
    }
  }

  return suspiciousPairs;
};

// 遍历 AST 查找 React Hooks
const visit = (node: ts.Node, sourceFile: ts.SourceFile, filePath: string) => {
  // 检查是否是 Hook 调用（useXXX）
  if (ts.isCallExpression(node) &&
    ts.isIdentifier(node.expression) &&
    node.expression.text.startsWith('use')) {

    // 检查是否有依赖项数组
    const deps = node.arguments[1];
    if (deps && ts.isArrayLiteralExpression(deps)) {
      const suspiciousPairs = detectSuspiciousDeps(deps.elements, sourceFile);

      if (suspiciousPairs.length > 0) {
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
        console.log(`⚠️  Potential hook dependency issue found in ${filePath}:${line + 1}:${character + 1}`);
        console.log(`   Hook: ${node.expression.text}`);
        suspiciousPairs.forEach(pair => {
          console.log(`   Suspicious pair: ${pair}`);
        });
        console.log();
      }
    }
  }

  ts.forEachChild(node, child => visit(child, sourceFile, filePath));
};

// 处理单个文件
const processFile = (filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );

  visit(sourceFile, sourceFile, filePath);
};

// 递归遍历目录
const walkDir = (dir: string) => {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (isTypeScriptFile(fullPath)) {
      processFile(fullPath);
    }
  });
};

// 主函数
const main = () => {
  const srcDir = path.join(process.cwd(), 'src');

  if (!fs.existsSync(srcDir)) {
    console.error('Error: src directory not found');
    process.exit(1);
  }

  console.log('🔍 Scanning for potential hook dependency issues...\n');
  walkDir(srcDir);
  console.log('✅ Scan completed');
};

main();
