import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {searchYouTube} from '../services/youtube/search';
type Song = {id:number;title:string;artist:string};
async function main(){
  // Read .env.local without adding dependencies to the runtime bundle.
  const file=await readFile('.env.local','utf8').catch(()=> '');
  const key=process.env.YOUTUBE_API_KEY || file.split(/\r?\n/).find(line=>line.startsWith('YOUTUBE_API_KEY='))?.slice(16).trim().replace(/^['"]|['"]$/g,'');
  if(!key) throw new Error('Set YOUTUBE_API_KEY in .env.local or in the shell.');
  const songs=JSON.parse(await readFile('data/songs.json','utf8')) as Song[];
  const dest=path.resolve('data/resolved.json');
  const saved=JSON.parse(await readFile(dest,'utf8').catch(()=> '{}')) as Record<string,string>;
  for(const song of songs){
    if(saved[String(song.id)]) continue;
    const result=await searchYouTube(song.title,song.artist,key);
    if(result.reason==='quota') {console.error('YouTube daily quota reached; resume tomorrow.');break;}
    if(result.videoId) saved[String(song.id)]=result.videoId;
    console.log(`${song.id}/${songs.length}: ${song.title} — ${result.videoId ?? result.reason}`);
    await writeFile(dest,JSON.stringify(saved,null,2)+'\n');
    await new Promise(r=>setTimeout(r,120));
  }
  console.log(`Stored ${Object.keys(saved).length} resolved videos in data/resolved.json`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
