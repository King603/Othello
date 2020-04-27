import { other } from "./ocjs.js";
import Transposition from "./Transposition.js";
export default class  {
  calculateTime = 1000;// 限制每步棋计算的时间
  outcomeDepth = 14;// 终局搜索深度
  outcomeCoarse = 15;// 终局搜索模糊模式搜索深度
  maxDepth = "";
  outTime = 0;
  weight = [6, 11, 2, 2, 3];// 权重
  // 用于估价函数中边角的计算
  rnd = [
    { s: 0, a: 1, b: 8, c: 9, dr: [1, 8] },
    { s: 7, a: 6, b: 15, c: 14, dr: [-1, 8] },
    { s: 56, a: 57, b: 48, c: 49, dr: [1, -8] },
    { s: 63, a: 62, b: 55, c: 54, dr: [-1, -8] }
  ];
  history = [[], []];// 历史启发表
  constructor() {
    for (let i = 0; i < 2; i++)
      for (let j = 0; j <= 60; j++)
        this.history[i][j] = [0, 63, 7, 56, 37, 26, 20, 43, 19, 29, 34, 44, 21, 42, 45, 18, 2, 61, 23, 40, 5, 58, 47, 16, 10, 53, 22, 41, 13, 46, 17, 50, 51, 52, 12, 11, 30, 38, 25, 33, 4, 3, 59, 60, 39, 31, 24, 32, 1, 62, 15, 48, 8, 55, 6, 57, 9, 54, 14, 49];
    this.hash = new Transposition();
  }
  // 符号函数
  sgn(n) {
    return n > 0 ? 1 : n < 0 ? -1 : 0;
  }
  // 估价函数
  evaluation(m) {
    let corner = 0, steady = 0, uk = {};
    for (let v of this.rnd) {
      // 角为空格v = this.rnd[i]
      if (m[v.s] == 0) {
        corner -= m[v.a] * 3;// 次要危险点
        corner -= m[v.b] * 3;// 次要危险点
        corner -= m[v.c] * 6;// 主要危险点
        continue;
      }
      corner += m[v.s] * 15;// 角点
      steady += m[v.s];// 角也是稳定子
      for (let k = 0; k < 2; k++) {
        if (uk[v.s + v.dr[k]]) continue;
        let eb = !0, tmp = 0, j = 1;
        while (j <= 6) {
          let t = m[v.s + v.dr[k] * j];
          if (t == 0) break;
          else if (eb && t == m[v.s]) steady += t;// 稳定子
          else {
            eb = !1;
            tmp += t;// 稳定子
          }
          j++;
        }
        if (j == 7 && m[v.s + v.dr[k] * 7] != 0) {
          steady += tmp;
          uk[v.s + v.dr[k] * 6] = !0;
        }
      }
    }
    let frontier = 0;// 前沿子
    for (let i = 9; i <= 54; i += (i & 7) == 6 ? 3 : 1) {
      if (m[i] == 0) continue;
      for (let j = 0; j < 8; j++)
        if (m[other.dire(i, j)] == 0) {
          frontier -= m[i];
          break;
        }
    }
    let mobility = (m.nextNum - m.prevNum) * m.side;// 行动力(简单吧)
    let parity = (m.space < 18 ? m.space % 2 == 0 ? -1 : 1 : 0) * m.side;// 奇偶性
    return (corner * this.weight[0] + steady * this.weight[1] + frontier * this.weight[2] + mobility * this.weight[3] + parity * this.weight[4]) * m.side;
  }
  // 终局结果
  outcome(m) {
    let s = m.black - m.white;
    return (this.maxDepth >= this.outcomeCoarse ? this.sgn(s) : s + m.space * this.sgn(s)) * 10000 * m.side;// 为了加快终局搜索速度只给出输赢,暂不记分,使搜索更容易发生剪枝。
  }
  // 开始搜索博弈树
  startSearch(m) {
    // this.hash = new Transposition();
    // console.profile('性能分析器一');
    let f = 0;
    if (m.space <= this.outcomeDepth) {
      //进行终局搜索
      this.outTime = (new Date()).getTime() + 600000;// 终局搜索就不限时间了
      this.maxDepth = m.space;
      // console.time("计时器2");
      f = this[
        this.maxDepth >= this.outcomeCoarse 
        ? "alphaBeta" 
        : "mtd"
      ](m, this.maxDepth, ...(this.maxDepth >= this.outcomeCoarse ? [-Infinity, Infinity] : [f]));
      // console.timeEnd("计时器2");
      console.log("终局搜索结果：", this.maxDepth, m.space, m.side, f * m.side);
      return this.hash.getBest(m.key);
    }
    this.outTime = new Date().getTime() + this.calculateTime;
    this.maxDepth = 0;
    // console.time("计时器2");
    let best;
    try {
      while (this.maxDepth < m.space) {
        f = this.mtd(m, ++this.maxDepth, f);
        // f = alphaBeta(m, ++this.maxDepth, -Infinity, Infinity);
        best = this.hash.getBest(m.key);
        console.log(this.maxDepth, f * m.side, best);
      }
    }
    catch (error) {
      if (error.message != "time out")// 不有限定计算时间的异常
        throw error;// 把异常转抛给浏览器
    }
    // console.timeEnd("计时器2");
    // console.profileEnd();
    console.log("搜索结果：", this.maxDepth - 1, m.space, m.side, f * m.side);
    return best;
  }
  // MTD(f)算法
  mtd(m, depth, f) {
    let lower = -Infinity;
    let upper = Infinity;
    let beta = f;
    do {
      beta = f + (f == lower ? 1 : 0);// 确定试探值
      f = this.alphaBeta(m, depth, beta - 1, beta);// 进行零宽窗口试探
      f < beta ? upper = f : lower = f;
    } while (lower < upper);
    f < beta &&// 如果最后一次搜索得到的只是上限，需再搜索一次，确保获得正确的最佳棋步
      (f = this.alphaBeta(m, depth, f - 1, f));
    return f;
  }
  // Alpha-beta剪枝
  alphaBeta(m, depth, alpha, beta) {
    if ((new Date()).getTime() > this.outTime)// 判断是否到达限定的计算时间
      throw new Error("time out");// 用抛出异常方式直接从深层搜索中跳出来
    let hv = this.hash.get(m.key, depth, alpha, beta);
    if (hv !== !1) return hv;
    if (m.space == 0)// 棋盘子满
      return this.outcome(m);// 直接返回终局结果
    other.findLocation(m);
    // 判断无棋可走
    if (m.nextNum == 0) {
      if (m.prevNum == 0)// 判断上一步也是无棋可走
        return this.outcome(m);// 直接返回终局结果
      other.pass(m);
      return -this.alphaBeta(m, depth, -beta, -alpha);
    }
    // 搜索深度到达设置的极限
    if (depth <= 0) {
      let e = this.evaluation(m);
      this.hash.set(m.key, e, depth, 0, null);
      return e;
    }
    let hd = this.hash.getBest(m.key);
    if (hd !== null) this.moveToHead(m.nextIndex, hd);
    let hist = this.history[m.side == 1 ? 0 : 1][m.space];
    let hashf = 1;// 最佳估值类型, 0为精确值, 1为<=alpha, 2为>=beta
    let bestVal = -Infinity;// 记录最佳估值
    let bestAct = null;// 记录最佳棋步
    for (let i = 0; i < m.nextNum; i++) {
      let n = m.nextIndex[i];
      let v = -this.alphaBeta(other.newMap(m, n), depth - 1, -beta, -alpha);
      if (v > bestVal) {
        bestVal = v;
        bestAct = n;
        if (v > alpha) {
          alpha = v;
          hashf = 0;
          this.moveToUp(hist, n);
        }
        if (v >= beta) {
          hashf = 2;
          break;// 发生剪枝
        }
      }
    }
    this.moveToHead(hist, bestAct);
    this.hash.set(m.key, bestVal, depth, hashf, bestAct);
    return bestVal;
  }
  moveToHead(arr, n) {
    if (arr[0] == n) return;
    arr.splice(arr.indexOf(n), 1);
    arr.unshift(n);
  }
  moveToUp(arr, n) {
    if (arr[0] == n) return;
    let i = arr.indexOf(n);
    arr[i] = arr[i - 1];
    arr[i - 1] = n;
  }
}
