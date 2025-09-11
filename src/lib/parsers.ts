import { createParser, type ParserBuilder } from "nuqs";


export function makeNullable<T>(parser: ParserBuilder<T>) {
  return createParser<T | null>({
    parse(q) {
      if (q == null) return null;               // no param -> null
      const v = parser.parse(q);                
      return v === null ? null : v;             
    },
    serialize(v) {
      if (v === null) return "";                
      return parser.serialize(v);               
    },
  });
}


export function parseAsNullableEnum<T extends string>(values: readonly T[]) {
  return createParser<T | null>({
    parse(q) {
      if (q == null) return null;
      return values.includes(q as T) ? (q as T) : null;
    },
    serialize(v) {
      return v === null ? "" : v;               
    },
  });
}

export const parseAsNumber = createParser<number>({
  parse(query) {
    if (query == null) return null;        
    const n = Number(query);
    return Number.isNaN(n) ? null : n;     
  },
  serialize(value) {
    return value.toString();               
  },
});