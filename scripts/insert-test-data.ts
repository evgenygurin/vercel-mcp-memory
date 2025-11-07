import { sql } from '@vercel/postgres';

async function insertTestData() {
  try {
    // Insert test memory 1
    const result1 = await sql`
      INSERT INTO memories (content, embedding, category, metadata)
      VALUES (
        'Петя - рыжий, но лысый, и он демон',
        ${JSON.stringify(Array(1536).fill(0.1))}::vector,
        'people',
        ${'{"test": true}'}::jsonb
      )
      RETURNING id, content, category
    `;
    console.log('Memory 1 inserted:', result1.rows[0]);

    // Insert test memory 2
    const result2 = await sql`
      INSERT INTO memories (content, embedding, category, metadata)
      VALUES (
        'Тест семантического поиска на русском языке',
        ${JSON.stringify(Array(1536).fill(0.2))}::vector,
        'tests',
        ${'{"test": true}'}::jsonb
      )
      RETURNING id, content, category
    `;
    console.log('Memory 2 inserted:', result2.rows[0]);

    console.log('\n✓ Test data inserted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error inserting test data:', error);
    process.exit(1);
  }
}

insertTestData();
