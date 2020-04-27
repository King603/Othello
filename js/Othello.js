import Zobrist from "./Zobrist.js";
import { board, ai, $ } from "./ocjs.js"
export default class {
  zobrist = new Zobrist();
  aiSide = 0;// 1: 电脑为黑棋,  -1: 电脑为白棋,  0: 双人对战 2: 电脑自己对战
  aiRuning = !1;// AI运算中...
  all = board.width * board.height;
  // 获取某一棋盘格某一方向的格子.超过边界返回this.all
  dire = (() =>
    (i, d) =>
      ((i += [-8, -7, 1, 9, 8, 7, -1, -9][d]) & this.all) != 0 || (i & 7) == [8, 0, 0, 0, 8, 7, 7, 7][d] ? this.all : i
  )();
  // 开始新棋局
  play() {
    console.clear();
    if (this.aiRuning) return;
    clearTimeout(this.timer);
    // console.time("计时器1");
    this.map = [];// 棋局数组
    for (let i = 0; i < this.all; i++) this.map[i] = 0;// 空格为 0
    this.map[this.all / 2 - 4] = this.map[this.all / 2 + 3] = 1;// 黑子为 1
    this.map[this.all / 2 - 5] = this.map[this.all / 2 + 4] = -1;// 白子为 -1
    this.map.black = this.map.white = 2;// 黑白棋子数目
    this.map.space = 60;// 空格数目
    this.map.frontier = [];// 周围有棋子的空格，用于加速查找可下棋步
    [18, 19, 20, 21, 26, 29, 34, 37, 42, 43, 44, 45].forEach(i => this.map.frontier[i] = !0);
    this.map.side = 1;// 当前执棋方
    this.map.newPos = -1;// 最新下子的位置
    this.map.newRev = [];// 最新反转棋子的位置
    this.map.nextIndex = [];// 下一步可走棋的位置
    this.map.next = {};// 下一步可走棋的反转棋子
    this.map.nextNum = 0;// 下一步可走棋的数目
    this.map.prevNum = 0;// 上一步可走棋的数目
    this.map.key = [0, 0];// 用于置换表的键值
    this.history = [];// 历史记录,用于悔棋操作
    this.update();
  }
  update() {
    let aiAuto = this.aiSide == this.map.side || this.aiSide == 2;
    this.findLocation(this.map);
    this.setAIRunStatus(!1);
    this.setPassStatus(!1);
    board.update(this.map, aiAuto);
    // console.log(map.nextIndex)
    // 棋盘子满 或 双方都无棋可走
    if (this.map.space == 0 || (this.map.nextNum == 0 && this.map.prevNum == 0)) {
      this.timer = setTimeout(() => {// 定时器id
        // console.timeEnd("计时器1");
        this.setAIRunStatus(!1);
        this.setPassStatus(!1);
        alert(`棋局结束
          
黑棋: ${this.map.black} 子
白棋: ${this.map.white} 子
          
${this.map.black == this.map.white ? "平局!!!" : `${this.map.black > this.map.white ? "黑" : "白"}棋胜利!!!"`}`);
      }, 450);
      return;
    }
    // 无棋可走pass
    if (this.map.nextNum == 0) {
      this.timer = setTimeout(() => {
        this.pass(this.map);
        this.update();
        this.setPassStatus(!0);
      }, 450);
      return;
    }
    if (aiAuto) {
      this.aiRuning = !0;
      this.timer = setTimeout(() => {
        this.setAIRunStatus(!0);
        this.timer = setTimeout(() => this.go(// 就一步棋可走了,还搜索什么?
          this.map.nextNum == 1
            ? this.map.nextIndex[0]
            : this.map.space <= 58
              ? ai.startSearch(this.map)
              : this.map.nextIndex[Math.random() * this.map.nextIndex.length >> 0]
        ), 50);
      }, 400);
    }
  }
  // 查找可走棋的位置
  findLocation(m) {
    m.nextIndex = [];
    m.next = [];
    for (let i = 0; i < this.all - 4; i++) {
      let fi = ai.history[m.side == 1 ? 0 : 1][m.space][i];
      if (!m.frontier[fi]) continue;
      let ta = [], la = 0;
      for (let j = 0; j < board.height; j++)
        ((i, j) => {
          let lk = 0;
          while ((i = this.dire(i, j)) != this.all && m[i] == -m.side) {
            ta[la++] = i;
            lk++;
          }
          if (i == this.all || m[i] != m.side) la -= lk;
        })(fi, j);
      if (la > 0) {
        if (la != ta.length) ta = ta.slice(0, la);
        m.next[fi] = ta;
        m.nextIndex.push(fi);
      }
    }
    m.nextNum = m.nextIndex.length;
  }
  // 一方无棋可走
  pass(m) {
    m.side = -m.side;
    m.prevNum = m.nextNum;
    this.zobrist.swap(m.key);
  }
  // 返回新的棋局
  newMap(m, n) {
    let nm = m.slice(0);// 复制数组
    nm[n] = m.side;// 把新下的棋子放到棋盘上
    nm.key = m.key.slice(0);// 复制数组
    this.zobrist.set(nm.key, m.side == 1 ? 0 : 1, n);
    nm.frontier = m.frontier.slice(0);// 复制数组
    nm.frontier[n] = !1;
    for (let i = 0; i < board.height; i++) {
      let k = this.dire(n, i);
      if (k != this.all && nm[k] == 0) nm.frontier[k] = !0;
    }
    let ne = m.next[n];
    let l = ne.length;
    for (let i = 0; i < l; i++) {
      nm[ne[i]] = m.side;// 反转的棋子
      this.zobrist.set(nm.key, 2, ne[i]);
    }
    nm.black = m.black + (m.side == 1 ? l + 1 : -l);
    nm.white = m.white + (m.side == 1 ? -l : l + 1);
    nm.space = this.all - nm.black - nm.white;// 空格数目
    nm.side = -m.side;
    nm.prevNum = m.nextNum;
    this.zobrist.swap(nm.key);
    return nm;
  }
  // 走棋
  goChess = n => { // ! 此处必须用箭头函数，情况不知往后研究
    this.history.push(this.map);
    this.go(n);
  }
  // 走棋
  go(n) {
    this.aiRuning = !1;
    let rev = this.map.next[n]; // 旧值存储
    this.map = this.newMap(this.map, n);
    this.map.newRev = rev;
    this.map.newPos = n;
    // console.log(map.key);
    this.update();
  }
  historyBack() {
    if (this.aiRuning || this.history.length == 0) return;
    clearTimeout(this.timer);
    this.map = this.history.pop();
    this.update();
  }
  // 设置AI运算状态
  setAIRunStatus(t) {
    $("airuning").style.display = t ? "block" : "none";
  }
  // 设置pass状态
  setPassStatus(bool) {
    let passObj = $("pass");
    passObj.style.display = bool ? "block" : "none";
    if (bool) {
      let bool = this.map.side == 1;
      passObj.innerHTML = `${bool ? "白" : "黑"}方无棋可下，${bool ? "黑" : "白"}方继续下子`;
    }
  }
}
