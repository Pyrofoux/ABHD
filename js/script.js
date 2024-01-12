
let imgs = [];
let pixels = [];
let palettes = {}
let scaling = 3;

let disc_cvs;
let info, hidden;


const img_names = ["A_disc", "A_cells", "A_symbols"];


let pawns;

function preload()
{
  imgs.A_width = 1883;
  imgs.A_height = 1929;

  img_names.forEach(name => imgs[name] = loadImage(`./img/${name}.png`))
}

// check this for filter / highlight
// https://idmnyu.github.io/p5.js-image/index.html
function setup()
{
  //createCanvas(imgs.A_width/scaling, imgs.A_height/scaling);
  
  disc_cvs = createGraphics(imgs.A_width/scaling, imgs.A_height/scaling);
  new Canvas(imgs.A_width/scaling, imgs.A_height/scaling);
  //new Canvas(100,100);
  background(255);

  img_names.forEach( name =>{
    pixels[name] = getPixels(imgs[name]);
    palettes[name] = countColors(pixels[name]);
    //drawDisc(name);
  });

  //drawDisc("A_disc");
  info = createDiv('== INFO ==');
  info.position(10, 10);

  hidden = createDiv().id("hidden");
  hidden.elt.style.display = "none";

  pawns = new Group();
  pawns.radius = 10;
  pawns.color = "red";

}

function draw()
{
  background("white")
  //drawDisc();
  image(disc_cvs, 0, 0);

  pawns.forEach(pawn=> pawn.direction = pawn.angleTo(100,100));
}

function drawDisc(which = "A_disc", x= 0, y = 0, scale = 3)
{
  var img = imgs[which];
  disc_cvs.image(img, x, y, imgs.A_width/scale, imgs.A_height/scale);
}

function mouseClicked()
{
  var x = Math.floor(mouseX*scaling),
  y = Math.floor(mouseY*scaling);
  var semantic = coordToSymbols(x,y)

  var b = new pawns.Sprite();
  b.x = x/scaling;
  b.y = y/scaling;
  b.radius = 10;
  b.text = semantic.symbol || "";
  b.speed = 7;
  console.log(b);

  console.log(semantic, x, y);
  
}

function mouseMoved() // have to be detected another way
{
  var x = Math.floor(mouseX*scaling),
  y = Math.floor(mouseY*scaling);
  var semantic = coordToSymbols(x,y)

  
  if(semantic.cell > -1)
  {
    disc_cvs.background(255);
    drawDisc("A_disc")
    var c = color("blue")
    c.setAlpha(50);
    colorCell(semantic.cell, c);
    colorSymbol(semantic.cell, semantic.symbol || null, color("red"));

    info.html(`CELL ${semantic.cell}`);
    if(semantic.symbol)
    {
      cursor("pointer");
      info.html("<br/>",true);
      info.html(semantic.symbol,true);
    }
    else
    {
      cursor("default");
    }

  }
}



