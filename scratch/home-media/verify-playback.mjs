import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('main.js', 'utf8');
const heroCode = source.slice(source.indexOf('  /* ---- Hero Video:'), source.indexOf('  /* ---- Homepage proof sequence'));

function fixture({ reduced = false, alpha = 0, rejectAutoplay = false } = {}) {
  const events = new Map();
  const on = (target, name, handler) => events.set(`${target}:${name}`, handler);
  const classes = new Set();
  const wrapper = { classList: {
    remove: name => classes.delete(name),
    toggle: (name, active) => active ? classes.add(name) : classes.delete(name),
  }};
  const video = {
    dataset: {src:'animation.webm',fallback:'animation.webp'},
    paused: true, loads: 0, plays: 0,
    closest: () => wrapper,
    addEventListener: (name, handler) => on('video', name, handler),
    pause() { this.paused = true; },
    load() { this.loads++; },
    removeAttribute(name) { delete this[name]; },
    play() {
      this.plays++;
      this.paused = false;
      return rejectAutoplay ? Promise.reject({name:'NotAllowedError'}) : Promise.resolve();
    },
  };
  const image = {
    src:'poster.webp', getAttribute: () => image.src,
    addEventListener: (name, handler) => on('image', name, handler),
  };
  const button = {
    hidden:true, attributes:{},
    addEventListener: (name, handler) => on('button', name, handler),
    setAttribute(name, value) { this.attributes[name] = value; },
  };
  const motion = {
    matches: reduced,
    addEventListener: (name, handler) => on('motion', name, handler),
  };
  const elements = {'hero-video':video,'hero-video-fallback':image,'hero-motion-toggle':button};
  const doc = {
    hidden:false,
    getElementById: id => elements[id],
    addEventListener: (name, handler) => on('document', name, handler),
    createElement: () => ({getContext:() => ({drawImage(){},getImageData:() => ({data:[0,0,0,alpha]})})}),
  };
  let observe;
  vm.runInNewContext(heroCode, {
    document: doc,
    window:{matchMedia:() => motion},
    IntersectionObserver:class {
      constructor(handler) { observe = visible => handler([{isIntersecting:visible}]); }
      observe() {}
    },
  });
  return {video,image,button,motion,doc,classes,observe,emit:(target,event) => events.get(`${target}:${event}`)()};
}

const normal = fixture();
normal.observe(true);
normal.emit('video','loadeddata');
assert(normal.classes.has('has-alpha-video'));
assert.equal(normal.video.paused, false);
normal.emit('button','click');
assert.equal(normal.video.paused, true);
assert.equal(normal.button.textContent, 'Play animation');
normal.emit('button','click');
assert.equal(normal.video.paused, false);
normal.observe(false);
assert.equal(normal.video.paused, true);
normal.observe(true);
normal.doc.hidden = true;
normal.emit('document','visibilitychange');
assert.equal(normal.video.paused, true);

const reduced = fixture({reduced:true});
reduced.observe(true);
assert.equal(reduced.video.loads, 0);
assert.equal(reduced.image.src, 'poster.webp');
assert(reduced.button.hidden);
reduced.motion.matches = false;
reduced.emit('motion','change');
assert.equal(reduced.video.src, 'animation.webm');

const opaque = fixture({alpha:255});
opaque.observe(true);
opaque.emit('video','loadeddata');
assert.equal(opaque.image.src, 'animation.webp');
assert(!opaque.classes.has('has-alpha-video'));
opaque.emit('button','click');
assert.equal(opaque.image.src, 'poster.webp');
opaque.emit('button','click');
assert.equal(opaque.image.src, 'animation.webp');
opaque.observe(false);
assert.equal(opaque.image.src, 'poster.webp');

const failed = fixture();
failed.observe(true);
failed.emit('video','error');
assert.equal(failed.image.src, 'animation.webp');
failed.emit('image','error');
assert.equal(failed.image.src, 'poster.webp');
assert.equal(failed.button.textContent, 'Play animation');

const blocked = fixture({rejectAutoplay:true});
blocked.observe(true);
await new Promise(resolve => setImmediate(resolve));
assert.equal(blocked.video.paused, true);
assert.equal(blocked.button.textContent, 'Play animation');
console.log('Playback checks passed: alpha rendering, pause/resume, offscreen/hidden pause, reduced motion, opaque decoder fallback, failed-media fallback, blocked autoplay.');
