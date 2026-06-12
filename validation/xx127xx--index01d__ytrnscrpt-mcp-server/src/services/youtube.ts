import { Innertube } from 'youtubei.js';
import { LANGUAGE } from '../config/constants.js';

export async function fetchTranscript(videoUrl: string): Promise<string> {
  const videoId = getVideoID(videoUrl);

  const yt = await Innertube.create({
    lang: LANGUAGE,
    retrieve_player: false,
  });

  const info = await yt.getInfo(videoId);
  const transcriptData = await info.getTranscript();

  const transcript =
    transcriptData.transcript.content?.body?.initial_segments
      .map((segment) => segment.snippet.text)
      .join(' ') ?? '';

  if (transcript === undefined) {
    throw new Error('Transcription not found');
  }

  return transcript;
}

function getVideoID(url: string): string {
  const match = url.match(
    /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/
  );
  if (match !== null && match[1].length === 11) {
    return match[1];
  } else {
    throw new Error('Failed to get youtube video id from the url');
  }
}
