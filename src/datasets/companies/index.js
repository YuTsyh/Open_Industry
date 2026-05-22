import { accton } from './accton.js';
import { amat } from './amat.js';
import { amazon } from './amazon.js';
import { ase } from './ase.js';
import { avc } from './avc.js';
import { broadcom } from './broadcom.js';
import { coherent } from './coherent.js';
import { delta } from './delta.js';
import { disco } from './disco.js';
import { ibiden } from './ibiden.js';
import { lumentum } from './lumentum.js';
import { micron } from './micron.js';
import { microsoft } from './microsoft.js';
import { nanya } from './nanya.js';
import { nvidia } from './nvidia.js';
import { quanta } from './quanta.js';
import { smci } from './smci.js';
import { tel } from './tel.js';
import { tsmc } from './tsmc.js';
import { unimicron } from './unimicron.js';
import { vertiv } from './vertiv.js';
import { winbond } from './winbond.js';
import { wiwynn } from './wiwynn.js';

export const companies = {
  "accton": accton,
  "amat": amat,
  "amazon": amazon,
  "ase": ase,
  "avc": avc,
  "broadcom": broadcom,
  "coherent": coherent,
  "delta": delta,
  "disco": disco,
  "ibiden": ibiden,
  "lumentum": lumentum,
  "micron": micron,
  "microsoft": microsoft,
  "nanya": nanya,
  "nvidia": nvidia,
  "quanta": quanta,
  "smci": smci,
  "tel": tel,
  "tsmc": tsmc,
  "unimicron": unimicron,
  "vertiv": vertiv,
  "winbond": winbond,
  "wiwynn": wiwynn
};

export const companyRecords = Object.entries(companies).map(([id, company]) => ({ id, ...company }));
