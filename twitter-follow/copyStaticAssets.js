var shell = require('shelljs');

shell.cp('-R', '.env.configuration', 'dist/.env.configuration');
shell.cp('-R', 'src/datasource/trainingdata', 'dist/datasource/');