import type {Point} from "./areas";

export type SearchBounds = [number, number, number, number]; // south, west, north, east
export function validBounds(value:unknown):value is SearchBounds{
  if(!Array.isArray(value)||value.length!==4||!value.every(Number.isFinite))return false;
  const [south,west,north,east]=value;
  return south>=-90&&north<=90&&south<north&&west>=-180&&east<=180&&west<east;
}
export function containsPoint([south,west,north,east]:SearchBounds,[lat,lng]:Point){
  return lat>=south&&lat<=north&&lng>=west&&lng<=east;
}
