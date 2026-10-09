import { createCanvasParticles } from "./finale-particles-canvas";
import { runFinaleMotion } from "./finale-motion";

// Original real-time particle sculpture with a decaying cursor wake.
const VERTEX = `
precision highp float;
attribute vec4 aSeed;
uniform float uTime,uAspect,uDpr,uHeight,uGather,uBeam,uRelease,uImpulse,uGlow;
uniform vec2 uPointer;
uniform vec3 uTrail[8];
varying float vDepth,vTone,vGlow,vAlpha;
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){
 float t=uTime,angle=aSeed.x*6.2831853+t*.38,around=aSeed.y*6.2831853+t*.24;
 float bend=angle+.31*sin(angle*3.+t*.43),ring=.76+.19*sin(angle*3.-t*.39);
 float thickness=(.24+.12*sin(angle*2.+t*.6))*pow(aSeed.z,.4);
 vec3 p=vec3(cos(bend)*ring*1.42,sin(bend)*ring*.78,sin(angle*3.+t*.31)*.5);
 p+=vec3(cos(bend)*cos(around),sin(bend)*cos(around),sin(around))*thickness;
 p.y+=.2*sin(angle*2.+t*.53);
 vec3 n=p*2.3+vec3(t*.15,-t*.11,t*.09);
 p+=(vec3(noise(n),noise(n+17.3),noise(n+41.7))-.5)*.44;
 if(aSeed.w<.2){p.x*=.72;p.y+=sin(angle*2.-t*.32)*.36;p.z+=cos(angle*2.+t*.24)*.32;}
 float halo=step(.89,aSeed.z);
 if(halo>.5){p*=1.+(aSeed.z-.89)*11.;p.y+=sin(t*.25+aSeed.w*40.)*.19;}
 float yaw=.6*sin(t*.8)+uPointer.x*.42+uGather*2.5,pitch=.3*sin(t*.55)+uPointer.y*.22;
 p.xz=mat2(cos(yaw),-sin(yaw),sin(yaw),cos(yaw))*p.xz;
 p.yz=mat2(cos(pitch),-sin(pitch),sin(pitch),cos(pitch))*p.yz;
 p*=1.-uGather*.68;p.y+=uGather*.2;
 float spiral=aSeed.y*6.2831853+t*3.2+aSeed.x*10.,height=fract(aSeed.x+t*.16)*2.-1.;
 float beamRadius=.018+pow(aSeed.z,2.)*.11;
 vec3 column=vec3(cos(spiral)*beamRadius,height*1.15,sin(spiral)*beamRadius);
 p=mix(p,column,uBeam);
 vec3 burst=vec3(cos(spiral)*(1.+aSeed.z)*1.8,sin(aSeed.x*6.2831853)*(1.+aSeed.z)*.85,sin(spiral)*(1.+aSeed.z));
 p=mix(p,burst,uRelease);
 p*=min(1.,uAspect*1.35);
 float perspective=3.25/(4.8-p.z);
 vec2 projected=vec2(p.x/uAspect,p.y)*perspective+vec2(0.,.24);
 for(int i=0;i<8;i++){
   vec2 delta=(projected-uTrail[i].xy)*vec2(uAspect,1.);
   float distance=length(delta),influence=exp(-distance*distance*9.)*uTrail[i].z;
   vec2 outward=delta/max(distance,.045),curl=vec2(-outward.y,outward.x);
   projected+=(outward*.2+curl*.24)*influence/vec2(uAspect,1.);
 }
 float bright=step(.9988,aSeed.w),point=2.8+pow(aSeed.w,3.)*4.;
 point=mix(point,18.+aSeed.y*12.,bright);
 point*=perspective*uDpr*clamp(uHeight/780.,.72,1.35);
 gl_Position=vec4(projected,-p.z*.16,1.);
 gl_PointSize=clamp(point*(1.+uGlow*2.8),1.,105.*uDpr);
 if(uGlow>.5&&bright<.5)gl_Position=vec4(3.,3.,3.,1.);
 vDepth=clamp((p.z+1.8)/3.6,0.,1.);vTone=aSeed.y;vGlow=bright;
 vAlpha=mix(.6,1.,vDepth)*mix(1.,.62,halo)*(1.-uRelease*.95);
}`;
const FRAGMENT = `
precision highp float;
uniform float uGlow;
varying float vDepth,vTone,vGlow,vAlpha;
void main(){
 vec2 uv=gl_PointCoord*2.-1.;float radius=dot(uv,uv);if(radius>1.)discard;
 if(uGlow>.5){float alpha=exp(-radius*5.8)*(1.-smoothstep(.55,1.,radius))*.19;gl_FragColor=vec4(.49,.79,1.,alpha*vAlpha);return;}
 float z=sqrt(max(0.,1.-radius));vec3 normal=vec3(uv.x,-uv.y,z);
 vec3 light=normalize(vec3(-.55,.75,1.2));float diffuse=max(0.,dot(normal,light));
 float shine=pow(max(0.,dot(normal,normalize(light+vec3(0,0,1)))),28.),rim=pow(1.-z,2.5);
 vec3 base=mix(vec3(.11,.38,.64),vec3(.57,.83,.97),vTone*.7+vDepth*.3);
 vec3 color=base*(.2+diffuse*.8)+vec3(.82,.95,1.)*shine*.95+vec3(.2,.55,.79)*rim*.35;
 color=mix(color,vec3(.77,.94,1.),vGlow*.73);
 gl_FragColor=vec4(color,vAlpha*(1.-smoothstep(.78,1.,radius)));
}`;

