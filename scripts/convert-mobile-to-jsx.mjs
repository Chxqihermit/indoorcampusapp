import * as esbuild from 'esbuild';
import { readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

const root = join(process.cwd(), 'mobile');

function walk(dir) {
    const files = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            files.push(...walk(full));
        } else {
            files.push(full);
        }
    }
    return files;
}

const files = walk(root);
let converted = 0;
let failed = 0;

for (const file of files) {
    if (!file.endsWith('.tsx') && !file.endsWith('.ts')) continue;

    const code = readFileSync(file, 'utf8');
    const isTsx = file.endsWith('.tsx');
    const out = file.replace(/\.tsx$/, '.jsx').replace(/\.ts$/, '.js');

    try {
        const result = await esbuild.transform(code, {
            loader: isTsx ? 'tsx' : 'ts',
            jsx: 'preserve',
            format: 'esm',
            target: 'esnext',
        });
        writeFileSync(out, result.code);
        unlinkSync(file);
        converted++;
        console.log(`OK ${file.replace(root + '\\', '')}`);
    } catch (error) {
        failed++;
        console.error(`FAIL ${file}:`, error.message);
    }
}

console.log(`\nConverted: ${converted}, Failed: ${failed}`);
