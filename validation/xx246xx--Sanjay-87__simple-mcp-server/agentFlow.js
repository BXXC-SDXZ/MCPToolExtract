const summarizerAgent = require('./summarizerAgent');
const refinerAgent = require('./refinerAgent');

async function run() {
//   const inputText = `React is a powerful library for building UI components. It allows you to build reusable UI logic with hooks and encourages declarative design.`;

    const inputText = 'what is typescript?'

  console.log('▶️ Step 1: Summarizing...');
  const summary = await summarizerAgent(inputText);
  console.log('📝 Summary:', summary.response);

  console.log('\n▶️ Step 2: Refining...');
  const refined = await refinerAgent(summary);
  console.log('🔧 Refined Output:', refined.response);
}

run();
