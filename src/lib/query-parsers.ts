import { parseAsStringEnum } from "nuqs";
import { parseAsNullableEnum, parseAsNumber} from "@/lib/parsers";


export const styleParser = parseAsStringEnum([
  "plain", "cathedral", "knife", "split", "twisted", "wide_plain",
]).withDefault("plain");


export const metalParser = parseAsStringEnum([
  "white", "yellow", "rose", "platinum",
]).withDefault("white");

export const purityParser = parseAsNullableEnum([
  "9k", "14k", "18k"
]).withDefault("9k");


export const tabParser = parseAsStringEnum([
  "setting", "stone", "shank",
]).withDefault("setting");




export const shapeParser = parseAsStringEnum([
  "round","princess","cushion","oval","radiant",
  "pear","emerald","marquise","heart","asscher",
]).withDefault("round");

export const caratParser = parseAsNumber.withDefault(0.5);