export function createFinaleParticles(el: HTMLElement, canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: true,
    premultipliedAlpha: false,
    powerPreference: "low-power",
  });
  if (!gl) return createCanvasParticles(el, canvas);

  let program: WebGLProgram | null = null,
    buffer: WebGLBuffer | null = null;
  const shaders: WebGLShader[] = [];
  function shader(type: number, source: string) {
    const s = gl!.createShader(type);
    if (!s) throw new Error("Particle shader unavailable");
    shaders.push(s);
    gl!.shaderSource(s, source);
    gl!.compileShader(s);
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS))
      throw new Error(gl!.getShaderInfoLog(s) || "Particle shader compilation failed");
    return s;
  }
  try {
    program = gl.createProgram();
    if (!program) throw new Error("Particle program unavailable");
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program) || "Particle program linking failed");
    buffer = gl.createBuffer();
    if (!buffer) throw new Error("Particle buffer unavailable");
  } catch (error) {
    console.warn("COCOJOJO particle renderer:", error);
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    shaders.forEach((s) => gl.deleteShader(s));
    el.dataset.particleState = "fallback";
    return () => {};
  }
  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const count = innerWidth < 700 ? 10500 : 26000,
    seeds = new Float32Array(count * 4);
  let rng = 4517;
  for (let i = 0; i < seeds.length; i++) {
    rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0;
    seeds[i] = rng / 4294967296;
  }
  gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
  const attribute = gl.getAttribLocation(program, "aSeed");
  gl.enableVertexAttribArray(attribute);
  gl.vertexAttribPointer(attribute, 4, gl.FLOAT, false, 0, 0);
  const uniform = Object.fromEntries(
    [
      "uTime",
      "uAspect",
      "uDpr",
      "uHeight",
      "uGather",
      "uBeam",
      "uRelease",
      "uImpulse",
      "uGlow",
      "uPointer",
      "uTrail[0]",
    ].map((key) => [key, gl.getUniformLocation(program!, key)]),
  );
  gl.enable(gl.BLEND);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0, 0, 0, 0);
  el.dataset.particleRenderer = "webgl";
  el.dataset.particleCount = String(count);
  let lost = false;
  const stop = runFinaleMotion(
    el,
    canvas,
    (state) => {
      if (lost) return;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniform1f(uniform.uTime, state.time);
      gl.uniform1f(uniform.uAspect, state.width / state.height);
      gl.uniform1f(uniform.uDpr, state.dpr);
      gl.uniform1f(uniform.uHeight, state.height);
      gl.uniform1f(uniform.uGather, state.gather);
      gl.uniform1f(uniform.uBeam, state.beam);
      gl.uniform1f(uniform.uRelease, state.release);
      gl.uniform1f(uniform.uImpulse, state.impulse);
      gl.uniform2f(uniform.uPointer, state.px, state.py);
      gl.uniform3fv(uniform["uTrail[0]"], state.trail);
      gl.depthMask(true);
      gl.uniform1f(uniform.uGlow, 0);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.POINTS, 0, count);
      gl.depthMask(false);
      gl.uniform1f(uniform.uGlow, 1);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      gl.drawArrays(gl.POINTS, 0, count);
      gl.depthMask(true);
    },
    () => gl.viewport(0, 0, canvas.width, canvas.height),
  );
  function contextLost(e: Event) {
    e.preventDefault();
    lost = true;
    el.dataset.particleState = "fallback";
    stop();
  }
  canvas.addEventListener("webglcontextlost", contextLost);
  return () => {
    stop();
    canvas.removeEventListener("webglcontextlost", contextLost);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    shaders.forEach((s) => gl.deleteShader(s));
  };
}
