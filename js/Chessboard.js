import { $ } from "./ocjs.js";
export default class  {
  pieces;// 棋子元素
  piecesnum;// 黑白子数目显示元素
  side;// 表示执棋方元素
  toDown = null;// 下子
  width = 8;
  height = 8;
  // 绑定点击事件
  bindEvent(td) {
    for (let i = 0; i < this.width * this.height; i++)
      td[i].onclick = () => this.pieces[i].className == "prompt" && this.toDown(i);
    td = undefined;
  }
  // 创建棋盘
  create() {
    let obj = $("chessboard");
    let html = "<table>";
    for (let i = 0; i < this.width; i++) {
      html += "<tr>";
      for (let j = 0; j < this.height; j++)
        html += `<td class='bg${(j + i) % 2}'><div></div></td>`;
      html += "</tr>";
    }
    html += "</table>";
    obj.innerHTML = html;
    this.pieces = obj.getElementsByTagName("div");
    this.bindEvent(obj.getElementsByTagName("td"));
    this.piecesnum = document.querySelectorAll("#console span");
    this.side = { "1": $("side1"), "-1": $("side2") };
  }
  // 更新棋盘
  update(m, nop) {
    for (let i = 0; i < this.width * this.height; i++) this.pieces[i].className = ["white", "", "black"][m[i] + 1];
    if (!nop) for (let n in m.next) this.pieces[n].className = "prompt";
    for (let i of m.newRev) this.pieces[i].className += " reversal";
    if (m.newPos != -1) this.pieces[m.newPos].className += " newest";
    this.piecesnum[0].innerHTML = m.black;
    this.piecesnum[1].innerHTML = m.white;
    this.side[m.side].className = "cbox side";
    this.side[-m.side].className = "cbox";
  }
}
