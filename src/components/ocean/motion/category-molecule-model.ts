/** Abstract ingredient-family sculptures, not literal chemical structures. */
export type Vec = { x: number; y: number; z: number };
export type Atom = Vec & { radius: number; tone: number; alpha: number };
export type Bond = { a: number; b: number; width: number; tone: number; alpha: number };
export type Facet = { vertices: number[]; tone: number; alpha: number };
export type Sculpture = { atoms: Atom[]; bonds: Bond[]; facets: Facet[] };
export const CATEGORY_MOTIONS = {
  botanicals: "Branching bloom",
  "carrier-oils": "Golden droplet cascade",
  aromatics: "Aromatic spiral",
  "butters-waxes": "Soft layered structure",
  "emollients-conditioners": "Silken molecular ribbon",
  "actives-vitamins": "Radiant active constellation",
  "proteins-peptides": "Folding peptide chain",
  emulsifiers: "Oil and water in flow",
  surfactants: "Gathering micelle",
  rheology: "Elastic molecular network",
  humectants: "Water-attracting cluster",
  preservation: "Protective molecular shell",
  "colors-minerals": "Growing crystal facets",
  "bases-kits": "Modular molecular assembly",
  "exfoliants-acids": "Releasing outer layers",
  "formulation-aids": "Aligning molecular orbits",
  chelators: "Gathering molecular shell",
  "ph-adjusters": "Balanced molecular orbits",
  solvents: "Flowing molecular ribbon",
  "film-formers": "Elastic molecular network",
  "uv-filters": "Protective molecular shell",
  deodorants: "Gathering crystal facets",
  "oral-care": "Modular molecular assembly",
  antioxidants: "Radiant active constellation",
  "hair-color-perm": "Folding molecular chain",
} as const;
export type MolecularCategory = keyof typeof CATEGORY_MOTIONS;
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
const tau = Math.PI * 2;
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (n: number) => {
  const t = clamp(n);
  return t * t * (3 - 2 * t);
};

