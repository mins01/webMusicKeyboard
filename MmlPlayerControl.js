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
const MmlPlayerControl = (function(){
  let defmml ="T120L4V8O4";
  class MmlPlayerControl {
    constructor() {
      // this.players = [];
      this.waves = ['square','square','square','square','square','square'];
      this.players = [new MmlPlayer(),new MmlPlayer(),new MmlPlayer(),new MmlPlayer(),new MmlPlayer(),new MmlPlayer()]
      this.players[0].name="p0";
      this.players[1].name="p1";
      this.players[2].name="p2";
      this.players[3].name="p3";
      this.players[4].name="p4";
      this.players[5].name="p5";

    }
    load(strMmls){
      console.log('MmlPlayerControl.load',strMmls);

      strMmls = strMmls.trim();
      let mmls = strMmls.split(',');
      let player = null;
      let thisC = this;
      mmls.forEach((mml,k)=>{
        // player = new MmlPlayer();
        // player.wave = thisC.waves[k];
        console.log('MmlPlayerControl.load.foreach',mml);
        thisC.players[k].loadMml(mml);
        // thisC.players.push(player);
      });
    }
    play(){
      this.players.forEach((player,k)=>{
        if(player.mml.length) player.play();
      })
    }
    stop(){
      this.players.forEach((player)=>{
        player.stop();
      })
    }
    clear(){
      this.players.forEach((player,k)=>{
        if(player.mml.length) player.clear();
      })    }
    
  };

  return MmlPlayerControl;
})();