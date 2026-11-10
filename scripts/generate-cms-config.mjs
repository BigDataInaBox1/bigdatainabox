import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';
import { models, groupLabels } from '../cms/model.mjs';
import { root } from '../cms/render.mjs';

export function editorField(field) {
  const technical = new Set(['selector','mode','attr','template']);
  return Object.fromEntries(Object.entries(field).filter(([k,v])=>!technical.has(k) && v !== null).map(([k,v])=>[k,k==='fields'?v.map(editorField):v]));
}
export function cmsConfig() {
  return {
    media: [
      {name:'images',label:'Images and logos',input:'public',output:'/',extensions:['jpg','jpeg','jfif','png','webp','avif','gif'],rename:'safe'},
      {name:'documents',label:'PDF documents',input:'public/uploads/documents',output:'/uploads/documents',extensions:['pdf'],rename:'safe'}
    ],
    content: Object.entries(groupLabels).map(([group,label])=>({
      name:group,label,type:'group',items:models.filter(m=>m.group===group).map(m=>({
        name:`${m.group}-${m.name}`,label:m.label,type:'file',path:m.path,format:'json',
        operations:{create:false,rename:false,delete:false},fields:m.fields.map(editorField)
      }))
    })),
    settings:{hide:true,content:{merge:true},commit:{identity:'app',templates:{update:'Update {name} content (Pages CMS)',create:'Add {filename} (Pages CMS)',delete:'Remove {filename} (Pages CMS)',rename:'Rename {oldFilename} to {newFilename} (Pages CMS)'}}}
  };
}
export function writeConfig() {
  fs.writeFileSync(path.join(root,'.pages.yml'),'# Pages CMS configuration. Generated from cms/model.mjs.\n# Client content lives in content/. Layout and integration settings are not exposed as CMS fields.\n'+YAML.stringify(cmsConfig(),{lineWidth:110}));
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) { writeConfig(); console.log('Updated .pages.yml'); }
