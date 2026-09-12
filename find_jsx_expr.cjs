const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('src/components/dashboard/pages/ChapterManagementPage.jsx', 'utf-8');

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx']
});

const exprs = new Set();

traverse(ast, {
  JSXExpressionContainer(path) {
    // Only care if it's inside JSXElement children (not attributes)
    if (path.parent.type === 'JSXElement' || path.parent.type === 'JSXFragment') {
      const expr = path.node.expression;
      
      // If it's a logical expression, get the right side
      // Actually just print the code string of the expression
      const codeStr = code.substring(expr.start, expr.end);
      exprs.add(codeStr);
    }
  }
});

console.log("=== JSX CHILD EXPRESSIONS ===");
for (let expr of exprs) {
  console.log(expr);
}
