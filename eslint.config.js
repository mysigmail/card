import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 1,
      },
    ],
  },
})
