/*
https://namu.wiki/w/%EC%9E%91%EA%B3%A1(%EB%A7%88%EB%B9%84%EB%85%B8%EA%B8%B0)
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

const mmlPlayer = (function(){
  let defmml ="T120L4V8O4";
  let Player = function(){
    this.cmds = null;
  }
  Player.prototype.load = function(mmlCmds){
    let mmlCmds = new Array(mmlCmds.length)
    for(let i=0,m=mmlCmds.length;i<m;i++){
      mmlCmds[i] = this.convertCmd(mmlCmds[i]);
    }
    this.mmlCmds = mmlCmds;
  }
  Player.prototype.convertCmd = function(mmlCmd){
    let arg1 = mmlCmd.replace(/[^TVOLNCDEFGABR]/,'');
    if(arg1.length==0){return false;}
    let matches = mmlCmd.trim().match(/[0-9]{1,4}$/g);
    let arg2 = matches[0]?matches[0]:0;  
    // arg3,arg4 처리 해야함
    console.log(arg1,arg2);
  }
  let mmlPlayer = {
    "play":function(mml){
      
      mml = defmml+mml;
      let player = new Player();
      //T120L4V8O4T40E5R1E3R0D3R0E3R0E1R0D1R0-G4R1F3R0F1R0F1R0A3R0F1R0E1R0D1R0D1R0E5R0F3R0F1R0F1R0A3R0F1R0E1R0D1R0D1R0E5R0
      let cmds = mml.match(/((\<|\>)?(\+|#|-)?[A-Z]\d{0,4})/g);
      player.load(cmds);
      // for(let i=0,m=cmds.length;i<m;i++){
      //   player.cmd(cmds[i]);
      // }
    }
  };
  return mmlPlayer;
})()

