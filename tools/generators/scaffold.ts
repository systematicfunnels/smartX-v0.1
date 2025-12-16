#!/usr/bin/env ts-node

import fs from 'fs';
import path from 'path';

interface ScaffoldOptions {
  type: 'app' | 'package' | 'worker' | 'service';
  name: string;
  force?: boolean;
}

function scaffoldComponent(options: ScaffoldOptions) {
  const { type, name, force = false } = options;
  const basePath = path.join(__dirname, '../..');

  console.log(`Scaffolding ${type}: ${name}`);

  try {
    switch (type) {
      case 'app':
        scaffoldApp(name, basePath, force);
        break;
      case 'package':
        scaffoldPackage(name, basePath, force);
        break;
      case 'worker':
        scaffoldWorker(name, basePath, force);
        break;
      case 'service':
        scaffoldService(name, basePath, force);
        break;
      default:
        throw new Error(`Unknown component type: ${type}`);
    }

    console.log(`✅ Successfully scaffolded ${type}: ${name}`);
  } catch (error) {
    console.error(`❌ Failed to scaffold ${type}: ${name}`);
    console.error(error);
    process.exit(1);
  }
}

function scaffoldApp(name: string, basePath: string, force: boolean) {
  const appPath = path.join(basePath, 'apps', name);

  if (fs.existsSync(appPath) && !force) {
    throw new Error(`App ${name} already exists. Use --force to overwrite.`);
  }

  // Create directory structure
  const directories = [
    path.join(appPath, 'app'),
    path.join(appPath, 'components'),
    path.join(appPath, 'hooks'),
    path.join(appPath, 'services'),
    path.join(appPath, 'types'),
    path.join(appPath, 'styles'),
  ];

  directories.forEach(dir => {
    fs.mkdirSync(dir, { recursive: true });
  });

  // Create package.json
  const packageJson = {
    name,
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'eslint .',
    },
    dependencies: {
      next: '16.0.10',
      react: '19.2.1',
      'react-dom': '19.2.1',
      '@smartx/ui': 'workspace:*',
      '@smartx/api-client': 'workspace:*',
      '@smartx/types': 'workspace:*',
    },
    devDependencies: {
      '@types/node': '^20',
      '@types/react': '^19',
      '@types/react-dom': '^19',
      eslint: '^9',
      'eslint-config-next': '16.0.10',
      typescript: '^5',
    },
  };

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create basic Next.js files
  const layoutContent = `import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '${name}',
  description: 'SmartX ${name} Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
      </body>
    </html>
  )
}`;

  fs.writeFileSync(path.join(appPath, 'app', 'layout.tsx'), layoutContent);

  const pageContent = `export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">${name}</h1>
      <p className="text-lg mb-8">Welcome to ${name} application</p>
    </div>
  );
}`;

  fs.writeFileSync(path.join(appPath, 'app', 'page.tsx'), pageContent);

  // Create basic CSS
  const cssContent = `@tailwind base;
@tailwind components;
@tailwind utilities;`;

  fs.writeFileSync(path.join(appPath, 'app', 'globals.css'), cssContent);
}

