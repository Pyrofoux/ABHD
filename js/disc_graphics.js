
function getPixels(img)
{
  return img.drawingContext.getImageData(0,0,img.width,img.height);
}

function getColorIndices(x, y, imageData, format = false)
{
  const redByte = y * (imageData.width * 4) + x * 4;
  var cols =  [imageData.data[redByte], imageData.data[redByte + 1], imageData.data[redByte + 2], imageData.data[redByte + 3]];
  if(!format) return cols;
  return `${cols[0]}-${cols[1]}-${cols[2]}-${cols[3]}`;
};


function countColors(imgData) // count colors in a pixel array
{
  let set = {};
  for(var y = 0; y < imgData.height; y++)
  {
  for(var x = 0; x < imgData.width; x++)
  {
    let cols = getColorIndices(x,y,imgData);
    let col = `${cols[0]}-${cols[1]}-${cols[2]}-${cols[3]}`
    if(set[col])
    {
      set[col]++
    }
    else
    {
      set[col] = 1;
    }
  }
  }
  // process to filter in between pixels that exist because of scaling
  // the number 100 was choosen by checking the numbers and knowing its adapted to our context
  Object.keys(set).forEach(color => set[color] < 100 ? delete set[color] : true);

  return set;
}


  
function getClosestColor(c_rgba, palette)
{

    var colorName = `${c_rgba[0]}-${c_rgba[1]}-${c_rgba[2]}-${c_rgba[3]}`;
    if(colorName in palette) return colorName;

    var distances = [];
    var minimal_distance = -1;
    var closest_color = false;
    for(var name in palette)
    {
        var p_rgba = name.split("-");
        var distance = 0;
        for(var i = 0; i < 4; i++)
        {
            distance += abs(p_rgba[i]-c_rgba[i]);
            if(minimal_distance == -1 || distance < minimal_distance)
            {
                minimal_distance = distance;
                closest_color    = name; 
            }
        }
    }
    return closest_color;
}

let colored_regions = {};
function colorCell(cell = 0, col = color("red"), disc = "A", scale = 3)
{
  var center = cell_centers[cell];
  if(!center) return false;
  var id = `${disc}_cell_${cell}_color_region`;
  var cache = colored_regions[id];
  var region;
  if(cache) // thanks to caching, it spends 100ms for the first draw and almost none afterwards
  {
    region = cache;
  }
  else
  {
    region = coloredRegion({
      center_x: center.x, center_y:center.y,
      width:700, height:700, // searched these values manually
      disc, cell
    });
    colored_regions[id] = region;
  }

  disc_cvs.push();
  disc_cvs.tint(col);
  // scale is *2 for width / height, idk why but I think t has to do with the p5js canvas
  disc_cvs.image(region, region._start_x/scale, region._start_y/scale, region._width/scale*2, region._height/scale*2);
  disc_cvs.pop();
}

function colorSymbol(cell, symbol, col = color("red"), scale = 3, disc= "A")
{
  var points = cell2symbol[cell];
  var center = null;
  for(var i in points)
  {
    if(points[i].symbol == symbol) center = points[i];
  }


  if(!center) return false;
  var id = `${disc}_cell_${cell}_symbol_${symbol}_color_region`;
  var cache = colored_regions[id];
  var region;
  if(cache) // thanks to caching, it spends 100ms for the first draw and almost none afterwards
  {
    region = cache;
  }
  else
  {
    region = coloredRegion({
      center_x: center.x, center_y:center.y,
      width:250, height:250, // searched these values manually
      disc,
      cell,
      symbol, // check error here
      lines:true,
    });
    colored_regions[id] = region;
  }

  disc_cvs.push();
  disc_cvs.tint(col);
  // scale is *2 for width / height, idk why but I think t has to do with the p5js canvas
  disc_cvs.image(region, region._start_x/scale, region._start_y/scale, region._width/scale*2, region._height/scale*2);
  disc_cvs.pop();
}

