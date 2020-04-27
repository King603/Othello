/**
 * 程序：黑白棋人机博弈
 * 作者：King(王者)
 * 版本：1.05
 * 日期：2020年2月15日
 */
import Chessboard from "./Chessboard.js";
import AI from "./AI.js";
import Othello from "./Othello.js";

export let board = new Chessboard();
export let ai = new AI();
export let other = new Othello();

export function $(id) {
  return document.getElementById(id);
}

board.create();
board.toDown = other.goChess;

let selectbox = $("selectbox");
$("play").onclick = () => selectbox.style.display = "block";

$("back").onclick = () => other.historyBack();

$("ok").onclick = () => {
  selectbox.style.display = "none";
  let ro = selectbox.getElementsByTagName("input");
  other.aiSide = ro[0].checked ? -1 : 1;
  let i = 0;
  while (i + 2 < ro.length) if (ro[i++ + 2].checked) break;
  ai.calculateTime = [20, 100, 500, 2000, 5000, 10000, 20000][i];
  ai.outcomeDepth = [7, 10, 13, 14, 15, 16, 17][i];
  other.play();
};

$("cancel").onclick = () => selectbox.style.display = "none";

$("explain").onclick = () =>
  alert(`黑白棋游戏说明
【简介】
  黑白棋又叫反棋(Reversi)、奥赛罗棋(Othello)、苹果棋或翻转棋。游戏通过相互翻转对方的棋子，最后以棋盘上谁的棋子多来判断胜负。
【规则】
  1．黑方先行，双方交替下棋。
  2．新落下的棋子与棋盘上已有的同色棋子间，对方被夹住的所有棋子都要翻转过来。可以是横着夹，竖着夹，或是斜着夹。夹住的位置上必须全部是对手的棋子，不能有空格。
  3．新落下的棋子必须翻转对手一个或多个棋子，否则就不能落子。
  4．如果一方没有合法棋步，也就是说不管他下到哪里，都不能至少翻转对手的一个棋子，那他这一轮只能弃权，而由他的对手继续落子直到他有合法棋步可下。
  5．如果一方至少有一步合法棋步可下，他就必须落子，不得弃权。
  6．当棋盘填满或者双方都无合法棋步可下时，游戏结束。结束时谁的棋子最多谁就是赢家。
  
PS: 本游戏最好用Chrome浏览器远行，以达到最高棋力。`);

$("no3d").onclick = e => {
  let desk = $("desk");
  desk.className = desk.className == "fdd" ? "" : "fdd";
  e.target.innerHTML = (desk.className == "fdd" ? "2" : "3") + "D";
};