function scaffoldPackage(name: string, basePath: string, force: boolean) {
  const packagePath = path.join(basePath, 'packages', name);

  if (fs.existsSync(packagePath) && !force) {
    throw new Error(`Package ${name} already exists. Use --force to overwrite.`);
  }

  // Create directory structure
  fs.mkdirSync(packagePath, { recursive: true });

  // Create package.json
  const packageJson = {
    name: `@smartx/${name}`,
    version: '1.0.0',
    description: `SmartX ${name} package`,
    main: 'index.ts',
    types: 'index.d.ts',
    scripts: {
      build: 'tsc',
      lint: 'eslint . --fix',
    },
    dependencies: {},
    devDependencies: {
      typescript: '^5.5.4',
    },
  };

  fs.writeFileSync(
    path.join(packagePath, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create basic index file
  const indexContent = `export * from './${name}';`;
  fs.writeFileSync(path.join(packagePath, 'index.ts'), indexContent);

  // Create basic implementation file
  const implContent = `// ${name} package implementation
export function ${name}() {
  // TODO: Implement ${name} functionality
  return '${name} package';
}
`;

  fs.writeFileSync(path.join(packagePath, `${name}.ts`), implContent);
}

function scaffoldWorker(name: string, basePath: string, force: boolean) {
  const workerPath = path.join(basePath, 'backend', 'workers', name);

  if (fs.existsSync(workerPath) && !force) {
    throw new Error(`Worker ${name} already exists. Use --force to overwrite.`);
  }

  // Create directory
  fs.mkdirSync(workerPath, { recursive: true });

  // Create worker implementation
  const workerContent = `import { llmClient } from '../../services/llm/client';
import { storageService } from '../../services/storage/s3';
import { queueService } from '../../services/queue/redis';

export interface ${name}Task {
  // Define task interface
  inputKey: string;
  tenantId: string;
  [key: string]: any;
}

export interface ${name}Result {
  // Define result interface
  output: any;
  confidence: number;
  metadata: Record<string, any>;
}

export async function run${name}Worker(task: ${name}Task): Promise<${name}Result> {
  console.log(\`Starting ${name} worker\`);

  try {
    // 1. Download input data
    const inputBuffer = await storageService.getFile(task.inputKey);
    const inputData = JSON.parse(inputBuffer.toString('utf-8'));

    // 2. Process data
    const result = await process${name}(inputData, task);

    // 3. Store result
    const resultKey = \`${name}/\${task.tenantId}/\${Date.now()}.json\`;
    await storageService.uploadFile(
      resultKey,
      JSON.stringify(result, null, 2),
      'application/json'
    );

    console.log(\`${name} worker completed\`);
    return result;
  } catch (error) {
    console.error(\`${name} worker failed:\`, error);
    throw error;
  }
}

async function process${name}(inputData: any, task: ${name}Task): Promise<${name}Result> {
  // Implement worker logic
  const prompt = \`Process the following data as a ${name} worker:\\n\\n\${JSON.stringify(inputData, null, 2)}\`;

  const result = await llmClient.generateCompletion(prompt, {
    maxTokens: 1000,
    temperature: 0.3,
  });

  return {
    output: result,
    confidence: 0.85,
    metadata: {
      worker: '${name}',
      timestamp: new Date().toISOString(),
    },
  };
}

// Register worker with queue service
queueService.createWorker('${name}', async (job) => {
  const task = job.data as ${name}Task;
  return run${name}Worker(task);
});`;

  fs.writeFileSync(path.join(workerPath, 'index.ts'), workerContent);
}

function scaffoldService(name: string, basePath: string, force: boolean) {
  const servicePath = path.join(basePath, 'backend', 'services', name);

  if (fs.existsSync(servicePath) && !force) {
    throw new Error(`Service ${name} already exists. Use --force to overwrite.`);
  }

  // Create directory
  fs.mkdirSync(servicePath, { recursive: true });

  // Create service implementation
  const serviceContent = `import { backendConfig } from '../../config';

export class ${name}Service {
  private config: any;

  constructor() {
    this.config = backendConfig.${name.toLowerCase()} || {};
  }

  async initialize() {
    // Initialize service
    console.log(\`Initializing ${name} service\`);
  }

  // Add service methods here
  async exampleMethod(input: any): Promise<any> {
    // Implement service logic
    return {
      result: \`Processed by ${name} service\`,
      input,
    };
  }
}

// Singleton instance
export const ${name.toLowerCase()}Service = new ${name}Service();`;

  fs.writeFileSync(path.join(servicePath, 'index.ts'), serviceContent);
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('Usage: scaffold <type> <name> [--force]');
    console.log('Types: app, package, worker, service');
    process.exit(1);
  }

  const type = args[0] as ScaffoldOptions['type'];
  const name = args[1];
  const force = args.includes('--force');

  scaffoldComponent({ type, name, force });
}

export { scaffoldComponent };
