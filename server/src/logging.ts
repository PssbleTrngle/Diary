import chalk from 'chalk';

export const error = (...s: unknown[]) => console.log(chalk.red('❌ ', ...s));
export const info = (...s: unknown[]) => console.log(chalk.cyanBright(...s));
export const success = (...s: unknown[]) => console.log(chalk.greenBright('✔ ', ...s));
export const warn = (...s: unknown[]) => console.log(chalk.yellow('⚠ ', ...s));
export const debug = (...s: unknown[]) => {
    if (process.env.DEBUG) console.log(chalk.bgGray.white(...s))
}