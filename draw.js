function draw() { // game drawing loop, except displaying p5play's sprites
	background(background_color);
    
  // fade in game objects
  var a = min(255,tick("game_start_fade")*4);
  if(a<255)setAllAlpha(a);
  drawLevelNumber();
  
  if(game_state == "aiming")
    {
      drawAimingLine();
      if(extra_balls > 0) 
      {
        drawAnnotation();
      }
      noStroke(); // so blocks have no stroke
      drawGameOverOut();
    }

  else if(game_state == "game_over")
  {
    drawGameOverIn();
  }
}

function drawAimingLine()
{
  // draw aiming line
  push();
  stroke("white");
  strokeWeight(3);
  drawingContext.setLineDash([5,8]);
  line(balls[0].x, balls[0].y, mouse.x, mouse.y);
  fill(background_color);
  drawingContext.setLineDash([]);
  circle(mouse.x, mouse.y, ball_diameter);
  pop();
}

function drawAnnotation()
{
    fill("white");
    textSize(16);
    textStyle("bold");
    text("×"+(extra_balls+1), mouse.x + ball_diameter*1.5, mouse.y+ ball_diameter/2);
    noFill();
    stroke("white")
    strokeWeight(2);
}

function drawLevelNumber()
{
  var level_flash = max(255 - tick("level_flash")*4, 0);
  fill(255, 255, 255, level_flash); // could be redone with color.setAlpha but whatever
  textSize(level_text_size);
  textAlign(CENTER);
  text(current_level, map_width*b_unit/2, map_width*b_unit/2 + level_text_size/2);
}

function setAllAlpha(a)
{
  blocks.concat(balls).concat(bonus).forEach(b => {
    b.color.setAlpha(a);
    b.textColor.setAlpha(a);
    if(b.textStroke)b.textStroke.setAlpha(a);
  });
}

function drawGameOverIn()
{
  // fade out game objects
  var a = max(0,255-tick("game_over_fade_in")*4);
  setAllAlpha(a);
  // display current level score
  fill(255, 255, 255, 255); // could be redone with color.setAlpha but whatever
  textSize(level_text_size);
  textAlign(CENTER);
  text(score, map_width*b_unit/2, map_width*b_unit/2 + level_text_size/2);
}


function drawGameOverOut()
{
  var a = max(0,255-tick("game_over_fade_out")*4);
  if(a > 0)
  {
    // display old level score
    fill(255, 255, 255, a); // could be redone with color.setAlpha but whatever
    textSize(level_text_size);
    textAlign(CENTER);
    text(current_level, map_width*b_unit/2, map_width*b_unit/2 + level_text_size/2);
  }
}