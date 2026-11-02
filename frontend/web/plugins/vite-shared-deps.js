import { URL, fileURLToPath } from 'node:url'

export const sharedDepsPlugin = () => {
    const packageJsonPath = fileURLToPath(new URL('../package.json', import.meta.url))

    return {
        name: 'resolve-shared-deps',
        resolveId(id, importer) {
            if (importer?.includes('/shared/') && !id.startsWith('.') && !id.startsWith('/')) {
                return this.resolve(id, packageJsonPath)
            }
        }
    }
}
