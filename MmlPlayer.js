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
const MmlPlayer = (function(){
  let defmml ="T120L4V8O4";
  class MmlPlayer {
    constructor() {
      this.name='';
      this.playCmds = null;
      this.mml = "";
      this.endedMml = "";
      this.tm = null;
      this.wave = 'square';
    }
    codeToN(semi,key,octave){
      let n=0;
      switch(key){
        case 'C':n=0;break;
        case 'D':n=2;break;
        case 'E':n=4;break;
        case 'F':n=5;break;
        case 'G':n=7;break;
        case 'A':n=9;break;
        case 'B':n=11;break;
      }
      n+=semi;
      n+=(octave*12);
      return n;
    }
    loadMml(mml){
      mml = mml.replace(/^MML@/i,"");
      this.mml = mml;
      let cmds = mml.match(/([\<\>A-Za-z][\+#\-]{0,1}\d{0,4}\.{0,})/g);
      // console.log(mml,cmds);
      this.load(cmds);
    }
    load(cmds){
      if(!cmds || cmds.length ==0){
        return;
      }
      let defCmd = {
        'org':'',
        'N':-1,
        'sec':0,
        'semi':0, //참고값, 실사용은 안함
        'key':'', //참고값, 실사용은 안함
        'code':'',//key+semi+O  //참고값, 실사용은 안함
        'freq':0, //
        'length':-1, //참고값, 실사용은 안함
        'dotted':0, //참고값, 실사용은 안함
        'T':120,
        'V':8,
        'O':4,
        'L':4,
      };
      let codeCmds = new Array(cmds.length)
      let preCmd = defCmd;
      for(let i=0,m=cmds.length;i<m;i++){
        if(!cmds[i]){continue;}
        codeCmds[i] = this.convertCmd(cmds[i],preCmd);
        preCmd = codeCmds[i];
      }
      // console.log(codeCmds);
      this.codeCmds = codeCmds;
    }
    convertCmd(cmd,preCmd){
      cmd = cmd.toUpperCase();
      let arg1 = cmd.replace(/[^<>TVOLNCDEFGABR]/,'');
      let currCmd = { ...preCmd };
      if(arg1.length==0){return currCmd;}
      // let matches = cmd.trim().match(/[0-9]{1,4}$/g);
      let matches = cmd.match(/([<>A-Z])([\+#-]{0,1})(\d{0,4})(\.{0,})/);
      // console.log(cmd,matches);
      currCmd['org'] = matches[0];
      currCmd['semi'] = 0;
      currCmd['length'] = -1;
      currCmd['freq'] = -1;
      currCmd['sec'] = 0;
      currCmd['code']='';
      currCmd['dotted']=matches[4].length;
      let t;
      let def_sec = 60/currCmd['T']*4 //온음표의 연주 길이
      switch(matches[1]){
        case 'T': if(matches[3] != '') currCmd['T']=parseInt(matches[3],10); break;
        case 'V': if(matches[3] != '') currCmd['V']=parseInt(matches[3],10); break;
        case 'O': if(matches[3] != '') currCmd['O']=parseInt(matches[3],10); break;
        case 'L': if(matches[3] != '') currCmd['L']=parseInt(matches[3],10); break;
        case '<': if(matches[3] != '') currCmd['O']=Math.max(0,currCmd['O']-(matches[3]==""?1:parseInt(matches[3]))); break;
        case '>': if(matches[3] != '') currCmd['O']=Math.min(8,currCmd['O']+(matches[3]==""?1:parseInt(matches[3]))); break;
        case 'P':;
        case 'R':;
        currCmd['key']=matches[1];
        currCmd['code']=currCmd['key']+currCmd['O']
        currCmd['N']=-1;
        currCmd['freq'] = noteTable[currCmd['N']]?noteTable[currCmd['N']]:-1;
        currCmd['length']=parseInt(matches[3]!=''?matches[3]:preCmd['L']);
        currCmd['sec'] = def_sec/currCmd['length']*Math.pow(1.5,currCmd['dotted']);
        break;
        case 'N': 
        currCmd['key']='N';
        currCmd['code']=currCmd['key'];
        currCmd['N']=parseInt(matches[3],10); 
        currCmd['freq'] = noteTable[currCmd['N']]?noteTable[currCmd['N']]:-1;
        currCmd['length']=preCmd['L'];
        currCmd['sec'] = def_sec/currCmd['length']*Math.pow(1.5,currCmd['dotted']);
        break;
        case 'C':;
        case 'D':;
        case 'E':;
        case 'F':;
        case 'G':;
        case 'A':;
        case 'B':;
        let semiCode = '';
        switch(matches[2]){
          case '-':currCmd['semi']=-1;semiCode='-';break;
          case '+':;
          case '#':currCmd['semi']=1;semiCode='+';break;
          default:currCmd['semi']=0;break;
        }
        currCmd['key']=matches[1];
        currCmd['code']=currCmd['key']+(semiCode)+currCmd['O']
        currCmd['N'] = this.codeToN(currCmd['semi'],currCmd['key'],currCmd['O']);
        currCmd['freq'] = noteTable[currCmd['N']]?noteTable[currCmd['N']]:-1;
        currCmd['length']=parseInt(matches[3]!=''?matches[3]:preCmd['L']);
        currCmd['sec'] = def_sec/currCmd['length']*Math.pow(1.5,currCmd['dotted']);
        break;
      }
      // console.log(currCmd);
      return currCmd;
    }
    play(){
      console.log(this.codeCmds);
      console.log('player',this.name,'start play');
      this.endedMml = "";
      let pointer = 0;
      let codeCmds = this.codeCmds;
      this.playPointer(0);
    }
    stop(){
      if(this.tm) clearTimeout(this.tm);
    }
    clear(){
      this.playCmds = null;
      this.mml = "";
      this.tm = null;
    }
    playPointer(pointer){
      if(!this.codeCmds ||  this.codeCmds.length <= pointer){
        return false;
      }
      let cmd = this.codeCmds[pointer];
      if(!cmd){
        console.log('player',this.name,'end play');
        return 
      }
      this.endedMml+=cmd.org;
      // console.log(cmd);
      while(this.codeCmds.length > pointer && cmd['sec']<=0){
        // console.log(cmd);
        console.log('player',this.name,cmd);
        pointer++; //다음
        cmd = this.codeCmds[pointer];
        if(!cmd){
          console.log('player',this.name,'end play');
          return 
        }
        this.endedMml+=cmd.org;
      }

      if(cmd.freq!=-1){
        console.log('player',this.name,cmd);
        this.playTone(cmd.freq, this.wave, {
          attack:parseFloat(0),
          decay:parseFloat(0),
          sustain:parseFloat(cmd['sec']*0.9),
          release:parseFloat(cmd['sec']*0.1),
        },cmd.V/15);
      }else{
        // 재생 쉼표
        console.log('player',this.name,'rest',cmd);
      }
      pointer++;
      let thisC = this;
      this.tm = setTimeout(function(){
        thisC.playPointer(pointer)
      },parseFloat((cmd['sec']))*1000)
    }
    playTone(freq,wave,envelope,volume){
      webKeyboard.playTone(freq,wave,envelope,volume);
    }
  };

  return MmlPlayer;
})();