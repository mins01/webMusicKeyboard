'use strict';
// 공대여자는 예쁘다.
const webKeyboard = (function(){
	let audioCtx=null;
	let gainNode=null;
	let isDown=false;
	window.oscillators={};
	let localGains={};
	let stopEvent=function(event){
		event.stopPropagation();
		event.preventDefault();
		// return false;
	}
	let filterScroll=function(event){
		if(isDown){
			stopEvent(event)
			return false;
		}
		let target = event.target;
		console.log(event.type,event);

		if(target.classList.contains('kb-key')){
			stopEvent(event)
			return false;
		}
	}
	let moveKey=function(event){
		// console.log(event.type);
		if(!isDown){
			return;
		}
		let target = document.elementFromPoint(event.clientX, event.clientY); //touchmove인 경우 target 변경 안된다.
		if(!target){
			return
		}
		if(target.classList.contains('on')){
			return;
		}
		if(!target.classList.contains('kb-key')){
			return;
		}
		try{
			stopEvent(event)
		}catch(e){
			console.log(e);
		}
		playKey(target);		
		return false;
	}
	let upKey=function(event){
		isDown = false;
		console.log(event.type);
		stopKey(event.target);
	}
	let downKey=function(event){
		isDown = true;
		// console.log(event.type);
		// console.log(event);
		let target = event.target;
		if(!target.classList.contains('kb-key')){
			return;
		}
		try{
			stopEvent(event)
		}catch(e){
			console.log(e);
		}
		playKey(target);		
		return false;
	}
	let playKey = function(node){
		if(node.timerOn){
			clearTimeout(node.timerOn);
		}
		node.timerOn = setTimeout(function(){
			node.classList.remove('on');
		},1000)
		node.classList.add('on');
		let code = node.dataset.key+node.dataset.half+node.dataset.tone;
		node.osc = playTone(code,webKeyboard.wave,webKeyboard.sustain);
	}
	let stopKey = function(node){
		if(node.timerOn){
			clearTimeout(node.timerOn);
		}
		node.timerOn = setTimeout(function(){
			node.classList.remove('on');
		},500)

		let code = node.dataset.key+node.dataset.half+node.dataset.tone;
		// stopTone(code,0.5);
		if(node.osc){
			stopOsc(node.osc,webKeyboard.sustain/10);
		}
	}
	let eventOption = {
		capture: false,
		once: false,
		passive: false
	}
	let initEvent = function(){
		// document.addEventListener('mousedown',downKey,eventOption);
		// document.addEventListener('touchstart',downKey,eventOption)
		document.addEventListener('pointerdown',downKey,eventOption);
		document.addEventListener('pointerup',upKey,eventOption);
		document.addEventListener('pointermove',moveKey,eventOption);
		document.querySelector('.keyboard').addEventListener('scroll',filterScroll,eventOption);
		// document.addEventListener('touchmove',moveKey,eventOption);
		
	}
	
	let startAudio = function(off){
		if(!audioCtx){
			audioCtx = new AudioContext({
				latencyHint: 'interactive',
				sampleRate: 44100,
			});
			gainNode = audioCtx.createGain()
			// gainNode.gain.value = 0.5 // 50 %
			gainNode.gain.value = webKeyboard.volume;

			gainNode.connect(audioCtx.destination);
			console.log('startAudio');
		}else{
			if(off){
				gainNode.disconnect();
				gainNode = null
				audioCtx.suspend();
				audioCtx = null;
				return
			}
		}
	}
	let setGainValue = function(v){
		webKeyboard.volume = parseFloat(v)
		if(!gainNode){return 0.5;}
		gainNode.gain.value = webKeyboard.volume;
		return webKeyboard.volume;
	}
	let setWave = function(wave){
		if(!audioCtx){return;}
		switch(wave){
			case 'sine':;
			case 'square':;
			case 'sawtooth':;
			case 'triangle':;
				webKeyboard.wave = wave
			break;
			default:
				if(webKeyboard.waveTables[wave]){
					webKeyboard.wave = audioCtx.createPeriodicWave(webKeyboard.waveTables[wave].real, webKeyboard.waveTables[wave].imag, {disableNormalization: true});
				}else{
					console.error("not exists this.waveTables[type]",type);
					return;
				}
			break;
		}
		
	}
	let stopOsc = function(osc,sec){
		if(!audioCtx){
			console.warn("start audio?");
			return
		}
		if(osc.timmer){clearTimeout(osc.timmer)}
		// osc.localGain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + sec)
		osc.stop(audioCtx.currentTime + sec)
		osc.localGain.disconnect();
		osc.disconnect();
		delete osc.localGain;
		console.log('stopTone',osc.frequency.value,sec);
	}
	let playTone = function(code,wave,sec) {
		if(!audioCtx){
			console.warn("start audio?");
			return
		}
		let osc , localGain;
		localGain = audioCtx.createGain();
		localGain.connect(gainNode);		
		osc = audioCtx.createOscillator();
		osc.connect(localGain);
		// console.log(osc);
		let freq = webKeyboard.codeTable[code];
		if(!freq){ return; }
		
		if(typeof wave =='string'){
			osc.type = wave;
		}else{
			osc.setPeriodicWave(wave);
		}
		osc.frequency.value = freq;
		osc.localGain = localGain;
		osc.code = code;
		localGain.gain.value = 1;
		osc.start();
		

		osc.timmer = setTimeout(() => {
			stopOsc(osc,sec);
		}, sec*1000);
		localGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + sec)
		osc.stop(audioCtx.currentTime + sec);
		console.log('playTone',code,osc.frequency.value,osc.type,audioCtx.currentTime + sec);
		return osc;
	}

	let webKeyboard = {
		codeTable:[],
		waveTables:[],
		volume:0.5,
		sustain:3,
		wave:'square',
		init:function(){
			
			console.log("init");
			initEvent();
		},
		playTone:playTone,
		startAudio:startAudio,
		setGainValue:setGainValue,
		setWave:setWave,
	}
	return webKeyboard;
})();