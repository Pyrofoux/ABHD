// after CIRCLE/RECTANGLE collision check
function closestEdge(circle, rect) {

  

    var cx = circle.x, cy = circle.y, cr = circle.radius,
        rl = rect.x - rect.w/2, rr = rect.x - rect.w/2;
        rt = rect.y - rect.h/2, rb = rect.y + rect.h/2;
  
      // left, right, top, bottom
    var dists = [rl-cx,cx-rr,cy-rb, rt-cy].map(d => d > 0 ? d : NaN)
    //var dists = [rl-cx-cr,cx+cr-rr,cy+cr-rb, rt-cy-cr].map(d => d > -cr/2 ? d : NaN)
    var min_dist = min(...dists);
    var side = dists.indexOf(min_dist);
    return side; // 0: left, 1: right, 2:top, 3:bottom
  
  }
  
  function triangle_mod(x,n) // 0 1 2 3 2 1 0 1 2 3 2 1 0
  {
    var a = x%(2*n);
    return a > n ? 2*n-a : a
  }


  // play sounds of increasing frequency
  const audioCtx = new AudioContext();
  var gainNode = audioCtx.createGain();

  function playSoundScale(n = 0, log)
  {
    if(log)console.log(log);
    var params =  /* from https://sfxr.me/ */
    {
      "oldParams": true,
      "wave_type": 2, // 2 = square, 1 = sine, 3 = noise
      "p_env_attack": 0,
      "p_env_sustain": 0.1,
      "p_env_punch": 0.37,
      "p_env_decay": 0.1,
      "p_base_freq": 0.2,
      "p_freq_limit": 0,
      "p_freq_ramp": 0,
      "p_freq_dramp": 0,
      "p_vib_strength": 0,
      "p_vib_speed": 0,
      "p_arp_mod": 0,
      "p_arp_speed": 0,
      "p_duty": 0,
      "p_duty_ramp": 0,
      "p_repeat_speed": 0,
      "p_pha_offset": 0,
      "p_pha_ramp": 0,
      "p_lpf_freq": 1,
      "p_lpf_ramp": 0,
      "p_lpf_resonance": 0,
      "p_hpf_freq": 0,
      "p_hpf_ramp": 0,
      "sound_vol": 0.08,
      "sample_rate": 44100,
      "sample_size": 32
    }

    var val = triangle_mod(n,200) // between 0 and 200
    var freq = lerp(min_sound_f, max_sound_f, val/scales);
    freq = Math.round(freq*1000)/1000; // round decimals to avoid noisy artefact
    params.p_base_freq = freq
    
    var a = sfxr.toAudio(params);
    a.play()


    /*
    Tentative to get rid of the weird audio pop/click issue
    when generating sounds and playing them / stopping them before the end of the curve
    a fading out ramp for volume/gain would do the trick but did not manage to make it work in our case

    in the end: toyed with decay and wave type (square) parameters until the click wasn't as audible
    */

    /* var source = sfxr.toWebAudio(params, audioCtx);
    console.log(source)
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    var clipPlayTime = 0;
    var clipLength = source.buffer.duration;
    console.log(clipPlayTime, clipPlayTime + clipLength);

    // start of clip
    // clipPlayTime may be 0 or your scheduled play time
    gainNode.gain.setValueAtTime(0.000, clipPlayTime);
    gainNode.gain.exponentialRampToValueAtTime(1, clipPlayTime+0.01);
    // end of clip

    gainNode.gain.setValueAtTime(1, clipPlayTime + clipLength - 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.5, clipPlayTime + clipLength + 0.3);


    source.start(0) */


    
  }

function scaleDebug()
{
  for(var i = 0; i < 400; i++)
  {
  var f = (i) => () =>playSoundScale(i);
  setTimeout(f(i), 150*i)
  } 
}




  var timers = [];
  function tick(name, reset = -1) // function to easily count ticks
  {
    if(!timers[name])
    {
        timers[name] = 1;
    }
    else
    {
      timers[name]++;
    }

    if(reset != -1)
    {
        timers[name] = reset;
    }

    return timers[name];
  }

  // first thousand primes
  const primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];

