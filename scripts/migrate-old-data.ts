#!/usr/bin/env tsx

/**
 * Migration script to import old memory.json data into Vercel MCP Memory
 * Run with: npm run migrate
 */

import fs from 'fs';
import path from 'path';
import { addMemory } from '../lib/db';

interface OldMemoryEntity {
  name: string;
  entityType: string;
  observations: string[];
}

interface OldMemoryFormat {
  entities: OldMemoryEntity[];
}

async function migrate() {
  console.log('🚀 Starting migration from old memory.json...\n');

  // Read old memory.json file
  const oldMemoryPath = path.join(process.env.HOME!, 'Documents', 'memory.json');

  if (!fs.existsSync(oldMemoryPath)) {
    console.error(`❌ File not found: ${oldMemoryPath}`);
    console.log('Creating sample memory instead...\n');
    await createSampleMemories();
    return;
  }

  try {
    const data = fs.readFileSync(oldMemoryPath, 'utf-8');
    const oldMemory: OldMemoryFormat = JSON.parse(data);

    console.log(`Found ${oldMemory.entities.length} entities to migrate\n`);

    let totalMigrated = 0;

    for (const entity of oldMemory.entities) {
      console.log(`\n📦 Migrating entity: ${entity.name} (${entity.entityType})`);

      for (const observation of entity.observations) {
        try {
          await addMemory(observation, {
            category: 'migrated',
            metadata: {
              source: 'old-memory-json',
              entityName: entity.name,
              entityType: entity.entityType,
              migratedAt: new Date().toISOString(),
            },
          });

          console.log(`   ✓ ${observation.substring(0, 60)}...`);
          totalMigrated++;
        } catch (error) {
          console.error(`   ✗ Failed: ${(error as Error).message}`);
        }
      }
    }

    console.log(`\n✅ Migration completed! ${totalMigrated} memories migrated.`);

    // Add test memory for Петя
    console.log('\n📝 Adding test memory for Петя...');
    await addMemory('Петя - рыжий, но лысый. Он также является демоном.', {
      category: 'people',
      metadata: {
        name: 'Петя',
        characteristics: ['рыжий', 'лысый', 'демон'],
        testMemory: true,
      },
    });

    console.log('✓ Test memory added\n');
  } catch (error) {
    console.error('❌ Migration failed:', (error as Error).message);
    throw error;
  }
}

async function createSampleMemories() {
  const samples = [
    {
      content: 'I prefer Python over JavaScript for backend development',
      category: 'preferences',
      metadata: { type: 'language-preference' },
    },
    {
      content: 'NGDB Classifier project uses FastAPI with Pydantic validation',
      category: 'projects',
      metadata: { project: 'NGDB Classifier', stack: ['Python', 'FastAPI', 'Pydantic'] },
    },
    {
      content: 'Use uv instead of pip for Python package management',
      category: 'preferences',
      metadata: { type: 'tool-preference' },
    },
    {
      content: 'Ruff is preferred for Python linting and formatting',
      category: 'preferences',
      metadata: { type: 'tool-preference', tool: 'Ruff' },
    },
    {
      content: 'Петя - рыжий, но лысый. Он также является демоном.',
      category: 'people',
      metadata: { name: 'Петя', characteristics: ['рыжий', 'лысый', 'демон'] },
    },
  ];

  console.log('Creating sample memories...\n');

  for (const sample of samples) {
    try {
      await addMemory(sample.content, {
        category: sample.category,
        metadata: sample.metadata,
      });

      console.log(`✓ ${sample.content.substring(0, 60)}...`);
    } catch (error) {
      console.error(`✗ Failed: ${(error as Error).message}`);
    }
  }

  console.log('\n✅ Sample memories created!\n');
}

// Run migration
migrate()
  .then(() => {
    console.log('🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