export function moleculeFrame(category: string, p: number): Sculpture {
  const motionFamily: Record<string, string> = {
    chelators: "humectants",
    "ph-adjusters": "formulation-aids",
    solvents: "emollients-conditioners",
    "film-formers": "rheology",
    "uv-filters": "preservation",
    deodorants: "colors-minerals",
    "oral-care": "bases-kits",
    antioxidants: "actives-vitamins",
    "hair-color-perm": "proteins-peptides",
  };
  category = motionFamily[category] || category;
  const atoms: Atom[] = [],
    bonds: Bond[] = [],
    facets: Facet[] = [];
  const action = ease((p - 0.06) / 0.7),
    t = p * tau;
  const atom = (x: number, y: number, z: number, radius = 0.065, tone = 0, alpha = 1) => {
    atoms.push({ x, y, z, radius, tone, alpha });
    return atoms.length - 1;
  };
  const bond = (a: number, b: number, width = 0.026, tone = 0, alpha = 1) => {
    bonds.push({ a, b, width, tone, alpha });
  };
  const chain = (points: Vec[], radius = 0.052, tone = 0, tube = 0.028, alpha = 1) => {
    let last = -1;
    return points.map((v, i) => {
      const id = atom(v.x, v.y, v.z, radius, tone, alpha);
      if (i) bond(last, id, tube, tone, alpha);
      last = id;
      return id;
    });
  };
  const ring = (radius: number, y: number, n: number, tone: number, tilt = 0, phase = 0) => {
    const ids: number[] = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * tau + phase;
      ids.push(
        atom(
          Math.cos(a) * radius,
          y + Math.sin(a) * radius * Math.sin(tilt),
          Math.sin(a) * radius * Math.cos(tilt),
          0.055,
          tone,
        ),
      );
    }
    ids.forEach((id, i) => bond(id, ids[(i + 1) % n], 0.026, tone));
    return ids;
  };
  const spherePoint = (i: number, n: number, r: number): Vec => {
    const y = 1 - (2 * (i + 0.5)) / n,
      a = i * 2.3999632297;
    const h = Math.sqrt(1 - y * y);
    return { x: Math.cos(a) * h * r, y: y * r, z: Math.sin(a) * h * r };
  };

  switch (category) {
    case "botanicals": {
      const stem = chain(
        Array.from({ length: 13 }, (_, i) => ({
          x: Math.sin(i * 0.38 + t * 0.12) * 0.11,
          y: (i - 6) * 0.14,
          z: Math.cos(i * 0.38) * 0.12,
        })),
        0.055,
        0,
        0.036,
      );
      for (let j = 1; j < 6; j++)
        for (const side of [-1, 1]) {
          const growth = ease(action * 1.9 - j * 0.12),
            root = atoms[stem[j * 2]];
          const leaf = chain(
            Array.from({ length: 5 }, (_, i) => ({
              x: root.x + side * i * 0.19 * growth,
              y: root.y + i * 0.12 * growth,
              z: root.z + Math.sin(i * 0.7 + t * 0.25) * 0.24 * growth,
            })),
            0.048,
            j % 2 ? 1 : 2,
            0.021,
          );
          bond(stem[j * 2], leaf[0]);
          for (let k = 1; k < 4; k++) {
            const a = atoms[leaf[k]],
              b = atom(a.x - side * 0.04, a.y + 0.17 * growth, a.z + 0.1 * growth, 0.065, 2);
            bond(leaf[k], b, 0.019, 2);
          }
        }
      break;
    }
    case "carrier-oils": {
      for (let j = 0; j < 3; j++) {
        const fall = action * 0.9,
          angle = (j * tau) / 3 + t * 0.13;
        const x = Math.cos(angle) * (0.72 - fall * 0.35),
          y = mix(-0.6 + j * 0.52, 0.2, action) + Math.sin(t + j) * 0.12,
          z = Math.sin(angle) * 0.46;
        atom(x, y, z, 0.31 + action * 0.06, 1);
        const tail = chain(
          Array.from({ length: 7 }, (_, i) => ({
            x: x + Math.sin(i * 0.45 + t * 0.25 + j) * 0.08,
            y: y - i * 0.085,
            z: z - i * 0.025,
          })),
          0.055,
          1,
          0.075,
        );
        for (let k = 0; k < 3; k++) {
          const a = atoms[tail[k * 2]],
            b = atom(a.x + (k % 2 ? -0.16 : 0.16), a.y, a.z + 0.12, 0.063, 0);
          bond(tail[k * 2], b, 0.025, 1);
        }
      }
      break;
    }
    case "aromatics": {
      for (let j = 0; j < 5; j++) {
        const a = (j * tau) / 5 + t * 0.35,
          r = 0.68 + j * 0.07;
        const cx = Math.cos(a) * r,
          cy = (j - 2) * 0.34 - action * 0.25,
          cz = Math.sin(a) * r;
        const ids: number[] = [];
        for (let k = 0; k < 6; k++) {
          const q = (k * tau) / 6 + t * 0.2;
          ids.push(atom(cx + Math.cos(q) * 0.23, cy + Math.sin(q) * 0.23, cz + Math.sin(q) * 0.12, 0.06, j % 2));
        }
        ids.forEach((v, k) => bond(v, ids[(k + 1) % 6], 0.034, j % 2));
      }
      chain(
        Array.from({ length: 45 }, (_, i) => {
          const q = i * 0.23 + t * 0.55;
          return { x: Math.cos(q) * 1.04, y: (i - 22) * 0.048, z: Math.sin(q) * 1.04 };
        }),
        0.016,
        2,
        0.024,
        0.42,
      );
      break;
    }
    case "butters-waxes": {
      for (let j = 0; j < 5; j++) {
        const y = (j - 2) * (0.24 + Math.sin(t * 0.6) * 0.055),
          shift = Math.sin(t * 0.38 + j) * 0.15;
        const a = chain(
          Array.from({ length: 9 }, (_, i) => ({
            x: (i - 4) * 0.22 + shift,
            y: y + Math.sin(i * 0.6 + t * 0.5) * action * 0.1,
            z: Math.cos(i * 0.7 + j) * 0.11,
          })),
          0.105,
          j % 2 ? 1 : 3,
          0.13,
        );
        if (j > 0) for (let k = 0; k < 3; k++) bond(a[k * 3], a[k * 3] - 9, 0.024, 0, 0.45);
      }
      break;
    }
    case "emollients-conditioners": {
      for (let lane = 0; lane < 3; lane++) {
        const pts = Array.from({ length: 40 }, (_, i) => {
          const x = (i / 39 - 0.5) * 2.5;
          return {
            x,
            y: Math.sin(x * 2.4 - t * 0.65) * 0.38 + (lane - 1) * 0.17,
            z: Math.cos(x * 2.2 - t * 0.65) * 0.45 + (lane - 1) * 0.14,
          };
        });
        const ids = chain(pts, 0.0001, lane === 1 ? 1 : 0, 0.13, lane === 1 ? 0.9 : 0.78);
        for (let i = 3; i < 40; i += 8) {
          const v = atoms[ids[i]];
          atom(v.x, v.y + 0.08, v.z, 0.11, 1);
        }
      }
      break;
    }
    case "actives-vitamins": {
      const core = atom(0, 0, 0, 0.27 + Math.sin(t) * 0.035, 1);
      const ids: number[] = [];
      for (let i = 0; i < 14; i++) {
        const v = spherePoint(i, 14, mix(1.25, 0.78, action)),
          id = atom(v.x, v.y, v.z, 0.09 + (i % 3) * 0.012, i % 4 === 0 ? 1 : 0);
        ids.push(id);
        bond(core, id, 0.02, i % 3 === 0 ? 1 : 0, 0.65);
      }
      ids.forEach((id, i) => {
        bond(id, ids[(i + 3) % 14], 0.022, 0, 0.6);
      });
      ring(1.18, 0, 32, 2, 1.1, t * 0.3);
      break;
    }
    case "proteins-peptides": {
      const strands: number[][] = [];
      for (let j = 0; j < 2; j++)
        strands.push(
          chain(
            Array.from({ length: 28 }, (_, i) => {
              const a = i * 0.43 + j * Math.PI + t * 0.6;
              return {
                x: Math.cos(a) * (0.47 + Math.sin(i * 0.14) * action * 0.1),
                y: (i - 13.5) * 0.078,
                z: Math.sin(a) * 0.47,
              };
            }),
            0.073,
            j,
            0.033,
          ),
        );
      for (let i = 0; i < 28; i += 2) bond(strands[0][i], strands[1][i], 0.031, 2, 0.8);
      break;
    }
    case "emulsifiers": {
      const blend = ease((p - 0.12) / 0.5),
        disperse = ease((p - 0.55) / 0.25);
      for (let side = 0; side < 2; side++) {
        const pts = Array.from({ length: 64 }, (_, i) => {
          const q = i / 63,
            a = q * tau * 1.15 + t * 0.55 + side * Math.PI;
          return {
            x: mix((side ? 1 : -1) * (0.82 + Math.sin(q * Math.PI) * 0.15), Math.cos(a) * (0.64 + q * 0.18), blend),
            y: mix((q - 0.5) * 2.8, Math.sin(a) * (0.65 + q * 0.18), blend),
            z: Math.sin(a) * 0.4 * blend + (side ? -0.09 : 0.09),
          };
        });
        chain(pts, 0.0001, side, 0.19 * (1 - disperse * 0.75), 1 - disperse * 0.9);
      }
      for (let i = 0; i < 32; i++) {
        const a = i * 2.39996 + t * 0.3,
          r = 0.28 + Math.sqrt(i / 32) * 0.93;
        const gold = atom(Math.cos(a) * r, Math.sin(a) * r, Math.sin(i * 1.7) * 0.43, 0.075, 1, disperse);
        const v = atoms[gold],
          blue = atom(v.x + 0.08 * Math.cos(a), v.y + 0.08 * Math.sin(a), v.z + 0.07, 0.049, 0, disperse);
        bond(gold, blue, 0.019, 2, disperse);
      }
      break;
    }
    case "surfactants": {
      atom(0, 0, 0, 0.4, 1);
      for (let i = 0; i < 36; i++) {
        const v = spherePoint(i, 36, mix(1.5, 0.82, action)),
          head = atom(v.x, v.y, v.z, 0.09, 0);
        const tail = atom(v.x * 0.6, v.y * 0.6, v.z * 0.6, 0.036, 1);
        bond(head, tail, 0.029, 1, 0.95);
      }
      for (let j = 0; j < 5; j++)
        atom(Math.cos(j * 1.6) * 1.12, -0.9 + j * 0.46 - action * 0.24, Math.sin(j * 1.6) * 0.5, 0.12, 2, 0.48);
      break;
    }
    case "rheology": {
      const grid: number[][][] = [];
      for (let z = 0; z < 3; z++) {
        grid[z] = [];
        for (let y = 0; y < 5; y++) {
          grid[z][y] = [];
          for (let x = 0; x < 5; x++) {
            const wave = Math.sin(x * 0.7 + y * 0.6 - t) * 0.2;
            grid[z][y][x] = atom(
              (x - 2) * (0.37 + Math.sin(t * 0.6) * 0.055) + wave,
              (y - 2) * (0.36 - Math.sin(t * 0.6) * 0.055),
              (z - 1) * 0.36 + wave,
              0.048,
              (x + y + z) % 5 === 0 ? 1 : 0,
            );
            if (x) bond(grid[z][y][x - 1], grid[z][y][x], 0.024, 0);
            if (y) bond(grid[z][y - 1][x], grid[z][y][x], 0.024, 2);
            if (z) bond(grid[z - 1][y][x], grid[z][y][x], 0.018, 1, 0.65);
          }
        }
      }
      break;
    }
    case "humectants": {
      atom(0, 0, 0, 0.32 + action * 0.17, 0);
      for (let i = 0; i < 15; i++) {
        const v = spherePoint(i, 15, mix(1.7, 0.74, action)),
          a = t * 0.2 + i,
          center = atom(v.x, v.y, v.z, 0.11, 2);
        const a1 = atom(v.x + 0.14 * Math.cos(a), v.y - 0.12, v.z + 0.08, 0.056, 0),
          a2 = atom(v.x - 0.13 * Math.sin(a), v.y - 0.12, v.z - 0.07, 0.056, 0);
        bond(center, a1, 0.035, 2);
        bond(center, a2, 0.035, 2);
        if (i % 3 === 0) {
          const target = atom(v.x * 0.7, v.y * 0.7, v.z * 0.7, 0.038, 1);
          bond(center, target, 0.018, 1, 0.6);
        }
      }
      break;
    }
    case "preservation": {
      const core = atom(0, 0, 0, 0.23, 1);
      for (let i = 0; i < 8; i++) {
        const v = spherePoint(i, 8, 0.38),
          id = atom(v.x, v.y, v.z, 0.07, 1);
        bond(core, id, 0.023, 1);
      }
      for (let j = 0; j < 6; j++) {
        const base = (j * tau) / 6 + t * 0.2,
          closing = mix(0.62, 0, action);
        const ids = chain(
          Array.from({ length: 17 }, (_, i) => {
            const a = (i / 16 - 0.5) * Math.PI * 0.91;
            return {
              x: Math.cos(base) * (Math.cos(a) + closing),
              y: Math.sin(a) * 1.04,
              z: Math.sin(base) * (Math.cos(a) + closing),
            };
          }),
          0.048,
          0,
          0.08,
          0.8,
        );
        if (j % 2 === 0)
          for (let i = 3; i < 17; i += 5) {
            const v = atoms[ids[i]];
            atom(v.x, v.y, v.z, 0.08, 2);
          }
      }
      break;
    }
    case "colors-minerals": {
      for (let j = 0; j < 7; j++) {
        const q = (j * tau) / 7 + t * 0.1,
          cx = j ? Math.cos(q) * 0.73 : 0,
          cy = j ? Math.sin(q) * 0.62 : 0,
          cz = Math.sin(j * 2) * 0.4;
        const size = (j ? 0.28 : 0.5) * (0.5 + ease(action * 1.8 - j * 0.08) * 0.5),
          ids = [atom(cx, cy - size * 1.65, cz, 0.026, 2), atom(cx, cy + size * 1.65, cz, 0.026, 2)];
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2 + q;
          ids.push(atom(cx + Math.cos(a) * size, cy, cz + Math.sin(a) * size, 0.025, 0));
        }
        for (let k = 0; k < 4; k++) {
          const a = ids[2 + k],
            b = ids[2 + ((k + 1) % 4)];
          facets.push(
            { vertices: [ids[0], a, b], tone: j % 3 === 0 ? 1 : 0, alpha: 0.68 },
            { vertices: [ids[1], b, a], tone: j % 3 === 0 ? 1 : 2, alpha: 0.55 },
          );
          bond(ids[0], a, 0.015, 2);
          bond(a, b, 0.015, 2);
          bond(ids[1], a, 0.015, 2);
        }
      }
      break;
    }
    case "bases-kits": {
      for (let j = 0; j < 4; j++) {
        const angle = (j * Math.PI) / 2 + t * 0.08,
          dist = mix(1.3, 0.53, action),
          ids: number[] = [];
        for (let i = 0; i < 8; i++)
          ids.push(
            atom(
              Math.cos(angle) * dist + (i & 1 ? 1 : -1) * 0.25,
              Math.sin(angle) * dist + (i & 2 ? 1 : -1) * 0.25,
              (i & 4 ? 1 : -1) * 0.25,
              0.065,
              j % 2,
            ),
          );
        for (let i = 0; i < 8; i++)
          for (const axis of [1, 2, 4]) if (!(i & axis)) bond(ids[i], ids[i | axis], 0.049, j % 2);
        facets.push({ vertices: [ids[0], ids[1], ids[3], ids[2]], tone: j % 2, alpha: 0.16 });
      }
      break;
    }
    case "exfoliants-acids": {
      const core = ring(0.37, 0, 6, 1, 0.5, t * 0.2);
      core.forEach((id, i) => {
        const v = atoms[id],
          tip = atom(v.x * 1.35, v.y + 0.19, v.z * 1.35, 0.065, 0);
        bond(id, tip, 0.029, 0);
      });
      for (let layer = 0; layer < 3; layer++) {
        const peel = ease((action - layer * 0.16) * 1.5);
        for (let i = 0; i < 27; i++) {
          const a = (i / 27) * tau + t * 0.18 + layer * 0.6,
            r = 0.65 + layer * 0.17 + peel * 0.48;
          const x = Math.cos(a) * r,
            y = Math.sin(a) * r,
            z = (layer - 1) * 0.3 + peel * Math.cos(a) * 0.55;
          atom(x, y, z, 0.075 - layer * 0.009, layer % 2 ? 1 : 2, 1 - peel * 0.55);
        }
      }
      break;
    }
    case "formulation-aids":
    default: {
      atom(0, 0, 0, 0.17, 1);
      for (let j = 0; j < 3; j++)
        ring(0.63 + j * 0.21, 0, 30, j % 2, mix(1.3 + j * 0.5, 1.55, action), t * 0.3 * (j % 2 ? -1 : 1));
      const ids: number[] = [];
      for (let i = 0; i < 6; i++) {
        const a = (i * tau) / 6;
        ids.push(atom(Math.cos(a) * 0.37, Math.sin(a) * 0.37, 0, 0.08, 0));
      }
      ids.forEach((id, i) => bond(id, ids[(i + 1) % 6], 0.025, 1));
      break;
    }
  }
  return { atoms, bonds, facets };
}
