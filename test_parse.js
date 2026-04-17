const fs = require('fs');
const content = fs.readFileSync('components/forge/ChallengeCard.tsx', 'utf-8');
// remove types
const jsxContent = content.replace(/interface ForgeChallenge \{[^}]+\}/, '').replace(/export function ChallengeCard\([^)]+\)/, 'export function ChallengeCard(props)');

try {
  new Function(jsxContent);
  console.log("Valid JS");
} catch(e) {
  console.log(e);
}
