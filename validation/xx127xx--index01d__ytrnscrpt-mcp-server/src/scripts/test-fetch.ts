import { fetchTranscript } from '../services/youtube';

async function main() {
  const transcript = await fetchTranscript(
    'https://www.youtube.com/watch?v=yoycgOMq1tI&ab_channel=SequoiaCapital'
  );
  console.log(transcript);
}

main();
