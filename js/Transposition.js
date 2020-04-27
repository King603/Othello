export default class {
  HASH_SIZE = (1 << 19) - 1;// 置换单元数为 524287
  data = new Array(this.HASH_SIZE + 1);
  set(key, eva, depth, flags, best) {
    let keyb = key[0] & this.HASH_SIZE;
    let phashe = this.data[keyb];
    if (!phashe)
      phashe = this.data[keyb] = {};
    else if (phashe.key == key[1] && phashe.depth > depth)// 局面相同 并且 记录比当前更深 则不替换
      return;
    phashe.key = key[1];
    phashe.eva = eva;
    phashe.depth = depth;
    phashe.flags = flags;
    phashe.best = best;
  }
  get(key, depth, alpha, beta) {
    let phashe = this.data[key[0] & this.HASH_SIZE];
    if (!phashe || phashe.key != key[1] || phashe.depth < depth)
      return !1;
    switch (phashe.flags) {
      case 0: return phashe.eva;
      case 1: return phashe.eva <= alpha ? phashe.eva : !1;
      case 2: return phashe.eva >= beta ? phashe.eva : !1;
    }
  }
  getBest(key) {
    let phashe = this.data[key[0] & this.HASH_SIZE];
    return phashe && phashe.key == key[1] ? phashe.best : null;
  }
}
