
/*
Todo:
weird collision bug
*/

/*
Heavily inspired by Ball Defender (and many similar games)
Played it on United Airlines, on a long London -> Los Angeles flight
Produced by Ensemble Media
*/


// map parameters
let map_width = 9;
let b_unit = 50;
let b_margin = 4;

// progression parameters
let current_level = 1;
let block_spawn_rate = 1/3;
let bonus_spawn_rate = 1/10;

// ball paramaters
let ball_speed = 5;
let ball_diameter = 16;
let extra_balls = 0;
let delta_extra_balls = 8;
let combo = 0;

// visual parameters
let level_text_size = 256; //unit = px
let background_color = "#001219";

// red, orange, yellow, green, blue, violet
// "#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#b25da6"
let block_colors = ["#93c47d","#76a5af","#b25da6","#e06666","#f6b26b","#ffd966","white","dark_grey"]

// sound parameters
var min_sound_f = 0.2; // 0 = maximum low freq, 1 = maximum high freq
var max_sound_f = 0.8;
let scales = 200;


// runtime vars
let game_state = "aiming";
let moving_balls = 0;
let balls, blocks, bonus;
let score = 0;

function setup() {
  textStyle("bold")

  balls = new Group();
  blocks = new Group();
  bonus = new Group();

	new Canvas(map_width*b_unit, map_width*b_unit);
  
  restartGame()

}

function restartGame()
{
  // reset starting variables
  game_state = "aiming"
  current_level = 1;
  block_spawn_rate = 1/3;
  bonus_spawn_rate = 1/10;
  extra_balls = 0;
  tick("game_over_fade_in",0);
  tick("game_over_fade_out",0);
  tick("game_start_fade",0);


  balls.remove();
  blocks.remove();
  bonus.remove();

  balls = new Group();
  blocks = new Group();
  bonus = new Group();

  // create first ball
  balls[0] = makeBall(map_width*b_unit/2,false);


  // create first blocks
  for(var i = 0; i < 3; i++)
  {
    advanceBlocks();
  }
  
  // balls do not collide with one another
  balls.overlaps(balls);
}

function generateBlockline()
{
  var spawn_bonus = -1;
  var guaranteed_bonus = Math.log2(current_level) % 1 === 0 || primes.indexOf(current_level) != -1;

  if(guaranteed_bonus)
  {
    spawn_bonus = int(random(0, map_width));
  }

  for(var x = 0; x < map_width; x++)
  {
    if(random() <= block_spawn_rate && x != spawn_bonus) // fill w blocks
    {
      var upper_bound = max(current_level+2, (current_level**1.5))
      var value = int(random(1,upper_bound));
      value = min(value, 999)
      makeBlock(x,-1, value)
    }
    else if(random() <= bonus_spawn_rate || x == spawn_bonus) // empty cells have a chance to have a bonus
    {
      makeBonus(x, -1);
    }
  }
  game_state = "aiming";
}


function advanceBlocks()
{
  var highest_cy = 0;
  generateBlockline();

  blocks.forEach((block) =>{ // make block descend
    block.y += b_unit;
    block.cy++;
    highest_cy = max(block.cy, highest_cy);
    block.color.setAlpha(255);
    block.textColor.setAlpha(255);
  });

  bonus.forEach((bonus) =>{ // make bonus descend
    bonus.y += b_unit;
    bonus.cy++;
  });

  return highest_cy >= (map_width-1)/*   || highest_cy == 4  */;
}


function newTurnCheck()
{
  if(moving_balls == 0)newTurn();
}

function newTurn()
{
  current_level++;

  block_spawn_rate = lerp(1/3, 8/9, current_level/20);


  var last_line_check = advanceBlocks();
  if(!last_line_check)
  {
    game_state = "aiming";
  }
  else
  {
    game_state = "game_over";
    score = current_level;
  }
  tick("level_flash", 0);
  tick("blinking_blocks", 0);
  combo = 0; // will also reset the sound when the last ball hits the ground
  
}

function mouseReleased()
{
  switch(game_state)
  {
    case "aiming":
      throwAllBalls();
    break;

    case "game_over":
      restartGame();
    break;
  }
}

function throwAllBalls()
{
  game_state = "throwing";

  var start_x = balls[0].x;
  balls.remove();
  balls = new Group(); // have to recreate a new group so overlaps are not broken :/

  for(var i = 0; i < extra_balls+1; i++)
  {
    var extra_ball = makeBall(start_x, i > 0);
    extra_ball.throw(i * delta_extra_balls);
  }
  moving_balls = extra_balls+1;

  balls.collides(blocks, (ball, block) => {
    onBallBlockOverlap(ball, block);
  });

  reinstanciateBonuses() // fix for broken overlaps when new group additions
  balls.overlaps(bonus, (ball, b) => {
    b.collect();
  });

}

function onBallBlockOverlap(ball, block)
{
  ball.bounce(block);
  block.addValue(-1);
  block.vel.x = 0;
  block.vel.y = 0;
  combo++;
  playSoundScale(combo, "overlap")
}

function reinstanciateBonuses() 
{
  var copy = [];
  bonus.forEach(b => copy.push({cx:b.cx, cy:b.cy}));
  bonus.remove();
  bonus = new Group();
  copy.forEach(c => makeBonus(c.cx, c.cy));
}
