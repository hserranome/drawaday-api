import { configApp } from '@adonisjs/eslint-config'
export default configApp({
overrides: [
	{
		files: ['*.js', '*.ts'],
		rules: {
			'indent': ['warn', 'tab']
		}
	}
]
})
