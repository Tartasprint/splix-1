import * as fs from "jsr:@std/fs";
import { TarStream } from "jsr:@std/tar";
import * as path from "jsr:@std/path";

export async function tar_dir(src,dest) {
  return await ReadableStream
  .from(
      async function*(walk){
        for await (const x of walk){
          const new_path = path.relative(src,x.path);
          if(new_path == '') continue;
          if(x.isDirectory){
            yield {
              type: 'directory',
              path: new_path,
            }
          } else if(x.isFile){
            yield {
              type: 'file',
              path: new_path,
              size: (await Deno.stat(x.path)).size,
              readable: (await Deno.open(x.path)).readable,
            }
          }
        }
      }(fs.walk(src))
  )
  .pipeThrough(new TarStream())
  .pipeTo((await Deno.create(dest)).writable) 
}