function coloredRegion(opt)
{
  //symbol = null, cell = null, lines = false , start_x = 0, start_y = 0, end_x = null, end_y = null
  var
  center_x = opt.center_x ?? 0,
  center_y = opt.center_y ?? 0,
  width = opt.width ?? imgs.A_width, // would have to change for B
  height = opt.height ?? imgs.A_height,
  disc = opt.disc ?? "A",
  symbol = opt.symbol ?? null,
  cell = opt.cell ?? null,
  lines = opt.lines ?? null;

  var disc_width = imgs[`${disc}_disc`].width;
  var disc_height = imgs[`${disc}_disc`].height;
  
  var start_x = constrain(center_x-width/2, 0, disc_width);
  var start_y = constrain(center_y-height/2, 0, disc_height);
  var end_x = constrain(center_x+width/2, 0, disc_width);
  var end_y = constrain(center_y+height/2, 0, disc_height);

  width  = end_x - start_x;
  height = end_y - start_y; 

  var crop = (img) => img.drawingContext.getImageData(start_x, start_y, width, height);

  var cellImg   = cell != null ?  crop(imgs[`${disc}_cells`]) : null,
      symbolImg = symbol != null ?  crop(imgs[`${disc}_symbols`]) : null,
      discImg = crop(imgs[`${disc}_disc`]);



  var outputImg = new ImageData(width, height);
  var outputData = outputImg.data;

  for(var y = 0; y < height; y++)
  {
  for(var x = 0; x < width; x++)
  {
    var cellColor = cell >= 0 ? getColorIndices(x,y,cellImg,true) : null;
    var symbolColor = symbol ? getColorIndices(x,y,symbolImg,true) : null;
    var linesColor = lines ? getColorIndices(x,y,discImg,true) : lines;

    if(cell != null && color2cell[disc][cellColor] != cell) continue;
    if(symbol != null && color2symbol[symbolColor] != symbol) continue;
    if(lines != null && linesColor == "0-0-0-0") continue;
    var i = y*width*4+x*4;
    // set up as white cause can be easily teinted/transparented later
    outputData[i]   = 255;
    outputData[i+1] = 255;
    outputData[i+2] = 255;
    outputData[i+3] = 255;
  }
  }
  var finalImg = new ImageData(outputData, width, height);
  var cvs = createGraphics(width, height);
  cvs.drawingContext.putImageData(finalImg, 0, 0);
  cvs._start_x = start_x;
  cvs._start_y = start_y;
  cvs._width = width;
  cvs._height = height;
  return cvs;
}


function coordToSymbols(x, y, disc = "A")
{
    var cell_color = getClosestColor(getColorIndices(x,y,pixels[disc+"_cells"]), palettes[disc+"_cells"]);
    var symbol_color = getClosestColor(getColorIndices(x,y,pixels[disc+"_symbols"]), palettes[disc+"_symbols"]);
    
    var cell = color2cell[disc][cell_color] ?? -1;
    var symbol = color2symbol[symbol_color];

    return {cell, symbol, cell_color, symbol_color};
}

///// Used when labeling data -- remove "ForLabeling" in function name
function mouseClickedForLabeling()
{
  var x = Math.floor(mouseX*scaling),
  y = Math.floor(mouseY*scaling);
  var semantic = coordToSymbols(x,y)

  console.log(semantic, x, y);

  // display debug info on screen
  //info.elt.innerHTML = JSON.stringify(semantic);

  // manually label symbols
  /* colors.push(semantic.symbol_color);
  var str = symbols_list.map((symbol, index) => `"${symbol}":${colors[index] ? colors[index] : ""},`).join("<br/>");
  info.elt.innerHTML = str; */

  //manually label cells
  //info.elt.innerHTML += `<br/>"${semantic.cell_color}":${tick("count")-1},`;

  //manually label positions
  /* if(mouseButton === LEFT)
  {
    cells[cell_id].push({x,y,symbol:semantic.symbol})
    info.elt.innerHTML += JSON.stringify({x,y,symbol:semantic.symbol,cell:cell_id})
  }
  else // warning: is never reached, condition needs to be double checked for P5
  {
    cell_id++;
    cells[cell_id] = [];
  } */
}