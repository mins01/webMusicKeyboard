/*
https://namu.wiki/w/%EC%9E%91%EA%B3%A1(%EB%A7%88%EB%B9%84%EB%85%B8%EA%B8%B0)
https://en.wikipedia.org/wiki/Music_Macro_Language#Syntax_2
T(32~255) : 템포
V(0~15) : 볼륨
O(0~8) : 옥타브
＜, ＞ : 옥타브 내림,올림
L(1~64) : 기본 길이 (1이 온음표(4박))
N(0~96) : 고정음(noteValues의 값의 주파수가 97개, 그 순서에 맞춘 값)
CDEFGAB : 도~ 시
+#-  :반음올림,내림
R    : 쉼표
T120 L4 V8 O4  :초기값
 */
/*
The sound length
Value	Length
0	1/32
1	1/16
2	dotted 1/16
3	1/8
4	dotted 1/8
5	1/4
6	dotted 1/4
7	1/2
8	dotted 1/2
9	1
*/
const MmlPlayerControl = (function(){
  let defmml ="T120L4V8O4";
  class MmlPlayerControl {
    constructor() {
      this.players = [];
    }
    load(strMmls){
      console.log('MmlPlayerControl.load',strMmls);

      strMmls = strMmls.trim();
      let mmls = strMmls.split(',');
      let player = null;
      let thisC = this;
      mmls.forEach((mml)=>{
        player = new MmlPlayer();
        console.log('MmlPlayerControl.load.foreach',mml);
        player.loadMml(mml);
        thisC.players.push(player);
      });
    }
    play(){
      this.players.forEach((player)=>{
        player.play();
      })
    }
    clear(){
      this.players.splice(0,this.players.length)
    }
    
  };

  return MmlPlayerControl;
})();