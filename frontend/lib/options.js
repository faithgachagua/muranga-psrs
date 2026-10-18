import { sectorIcon } from './sectors';
import { STATUS, STATUS_KEYS } from './constants';

const withAll = (label, list) => (label ? [{ value: '', label }, ...list] : list);

export const sectorOptions = (sectors, allLabel) =>
  withAll(allLabel, sectors.map((s) => ({ value: String(s.id), label: s.name, icon: sectorIcon(s.slug) })));

export const wardOptions = (wards, allLabel) =>
  withAll(allLabel, wards.map((w) => ({ value: String(w.id), label: w.name, group: w.sub_county })));

export const statusOptions = (allLabel) =>
  withAll(allLabel, STATUS_KEYS.map((k) => ({ value: k, label: STATUS[k].label, icon: STATUS[k].icon })));
