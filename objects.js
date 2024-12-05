
function makeBlock(cx,cy,val)
  {
    var spr = new blocks.Sprite();
    spr.x = (cx+0.5)*(b_unit);
    spr.y = (cy+0.5)*(b_unit);
    spr.cy = cy;
    spr.cx = cx;

    spr.w = b_unit-b_margin;
    spr.h = b_unit-b_margin;
    spr.val = val || 0;
    spr.text = spr.val;
    spr.textSize = 24;
    spr.textColor = "white";
    spr.collider = "dynamic";
    spr.textStroke = background_color;
    spr.textStrokeWeight = 4;

    spr.bounciness = 0;

    spr.addValue = (delta) =>
    {
      spr.val += delta;
      spr.text = spr.val;
      if(spr.val <= 0)
      {
        spr.remove();
      }
      else
      {
        spr.setColor();
      }  
    }
    
    spr.setColor = () =>{
      // logarithmic scale in base 2
      var log_val = max(min(int(Math.log2(spr.val))-1, block_colors.length-1),0);
      spr.color = block_colors[log_val];
    }

    spr.setWholeAlpha = (a) =>{
      spr.color.setAlpha(a);
      spr.textColor.setAlpha(a);
      spr.textStroke.setAlpha(a);
    }

    spr.update = () =>
    {
      // make sure the sprite is static, even with collider = dynamic
      // was an attempt to avoid using .overlaps, hoping .collides
      // would provide less collision bugs, but honestly I'm not sure
      // if it changes anything. can most probably be deleted
      spr.rotationSpeed = 0;
      spr.x = (spr.cx+0.5)*(b_unit);
      spr.y = (spr.cy+0.5)*(b_unit);
      spr.vel.x = 0;
      spr.vel.y = 0;
      spr.rotation = 0;

        if(spr.cy == map_width-2) // blinking indicator on the last line
        {
            var t = tick("blinking_blocks")*1.5;
            var a = abs(cos(t))*255;
            spr.color.setAlpha(a);
        }
        
    }

    spr.setColor();
    return spr;
  }

function makeBonus(cx,cy)
{
  var spr = new bonus.Sprite();
  spr.cx = cx;
  spr.cy = cy;
  spr.x = (cx+0.5)*(b_unit);
  spr.y = (cy+0.5)*(b_unit);
  spr.diameter = b_unit-b_margin*2
  spr.collider = "dynamic";
  spr.color = "white";

  spr.draw = ()=>
      {
        noStroke();
        fill(spr.color)
        circle(0, 0, 14)
        noFill();
        strokeWeight(2);
        stroke(spr.color);
        circle(0, 0, spr.radius);
      }

  spr.collect = ()=>
  {
    extra_balls++;
    spr.remove();
    combo = combo+3
    playSoundScale(combo, "collect");
  }
}

function makeBall(x, isExtra=false)
  {
    var spr = new balls.Sprite();
    spr.color = "white";
    spr.diameter = ball_diameter;
    spr.collider = "kinematic";
    spr.y = map_width*b_unit - spr.radius; // start at the bottom
    spr.x = x || map_width*b_unit/2; // not specified: start in the middle
    spr.isExtra = isExtra || false;
    spr.bounciness = 0;

    spr.isStopped = () => abs(spr.vel.x)+abs(spr.vel.y) == 0;

    spr.bounce = (block)=>
    {
      var side = closestEdge(spr, block);

      switch(side)
      {
        case 0: // left
          spr.vel.x = abs(spr.vel.x);
        break;

        case 1: // right
          spr.vel.x = -abs(spr.vel.x);
        break;

        case 2: // bottom
          spr.vel.y = -abs(spr.vel.y);
        break;

        case 3: // top
          spr.vel.y = abs(spr.vel.y);
        break;
      }

      if(side == 0 || side == 1) spr.vel.x *= -1;
      if(side == 2 || side == 3) spr.vel.y *= -1;
      spr.x += spr.vel.x;
      spr.y += spr.vel.y;
    }
    
    spr.bounceBorderCheck = ()=>{
      var borderBounced = false;
      var bottomBounced = false;
      // left,top and right border
      spr.x = max(spr.radius, min(map_width*b_unit - spr.radius, spr.x));
      spr.y = max(spr.radius, min(map_width*b_unit - spr.radius, spr.y));

      if(spr.x - spr.radius <= 0 || spr.x + spr.radius >= map_width*b_unit)
      {
        spr.vel.x *=-1;
        borderBounced = true;
      }
      if(spr.y - spr.radius <= 0)
      {
        spr.vel.y *=-1;
        borderBounced = true;
      }
      
      if(spr.y + spr.radius >= map_width*b_unit && !spr.isStopped()) // bottom border check
        {
          spr.vel.x = 0; // stop ball
          spr.vel.y = 0; 
          spr.y = map_width*b_unit - spr.radius; // stick them to the bottom border
          if(spr.visible)
          {
            moving_balls--;
          }
          newTurnCheck();
          bottomBounced = true;
          
        }

     
     if(bottomBounced)
     {
        combo = combo-1;
        if(moving_balls <= 0) combo = 0;
        playSoundScale(combo, "bottom");
     }
     else if(borderBounced)
     {
        if(!spr.isStopped())
        {
          combo = combo+1;
          playSoundScale(combo, "border");
        }
     }
    }
    
    
    spr.throw = (wait_before)=>
    {
      spr.future_direction = spr.future_direction || spr.angleTo(mouse);
      spr.wait = wait_before;
      if(wait_before > 0)
      {
        spr.visible = false;
      }
      else
      {
        spr.visible = true;
        spr.direction = spr.future_direction;
        spr.future_direction = false;
	      spr.speed = ball_speed * ball_speed_mutiplier;
      }
    }
    
    spr.update = () =>
    {
      if(spr.visible == true)
      {
        spr.bounceBorderCheck();
      }
      else if(spr.wait <= 0)
      {
        spr.throw(0);
      }
      else
      {
        spr.wait -= 1;
      }
    }
    
    return spr;
}
