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
      this.playCmds = null;
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
      let cmds = mml.match(/([\<\>A-Za-z][\+#\-]{0,1}\d{0,4})/g);
      // console.log(cmds);
      this.load(cmds);
    }
    load(cmds){
      let defCmd = {
        'org':'',
        'N':-1,
        'semi':0,
        'key':'',
        // 'octave':4,
        'code':'',//key+semi+O
        'freq':0, //key+semi+O
        'length':-1,
        'sec':0,
        'T':120,
        'V':8,
        'O':4,
        'L':4,
      };
      let codeCmds = new Array(cmds.length)
      let preCmd = defCmd;
      for(let i=0,m=cmds.length;i<m;i++){
        codeCmds[i] = this.convertCmd(cmds[i],preCmd);
        preCmd = codeCmds[i];
      }
      // console.log(codeCmds);
      this.codeCmds = codeCmds;
    }
    convertCmd(cmd,preCmd){
      cmd = cmd.toUpperCase();
      let arg1 = cmd.replace(/[^<>TVOLNCDEFGABR]/,'');
      if(arg1.length==0){return false;}
      // let matches = cmd.trim().match(/[0-9]{1,4}$/g);
      let matches = cmd.match(/([<>A-Z])([\+#-]{0,1})(\d{0,4})/);
      // console.log(cmd,matches);
      let currCmd = { ...preCmd };
      currCmd['org'] = matches[0];
      currCmd['semi'] = 0;
      currCmd['length'] = -1;
      currCmd['freq'] = -1;
      currCmd['sec'] = -1;
      currCmd['code']='';
      let def_sec = 60/currCmd['T'] //4분음표의 연주 길이
      switch(matches[1]){
        case 'T': currCmd['T']=parseInt(matches[3],10); break;
        case 'V': currCmd['V']=parseInt(matches[3],10); break;
        case 'O': currCmd['O']=parseInt(matches[3],10); break;
        case 'L': currCmd['L']=parseInt(matches[3],10); break;
        case 'N': currCmd['T']=parseInt(matches[3],10); break;
        case '<': currCmd['O']=Math.max(0,currCmd['O']-1); break;
        case '>': currCmd['O']=Math.min(8,currCmd['O']+1); break;
        case 'R':;
        currCmd['key']=matches[1];
        currCmd['code']=currCmd['key']+currCmd['O']
        currCmd['N']=-1;
        currCmd['freq'] = noteTable[currCmd['N']]?noteTable[currCmd['N']]:-1;
        currCmd['length']=parseInt(matches[3]!=''?matches[3]:preCmd['L']);
          switch(currCmd['length']){
            case 0: currCmd['sec'] = def_sec/8; break;
            case 1: currCmd['sec'] = def_sec/4; break;
            case 2: currCmd['sec'] = def_sec/4*1.5; break; //dotted
            case 3: currCmd['sec'] = def_sec/2; break;
            case 4: currCmd['sec'] = def_sec/2*1.5; break;  //dotted
            case 5: currCmd['sec'] = def_sec; break;
            case 6: currCmd['sec'] = def_sec*1.5; break;  //dotted
            case 7: currCmd['sec'] = def_sec*2; break;
            case 8: currCmd['sec'] = def_sec*2*1.5; break;  //dotted
            case 9: currCmd['sec'] = def_sec*4; break;
          }
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
        currCmd['code']=(semiCode)+currCmd['key']+currCmd['O']
        currCmd['N'] = this.codeToN(currCmd['semi'],currCmd['key'],currCmd['O']);
        currCmd['freq'] = noteTable[currCmd['N']]?noteTable[currCmd['N']]:-1;
        currCmd['length']=parseInt(matches[3]!=''?matches[3]:preCmd['L']);
          switch(currCmd['length']){
            case 0: currCmd['sec'] = def_sec/8; break;
            case 1: currCmd['sec'] = def_sec/4; break;
            case 2: currCmd['sec'] = def_sec/4*1.5; break; //dotted
            case 3: currCmd['sec'] = def_sec/2; break;
            case 4: currCmd['sec'] = def_sec/2*1.5; break;  //dotted
            case 5: currCmd['sec'] = def_sec; break;
            case 6: currCmd['sec'] = def_sec*1.5; break;  //dotted
            case 7: currCmd['sec'] = def_sec*2; break;
            case 8: currCmd['sec'] = def_sec*2*1.5; break;  //dotted
            case 9: currCmd['sec'] = def_sec*4; break;
          }
        break;
      }
      // console.log(currCmd);
      return currCmd;
    }
    play(){
      console.log(this.codeCmds);
      console.log('재생');
      let pointer = 0;
      let codeCmds = this.codeCmds;
      this.playPointer(0);
    }
    playPointer(pointer){
      if(this.codeCmds.length <= pointer){
        return false;
      }
      let cmd = this.codeCmds[pointer];
      // console.log(cmd);
      while(this.codeCmds.length > pointer && cmd['sec']==-1){
        console.log(cmd);
        pointer++; //다음
        cmd = this.codeCmds[pointer];
      }
      if(!this.codeCmds[pointer]){
        console.log('END');
        return 
      }
      cmd = this.codeCmds[pointer];
      // 재생 쉼표
      console.log(cmd);
      if(cmd.freq!=-1){
        this.playTone(cmd.freq, 'square', {
          attack:parseFloat(0),
          decay:parseFloat(0),
          sustain:parseFloat(cmd['sec']*0.7),
          release:parseFloat(cmd['sec']*0.3),
        });        
      }else{
        console.log('쉼',((cmd['sec']))*1000);
      }
      pointer++;
      let thisC = this;
      setTimeout(function(){
        thisC.playPointer(pointer)
      },parseFloat((cmd['sec']))*1000)
    }
    playTone(code,wave,envelope){
      webKeyboard.playTone(code,wave,envelope);      
    }
  };

  return MmlPlayer;
})();