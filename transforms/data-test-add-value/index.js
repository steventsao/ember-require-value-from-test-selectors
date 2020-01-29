const { getParser } = require('codemod-cli').jscodeshift;
const { getOptions: getCLIOptions } = require('codemod-cli');
const recast = require('ember-template-recast');

module.exports = function transformer(file, api) {
  let { code } = recast.transform(file.source, env => {
    let { builders: b } = env.syntax;
    return {
      ElementNode(node) {
        for (let i = 0; i < node.attributes.length; i++) {
          let attribute = node.attributes[i];
          if (
            attribute.value &&
            attribute.value.type === 'TextNode' &&
attribute.name.includes('data-test') &&
            attribute.value.chars === ''
          ) {
            attribute.value.chars = '="true"';
          }
        }
      },


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
            }
          });
          node.params = node.params.filter(
            p => !(typeof p.original === 'string' && p.original.includes('data-test'))
          );
        }
      },

      BlockStatement(node) {
         if (
           (node.type === 'MustacheStatement' || node.type === 'BlockStatement') &&
           node.params &&
           node.params.length
         ) {
           node.params.forEach(param => {
             if (
               param.original &&
               typeof param.original === 'string' &&
               param.original.includes('data-test')
             ) {
               node.hash.pairs.push(b.pair(param.original, b.boolean(true)));
             }
           });
         }
      },
    };
  });
  return code;
};

//   https://github.com/ember-codemods/ember-angle-brackets-codemod/blob/master/transforms/angle-brackets/index.js
