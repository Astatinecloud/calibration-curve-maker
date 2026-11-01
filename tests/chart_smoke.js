'use strict';
const assert=require('node:assert/strict');
const C=require('../js/regression.js'),G=require('../js/chart.js'),E=require('../js/export.js');
const c=require('./cases.json')[0],fit=C.fit(c.points),u=Object.assign({name:'試料A',visible:true},C.unknown(fit,c.unknowns[0])),model={points:c.points,fit,unknowns:[u]};
// Generated SVG uses a small XML vocabulary. Check nesting, quoted attributes,
// entity escaping and one namespace-qualified root without an XML dependency.
function xml(svg){let stack=[],roots=0,pos=0;const tags=/<[^>]*>/g;let m;while((m=tags.exec(svg))){assert(!/[<>]|&(?!amp;|lt;|gt;|quot;|apos;)/.test(svg.slice(pos,m.index)));let tag=m[0],closing=/^<\//.test(tag),self=/\/>$/.test(tag),name=tag.match(/^<\/?([A-Za-z][\w:-]*)/);assert(name,'XML 要素名');if(closing){assert.equal(stack.pop(),name[1]);assert.equal(tag,'</'+name[1]+'>');}else{if(stack.length===0)roots++;let attrs=tag.slice(name[0].length,tag.length-(self?2:1)),re=/\s+[\w:-]+="[^"<>]*"/g;assert.equal(attrs.replace(re,'').trim(),'','XML 属性');assert(!/&(?!amp;|lt;|gt;|quot;|apos;)/.test(attrs));if(!self)stack.push(name[1]);}pos=tags.lastIndex;}assert.equal(stack.length,0);assert.equal(roots,1);assert.equal(pos,svg.length);assert(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));}
let built=G.buildSvg(model),s=built.svg;xml(s);assert.equal((s.match(/class="standard-point"[^>]*fill="#fff"/g)||[]).length,4);assert(s.includes('class="regression-line"'));assert.equal((s.match(/stroke-dasharray=/g)||[]).length,2);assert(s.includes('R²'));assert(s.includes('Znの濃度 / ppm'));assert(s.includes('吸光度 / -'));assert(s.includes('data-role="equation"'));assert(!s.includes('#bbb'));assert.equal(built.layout.xAxis.max,.25);assert.equal(built.layout.yAxis.max,.14);assert.equal(built.layout.xAxis.step,.05);assert.equal(built.layout.yAxis.step,.02);assert(!/NaN|Infinity|undefined/.test(s));let ex=G.buildSvg(model,{forExport:true}).svg;assert(!ex.includes('data-role'));assert(!ex.includes('cursor:'));
for(let marker of ['circle','square','triangle','cross','diamond','none'])xml(G.buildSvg(model,{unknownMarker:marker,yVertical:true,frame:true,minor:true,grid:true,tickDirection:'both',xLabel:'<&"\'',unknownLabels:true}).svg);
assert.equal((G.buildSvg(model,{showUnknowns:false}).svg.match(/stroke-dasharray/g)||[]).length,0);assert(G.buildSvg(model,{xAuto:false,xMin:1,xMax:0}).warnings.length);assert(G.buildSvg(model,{xAuto:false,xMin:0,xMax:.01,xStep:.002}).warnings.some(s=>s.includes('軸範囲外')));xml(G.buildSvg({points:[],fit:{ok:false},unknowns:[]}).svg);
// Validate PNG chunk placement, density, CRC and replacement of an existing pHYs.
let png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=','base64');let patched=E.addPhys(png,300),view=new DataView(patched.buffer);assert.equal(Buffer.from(patched.slice(37,41)).toString(),'pHYs');assert.equal(view.getUint32(41),11811);assert.equal(view.getUint32(45),11811);assert.equal(patched[49],1);assert.equal(view.getUint32(50),E.crc32(patched.slice(37,50)));assert.equal(E.addPhys(patched,600).length,patched.length);assert.equal(E.crc32(Buffer.from('123456789')),0xcbf43926);assert.equal(E.csvText([['a"b',1,2,'範囲内']],['注記']).charCodeAt(0),0xfeff);assert(E.csvText([['a"b']],[]).includes('"a""b"'));let size=E.dimensions(800,500,300,15);assert.equal(size.width,1772);assert(E.dimensions(4000,4000,600,200).limited);
console.log('PASS: SVG 要素・XML・自動軸・表示設定・エスケープ・PNG pHYs/CRC32・CSV・出力サイズ');

// Unknowns paint over standards and all labels paint over markers.
let layered=G.buildSvg({...model,unknowns:[u,{...u,name:'B'}]},{unknownLabels:true,unknownMarker:'circle'}).svg;
// Default: no filled marker at the intersection, only the dotted guides meet there.
let plain=G.buildSvg(model,{}).svg;assert(!plain.includes('fill="#000"/>')&&(plain.match(/stroke-dasharray=/g)||[]).length>=2);
let guide=layered.lastIndexOf('stroke-dasharray='),standard=layered.indexOf('class="standard-point"'),marker=layered.indexOf('fill="#000"/>',standard),label=layered.indexOf('>試料A</text>');
assert(guide<standard&&layered.lastIndexOf('class="standard-point"')<marker&&marker<label);
for(let marker of ['circle','square','triangle','cross','diamond']){let svg=G.buildSvg(model,{unknownMarker:marker,width:777.777,height:499.999,radius:6.1234}).svg;for(let match of svg.matchAll(/\b(?:x|y|x1|y1|x2|y2|cx|cy|r|width|height|font-size|stroke-width|dy|viewBox|transform|d|stroke-dasharray)="([^"]*)"/g))assert(!/\d+\.\d{3}/.test(match[1]),match[0]);}
let spacing=G.buildSvg(model),plot=spacing.layout.plot;
assert(plot.left-12-4*14*.65-(8+16+16)>=9.99);
assert(500-14-16-(plot.top+plot.height+14*1.3+10)>=7.99);
console.log('PASS: SVG layering, coordinate precision and axis label spacing');
