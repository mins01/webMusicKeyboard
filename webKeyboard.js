'use strict';
// 공대여자는 예쁘다.
const webKeyboard = (function(){
	let audioCtx=null;
	let gainNode=null;
	let isDown=false;
	window.oscillators={};
	let localGains={};
	let pointers_target={};
	let stopEvent=function(event){
		event.stopPropagation();
		event.preventDefault();
	}
	let moveKey=function(event){
		// console.log(event);
		if(!isDown){
			return;
		}
		let target = document.elementFromPoint(event.clientX, event.clientY); //touchmove인 경우 target 변경 안된다.
		if(!target || !target.classList.contains('kb-key')){
			if(pointers_target[event.pointerId]) stopKey(pointers_target[event.pointerId]);
			return
		}
		
		try{
			stopEvent(event)
		}catch(e){
			console.log(e);
		}
		// console.log(event);

		if(pointers_target[event.pointerId] === target) return;
		if(pointers_target[event.pointerId]) stopKey(pointers_target[event.pointerId]);
		if(target){
			pointers_target[event.pointerId] = target;
			playKey(target);		
		}else{
			console.log('out');
		}
		return false;
	}
	let upKey=function(event){
		isDown = false;
		let target = document.elementFromPoint(event.clientX, event.clientY); //touchmove인 경우 target 변경 안된다.

		console.log(event.type);
		if(target) stopKey(target);
		if(event.target) stopKey(event.target);
		if(pointers_target[event.pointerId]) stopKey(pointers_target[event.pointerId]);
		delete pointers_target[event.pointerId];
	}
	let downKey=function(event){
		isDown = true;
		// console.log(event.type);
		let target = event.target;
		if(!target.classList.contains('kb-key')){
			return;
		}
		try{
			stopEvent(event)
		}catch(e){
			console.log(e);
		}
		pointers_target[event.pointerId] = target;
		playKey(target);
		
		return false;
	}
	let playKey = function(node){
		if(node.timerOn){
			clearTimeout(node.timerOn);
		}
		// node.timerOn = setTimeout(function(){
		// 	node.classList.remove('on');
		// },500)
		node.classList.add('on');
		let code = node.dataset.key+node.dataset.half+node.dataset.tone;
		let idx = node.dataset.idx;
		// node.osc = playTone(code,webKeyboard.wave,{...webKeyboard.envelope});
		node.osc = playToneIdx(idx,webKeyboard.wave,{...webKeyboard.envelope});
	}
	let stopKey = function(node){
		if(!node.classList.contains('kb-key')){
			return;
		}
		if(!!node.timerOn){
			clearTimeout(node.timerOn);
		}
		node.timerOn = setTimeout(function(){
			node.classList.remove('on');
		},500)

		let code = node.dataset.key+node.dataset.half+node.dataset.tone;
		// stopTone(code,0.5);
		if(node.osc){
			stopOsc(node.osc,node.osc.envelope.release); //사람의 반응속도를 300ms 라고 가정
			delete node.osc
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
		// document.querySelector('.keyboard').addEventListener('scroll',filterScroll,eventOption);
		// document.addEventListener('touchmove',moveKey,eventOption);
		
	}
	
	let startAudio = function(off){
		if(!audioCtx){
			let AudioContext = window.AudioContext || window.webkitAudioContext;
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
	let envelopeCtrl = {
		adsr:function(osc,attack_sec,decay_sec,sustain_sec,release_sec,volume){
			// console.log('adsr',attack_sec,decay_sec,sustain_sec,release_sec);
			this.attack(osc,attack_sec,volume);
			osc.timer_decay = setTimeout(()=>{
				this.decay(osc,decay_sec,volume)
			},attack_sec*1000);
			if(sustain_sec == -1){
				// 계속 유지
			}else{
				osc.timer_sustain = setTimeout(()=>{
					this.sustain(osc,sustain_sec,release_sec,volume);
				},(attack_sec+decay_sec)*1000);
			}
		},
		attack:function(osc,sec,volume){
			osc.envelope_status = 'attack';
			// console.log('adsr-attck',audioCtx.currentTime,sec,osc.localGain.gain.value);
			osc.localGain.gain.cancelScheduledValues(audioCtx.currentTime);
			if(sec==0){
				osc.localGain.gain.value = 1*volume;
			}else{
				osc.localGain.gain.value = 0;
				// let waveArray = new Float32Array([0.5,0.7,0.8,0.85,0.9,0.92,0.94,0.96,0.98,1]);
				// osc.localGain.gain.setValueCurveAtTime(waveArray, audioCtx.currentTime, sec);
				osc.localGain.gain.setTargetAtTime(1, audioCtx.currentTime + sec, 0.1);
			}
			
			// osc.localGain.gain.setTargetAtTime(1, audioCtx.currentTime + sec, 10);
			// osc.localGain.gain.exponentialRampToValueAtTime(1, audioCtx.currentTime + sec)
		},
		decay:function(osc,sec,volume){
			if(osc.envelope_status!='attack'){return}
			osc.envelope_status = 'decay';
			// console.log('adsr-decay',audioCtx.currentTime, sec,osc.localGain.gain.value);
			osc.localGain.gain.cancelScheduledValues(audioCtx.currentTime);
			if(sec==0){
				osc.localGain.gain.value = 0.8*volume;
			}else{
				osc.localGain.gain.setTargetAtTime(0.8, audioCtx.currentTime + sec, 0.001);
			}
			
		},
		sustain:function(osc,sec,release_sec,volume){
			osc.envelope_status = 'sustain';
			// console.log('adsr-sustain',audioCtx.currentTime,sec,release_sec,osc.localGain.gain.value);
			osc.localGain.gain.value = 0.8*volume;
			osc.timer_release = setTimeout(()=>{
				this.release(osc,release_sec)
			},sec*1000+1);
		},
		release:function(osc,sec){
			osc.envelope_status = 'release';
			if(osc.timer_decay){clearTimeout(osc.timer_decay);}
			if(osc.timer_sustain){clearTimeout(osc.timer_sustain);}
			if(osc.timer_release){clearTimeout(osc.timer_release);}
			if(!osc.localGain){return}
			// console.log('adsr-release',sec,osc.localGain.gain.value);
			osc.localGain.gain.cancelScheduledValues(audioCtx.currentTime);
			if(sec==0){
				osc.localGain.gain.value = 0;
				osc.stop();
			}else{
				osc.localGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + sec)
				// osc.localGain.gain.setTargetAtTime(0, audioCtx.currentTime + sec, 0.001);
				osc.stop(audioCtx.currentTime + sec)
			}
		},
	}
	let stopOsc = function(osc,sec){
		if(!audioCtx){
			console.warn("start audio?");
			return
		}
		if(osc.timmer){clearTimeout(osc.timmer)}
		envelopeCtrl.release(osc,sec);
		console.log('stopTone',osc.frequency.value,sec);
	}
	let playToneIdx = function(idx,wave,envelope,volume){
		let freq = webKeyboard.noteTable[idx];
		if(isNaN(freq)){return;}
		return playTone(freq,wave,envelope,volume);
	}
	let playToneCode = function(code,wave,envelope,volume){
		let freq = webKeyboard.codeTable[code];
		if(isNaN(freq)){return;}
		return playTone(freq,wave,envelope,volume);
	}
	let playTone = function(freq,wave,envelope,volume) {
		if(!audioCtx){
			console.warn("start audio?");
			return
		}
		if(volume===undefined){
			volume = 1;
		}
		let localGain = audioCtx.createGain();
		localGain.connect(gainNode);		
		let osc = audioCtx.createOscillator();
		osc.connect(localGain);
		
		if(typeof wave =='string'){
			osc.type = wave;
		}else{
			osc.setPeriodicWave(wave);
		}
		osc.frequency.value = freq;
		osc.localGain = localGain;
		osc.envelope = envelope;
		
		localGain.gain.value = 0;

		osc.onended = function(event){
			// console.log('onended');
			let osc = this
			if(osc.localGain){
				osc.localGain.disconnect();
				delete osc.localGain;
			}
			osc.disconnect();
			osc = null;
		}
		envelopeCtrl.adsr(osc,envelope.attack,envelope.decay,envelope.sustain,envelope.release,volume);
		osc.start();
		console.log('playTone',audioCtx.currentTime,osc.frequency.value,osc.type,volume);
		return osc;
	}

	let webKeyboard = {
		codeTable:null,
		noteTable:null,
		waveTables:null,
		volume:0.5,
		envelope:{
			attack:0.01,
			decay:0.01,
			sustain:1, // sec!
			release:0.5,
		},
		wave:'square',
		init:function(){
			console.log("init");
			initEvent();
		},
		playTone:playTone,
		playToneIdx:playToneIdx,
		playToneCode:playToneCode,
		startAudio:startAudio,
		setGainValue:setGainValue,
		setWave:setWave,
	}
	return webKeyboard;
})();