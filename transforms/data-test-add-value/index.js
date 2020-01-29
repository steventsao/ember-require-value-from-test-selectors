const { getParser } = require('codemod-cli').jscodeshift;
const { getOptions: getCLIOptions } = require('codemod-cli');
const recast = require('ember-template-recast');

function process(node) {
  if (
    (node.type === 'MustacheStatement' || node.type === 'BlockStatement') &&
    node.params &&
    node.params.length
  ) {
    node.params.forEach(param => {
      if (param.original && param.original.includes('data-test')) {
        this._report(node);
      }
    });
  }
  return false;
}
function _report(node) {
  this.log({
    message: ERROR_NAMESPACE_MESSAGE,
    line: node.loc && node.loc.start.line,
    column: node.loc && node.loc.start.column,
    source: this.sourceForNode(node),
  });
}

module.exports = function transformer(file, api) {
  let { code } = recast.transform(file.source, env => {
    let { builders: b } = env.syntax;
    return {
      ElementNode(node) {
        // for (let i = 0; i < node.attributes.length; i++) {
        //   let attribute = node.attributes[i];
        //   if (
        //     attribute.value &&
        //     attribute.value.type === 'TextNode' &&
        //     attribute.value.chars === ''
        //   ) {
        //     attribute.value.chars = '="true"';
        //   }
        // }
      },

      //   ComponentNode(node) {
      //     process(node);
      //   },

      MustacheStatement(node) {
        if (
          (node.type === 'MustacheStatement' || node.type === 'BlockStatement') &&
          node.params &&
          node.params.length &&
          node.path.original !== 't-def' &&
          node.path.original !== 't'
        ) {
          node.params.forEach(param => {
            if (
              param.original &&
              typeof param.original === 'string' &&
              param.original.includes('data-test')
            ) {
              node.hash.pairs.unshift(b.pair(param.original, b.boolean(true)));
              //   console.log(node);
            }
          });
          node.params = node.params.filter(
            p => !(typeof p.original === 'string' && p.original.includes('data-test'))
          );
        }
      },

      BlockStatement(node) {
        // if (
        //   (node.type === 'MustacheStatement' || node.type === 'BlockStatement') &&
        //   node.params &&
        //   node.params.length
        // ) {
        //   node.params.forEach(param => {
        //     if (
        //       param.original &&
        //       typeof param.original === 'string' &&
        //       param.original.includes('data-test')
        //     ) {
        //       node.hash.pairs.push(b.pair(param.original, b.boolean(true)));
        //       //   console.log(node);
        //     }
        //   });
        // }
      },
    };
  });
  return code;
};
//   https://github.com/ember-codemods/ember-angle-brackets-codemod/blob/master/transforms/angle-brackets/index.js
