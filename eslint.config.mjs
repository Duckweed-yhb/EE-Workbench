import antfu from '@antfu/eslint-config';

export default antfu({
	stylistic: {
		indent: 'tab',
		quotes: 'single',
		semi: true,
	},

	typescript: true,

	ignores: ['build/dist/', 'coverage/', 'dist/', 'node_modules/', '.eslintcache', 'debug.log'],

	rules: {
		'no-console': ['warn', { allow: ['log', 'warn', 'error'] }],
		// 嘉立创 i18n 使用 '${1}' 作为占位符，属于正常用法
		'no-template-curly-in-string': 'off',
	},
}, {
	// 嘉立创 EDA 扩展运行环境注入的全局对象
	languageOptions: {
		globals: {
			eda: 'readonly',
			ESCH_PrimitiveComponentType: 'readonly',
		},
	},
});
