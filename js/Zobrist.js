export default class {
  swapSide = [rnd(), rnd()];// 下棋方轮换的附加散列码
  zarr = [[], [], []];
  constructor() {
    for (let pn = 0; pn < 64; pn++) {
      this.zarr[0][pn] = [rnd(), rnd()];// 各位置上出现黑棋时
      this.zarr[1][pn] = [rnd(), rnd()];// 各位置上出现白棋时
      this.zarr[2][pn] = [
        this.zarr[0][pn][0] ^ this.zarr[1][pn][0],
        this.zarr[0][pn][1] ^ this.zarr[1][pn][1]
      ];// 各位置上翻棋时
    }
  }
  // 执棋方轮换
  swap(key) {
    foreach(key, this.swapSide)
  }
  // 设置更新key
  set(key, pc, pn) {
    foreach(key, this.zarr[pc][pn]);
  }
}
// 获取32位的随机数
function rnd() {
  return (Math.random() * 0x100000000) >> 0;
}
function foreach(key, arr) {
  for (let i = 0; i < 2; i++) key[i] ^= arr[i];
}
