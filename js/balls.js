var context, canvas, search, form, grid;
var circles = [], staticCircles = [], queryCircles = [];
var max_r = 24;
var seconds = 0, fps = 0, frames = 0;
var lastUpdate = 0;
var restitution = 0.75; //1.0001;
var stiffness = 25.0, friction = 2;
var density = 1.0;
var curMouse = Vector.Zero(2), center = Vector.Zero(2);
var lastSeenMouse = 0;
var mouseTimeout = 1500, mouseRadius = 90;
var ending = false;

// helpers
Array.prototype.each = function(fun) {
	if (typeof fun != "function") return;
	for (var i=0; i<this.length; i++) {
		fun(this[i]);
	}
	return this;
}
function dump(e) {
	ret = "[";
	circles.each(function(circle) {
		ret += 'new Circle(' + Math.floor(circle.pos.elements[0]) + ', ' +
				Math.floor(circle.pos.elements[1]) + ', ' + circle.r +
				', "' + circle.fill + '"), ';
	});
	console.log(ret);
}
// end helpers

function init() {
	canvas = document.getElementById("c");
	context = canvas.getContext("2d");
	search = document.getElementById("q");
	form = document.getElementById("query");
	
	window.addEventListener('mousemove', mouseInput, false);
	//canvas.addEventListener('click', dump, false);
	window.addEventListener('resize', resize, false);
	search.addEventListener('keydown', searchChange, false);
	search.focus();
	form.addEventListener('submit', formSubmit, false);
	
	// initial circle setup stolen from https://github.com/robhawkes/google-bouncing-balls
	staticCircles = [new Circle(47, 34, 18, "#ed9d33"), new Circle(340, 44, 18, "#d44d61"), new Circle(155, 12, 18, "#4f7af2"), new Circle(71, -4, 18, "#ef9a1e"), new Circle(172, -52, 18, "#4976f3"), new Circle(243, 34, 18, "#269230"), new Circle(231, -4, 18, "#1f9e2c"), new Circle(-267, 54, 18, "#1c48dd"), new Circle(179, -17, 18, "#2a56ea"), new Circle(-239, 53, 10, "#3355d8"), new Circle(-212, 44, 18, "#3355d8"), new Circle(231, -110, 18, "#36b641"), new Circle(113, 2, 18, "#2e5def"), new Circle(349, -38, 16, "#d53747"), new Circle(307, -10, 12, "#ba3039"), new Circle(333, -12, 12, "#eb676f"), new Circle(59, -40, 16, "#f9b125"), new Circle(282, 19, 16, "#de3646"), new Circle(-350, -1, 16, "#2a59f0"), new Circle(3, 40, 16, "#eb9c31"), new Circle(-65, 8, 16, "#c41731"), new Circle(-67, -24, 16, "#d82038"), new Circle(135, -54, 16, "#5f8af8"), new Circle(-19, 16, 16, "#efa11e"), new Circle(189, 77, 16, "#2e55e2"), new Circle(139, 118, 16, "#4167e4"), new Circle(231, -40, 16, "#0b991a"), new Circle(176, 106, 16, "#4869e3"), new Circle(-201, 11, 16, "#3059e3"), new Circle(231, -76, 16, "#10a11d"), new Circle(-123, 44, 16, "#cf4055"), new Circle(-83, 38, 16, "#cd4359"), new Circle(-327, 20, 16, "#2855ea"), new Circle(306, 40, 16, "#ca273c"), new Circle(-305, 44, 16, "#2650e1"), new Circle(108, -31, 16, "#4a7bf9"), new Circle(-211, -96, 16, "#3d65e7"), new Circle(297, -52, 12, "#f47875"), new Circle(281, -32, 12, "#f36764"), new Circle(153, 42, 12, "#1d4eeb"), new Circle(131, 54, 12, "#698bf1"), new Circle(31, -58, 12, "#fac652"), new Circle(-166, -14, 12, "#ee5257"), new Circle(-147, 30, 12, "#cf2a3f"), new Circle(-273, -114, 12, "#5681f5"), new Circle(-337, -70, 12, "#4577f6"), new Circle(-25, -12, 12, "#f7b326"), new Circle(175, 53, 12, "#2b58e8"), new Circle(-1, -54, 12, "#facb5e"), new Circle(-157, 9, 12, "#e02e3d"), new Circle(329, -58, 12, "#f16d6f"), new Circle(-239, -112, 12, "#507bf2"), new Circle(-303, -104, 12, "#5683f7"), new Circle(110, 111, 12, "#3158e2"), new Circle(-111, -58, 12, "#f0696c"), new Circle(-348, -49, 12, "#3769f6"), new Circle(-231, 2, 12, "#6084ef"), new Circle(-349, -27, 10, "#2a5cf4"), new Circle(-141, -50, 12, "#f4716e"), new Circle(-19, -36, 12, "#f8c247"), new Circle(-83, -48, 12, "#e74653"), new Circle(278, -9, 12, "#ec4147"), new Circle(93, 76, 10, "#4876f1"), new Circle(-155, -32, 10, "#ef5c5c"), new Circle(93, 96, 10, "#2552ea"), new Circle(-324, -88, 10, "#4779f7"), new Circle(108, 62, 10, "#4b78f1")];
	fpsCounter();
	
	if (search.value == "") search.value = "use your mouse!";
	rebuildQueryCircles();
	
	resize();	
	lastUpdate = Date.now();
	setInterval(update, 16); // 1000ms/30fps ~ 33, 1000ms/60fps ~ 16
}

function buildCirclesList() {
	circles = staticCircles.concat(
		queryCircles.filter(function(e,i,a){
			return (e!=null);
	}));
}

function resize() {
	canvas.setAttribute("width", window.innerWidth);
	canvas.setAttribute("height", window.innerHeight);
	grid = new Grid(canvas.width, canvas.height, Math.ceil(max_r * 2));
	newCenter = $V([window.innerWidth / 2, 150]);
	
	circles.each(function(circle) {
		circle.pos = circle.pos.subtract(center).add(newCenter);
		circle.accelerator.anchorPos =
			circle.accelerator.anchorPos.subtract(center).add(newCenter);
	});
	
	center = newCenter;
	context.font = "bold 12px Arial, sans-serif";
	context.textAlign = "center";
	context.textBaseline = "middle";
	//console.log("resized to " + window.innerWidth + ", " + window.innerHeight);
}

function mouseInput(e) {
	var x,y
	if (e.pageX != undefined && e.pageY != undefined) {
		x = e.pageX;
		y = e.pageY;
	} else {
		x = e.clientX + document.body.scrollLeft +
				document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop +
				document.documentElement.scrollTop;
	}
	x -= canvas.offsetLeft;
	y -= canvas.offsetTop;
	
	if (curMouse.elements[0] == x && curMouse.elements[1] == y) return;
	
	curMouse.elements[0] = x;
	curMouse.elements[1] = y;
	lastSeenMouse = lastUpdate;
}

function searchChange(e) {
	var curValue = search.value;
	var caret = search.selectionStart;
	if (ending) {
		ending = false;
		if (queryCircles.length > 0 && search.value.length == 0) //recovered from a back button
			searchValidator();
	}
	//console.log("caret: " + search.selectionStart + " keycode: " + e.keyCode + " charcode: " + e.charCode);
	window.setTimeout( function() { postSearchChange(e, caret, curValue); }, 5 );
}

var validateTimeout = null;
function postSearchChange(e, caret, lastValue) {
	var curValue = search.value;
	if (curValue == lastValue) return;
	var d = curValue.length - lastValue.length;
	
	//console.log ("keycode " + e.keyCode + ", curval.ln " + curValue.length + ", qc.len " + queryCircles.length  + ", caret " + caret);

	if (d > 0) {
		if (curValue.length == queryCircles.length) return; //paste event most likely, skip
		var insert = [];
		for (var i = 0; i < d; i++) {
			var c = null;
			if (curValue.charAt(caret + i) != " ") {
				c = new Circle((caret+i)*22-340+center.elements[0],
					200+center.elements[1], 10, "#444", curValue.charAt(caret + i), "#fff")
				c.pos.elements[1] -= 15;
			}
			insert.push(c);
		}
		for (var i = caret; i < queryCircles.length; i++) {
			if (queryCircles[i] == null) continue;
			queryCircles[i].accelerator.anchorPos.elements[0] += 22*d;
		}
		insert.unshift(caret, 0);
		queryCircles.splice.apply(queryCircles, insert);

		buildCirclesList();
	} else {
		d *= -1;
		if (e.keyCode == 46 || e.keyCode == 8) {
			if (caret != 0 && lastValue[caret-1] != curValue[caret-1])  // backspace special case
				caret--;
			queryCircles.splice(caret, d);
		} else {
			queryCircles.splice(caret, d+1);
			var c = null;
			if(curValue.charAt(caret) != " ") {
				var c = new Circle((caret)*22-340+center.elements[0], 200+center.elements[1],
						10, "#444", curValue.charAt(caret), "#fff")
				c.pos.elements[1] -= 15;
			}
			queryCircles.splice(caret, 0, c);
			caret++;
		}
		if (d > 0) {
			for (var i = caret; i < curValue.length; i++) {
				if (queryCircles[i] == null) continue;
				queryCircles[i].accelerator.anchorPos.elements[0] -= 22*d;
			}
		}
		buildCirclesList();
	}
	if (validateTimeout) window.clearTimeout(validateTimeout);
	validateTimeout = window.setTimeout(searchValidator, 500);
}

function searchValidator() {
	if (search.value.length != queryCircles.length) {
		rebuildQueryCircles();
	} else {
		for (var i = 0; i < queryCircles.length; i++) {
			if ((queryCircles[i] == null && search.value.charAt(i)) != " " ||
				(queryCircles[i].text != search.value.charAt(i))) {
				rebuildQueryCircles();
				return;
			}
		}
	}
}

function rebuildQueryCircles() {
	queryCircles = [];
	for (var i = 0; i < search.value.length; i++) {
		if (search.value.charAt(i) != " ")
			queryCircles.push(new Circle(i*22-340+center.elements[0], 200+center.elements[1],
											10, "#444", search.value.charAt(i), "#fff"));
		else
			queryCircles.push(null);
	}
	buildCirclesList();
}

function formSubmit(e) {
	e.preventDefault();
	ending = true;
	window.setTimeout( function() { form.submit(); }, 1500);
}

function update() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	fpsCounter();
	var now = Date.now();
	var delta = Math.min((now - lastUpdate)/1000.0, 0.05);
	lastUpdate = now;

	doPhysics(delta);
	drawCircles();
}

function doPhysics(delta) {
	var timeSinceMouseMove = Math.max(lastUpdate - lastSeenMouse, 0);
	if (timeSinceMouseMove < mouseTimeout) {
		var r = (mouseTimeout - timeSinceMouseMove) / mouseTimeout * mouseRadius;
		var r2 = r * r;
		grid.candidatesInRadius(curMouse, r).each(function(circle) {
			var diff = circle.pos.subtract(curMouse);
			var d = diff.dot(diff);
			if (d != 0 && d < r2) {
				d = Math.sqrt(d);
				diff = diff.x(10*mouseRadius/d - 1);
			}
			circle.velocity = circle.velocity.add(diff);
		});
	}
	
	circles.each(function(circle) {
		circle.velocity = circle.velocity.add(
			circle.accelerator.acceleration(circle.pos, circle.velocity).x(delta));
		circle.pos = circle.pos.add( circle.velocity.x(delta));
	});
	
	grid.clearCells();
	circles.each(function(circle) {grid.registerObject(circle, circle.pos);});
	posteriCollisions(delta);
	posteriWallCollisions();
}

function posteriCollisions(delta) {
	for (var i = 0; i < circles.length - 1; i++) {
		grid.collidingCandidates(circles[i], circles[i].pos).each( function(circle) {
			circles[i].handlePostCollision(circle);
		});
	}
}

function posteriWallCollisions() {
	if (ending) return;
	for (var i = 0; i < circles.length; i++) {
		circles[i].handlePostWallCollision();
	}
}

function drawCircles() {
	circles.each(function(circle) {
		circle.draw();
	});
}

var fpsCircle = null;
function fpsCounter() {
	var curSeconds = (new Date()).getSeconds();
	frames++;
	if (seconds != curSeconds) {
		seconds = curSeconds;
		fps = frames;
		frames = 0;
	}
	if (fpsCircle == null) {
		fpsCircle = new Circle(-400, -100, 24, "#444", "", "#fff");
		staticCircles.push(fpsCircle);
	}
	fpsCircle.text = fps + " fps";
}

function Circle(x, y, r, fill, text, textFill) {
	this.pos = $V([x, y]);
	this.r = r;
	this.r2 = r * r;
	this.mass = Math.PI * r * r * density;
	this.fill = fill;
	this.accelerator = new Spring(this.pos);
	this.velocity = Vector.Zero(2);
	this.text = text;
	this.textFill = textFill;
	
	this.handlePostCollision = function(circle) {
		var delta = this.pos.subtract(circle.pos);
		var d     = delta.dot(delta);
		
		if (d > (this.r + circle.r)*(this.r + circle.r) || d == 0) return;
		
		d         = Math.sqrt(d);                
		var mtd   = delta.x( ((this.r + circle.r) - d) / d );
		var v     = this.velocity.subtract(circle.velocity);
		var im1   = 1.0 / this.mass;
		var im2   = 1.0 / this.mass;
		var imsum = im1 + im2;
		
		this.pos   = this.pos.add  ( mtd.x( im1 / imsum ) );
		circle.pos = circle.pos.subtract( mtd.x( im2 / imsum ) );
		
		mtd    = mtd.toUnitVector();
		var vn = v.dot(mtd);
		if (vn > 0) return;
		
		var i       = (-(1.0 + restitution) * vn) / (imsum);
		var impulse = mtd.x(i);
		
		this.velocity   = this.velocity.add( impulse.x(im1) );
		circle.velocity = circle.velocity.subtract( impulse.x(im2) );
	}
	
	this.handlePostWallCollision = function() {
		var collided = false;
		if (this.pos.elements[0] < this.r) {
			this.pos.elements[0] = this.r;
			this.velocity.elements[0] *= -1;
			collided = true;
		} else if (this.pos.elements[0] >= canvas.width - this.r) {
			this.pos.elements[0] = canvas.width - this.r;
			this.velocity.elements[0] *= -1;
			collided = true;
		}
		if (this.pos.elements[1] < this.r) {
			this.pos.elements[1] = this.r;
			this.velocity.elements[1] *= -1;
			collided = true;
		} else if (this.pos.elements[1] >= canvas.height - this.r) {
			this.pos.elements[1] = canvas.height - this.r; 
			this.velocity.elements[1] *= -1;
			collided = true;
		}
		if (collided) this.velocity = this.velocity.x(restitution);
	}
	
	this.clone = function() {
		return new Circle(this.pos.elements[0], this.pos.elements[1], this.r, this.fill);
	}
	
	this.draw = function() {
		context.fillStyle = this.fill;
		context.beginPath();
		context.arc(this.pos.elements[0],this.pos.elements[1],this.r,0,Math.PI*2,true);
		context.closePath();
		context.fill();
		if (this.text) {
			context.fillStyle = this.textFill;
			context.fillText(this.text, this.pos.elements[0], this.pos.elements[1]);
		}
	}
}

function Spring(anchorPos) {
	this.anchorPos = anchorPos.dup();
	
	this.acceleration = function(pos, vel) {
		var anchor;
		if (ending)
			anchor = this.anchorPos.add(this.anchorPos.subtract(center).x(5));
		else
			anchor = this.anchorPos;
	
		var d = anchor.subtract(pos);
		return d.x(stiffness).add(vel.x(-friction));
	}
}

function Grid(width, height, gridSize) {
	this.cells = [];
	this.gridSize = gridSize;
	this.width = Math.ceil(width/gridSize);
	this.height = Math.ceil(height/gridSize);
	
	for (var i = 0; i < this.width; i++) {
		var col = [];
		for (var j = 0; j < this.height; j++) {
			col.push(new Cell());
		}
		this.cells.push(col);
	}
	
	for (var i = 0; i < this.width; i++) {
		for (var j = 0; j < this.height; j++) {
			c = this.cells[i][j];
			c.neighbors.push(c);
			var notLeft = i != 0;
			var notRight = i != this.width - 1;
			var notTop = j != 0;
			var notBottom = j != this.height - 1;
			if (notLeft) {
				c.neighbors.push(this.cells[i-1][j]);
				if (notTop) c.neighbors.push(this.cells[i-1][j-1]);
				//if (notBottom) c.neighbors.push(this.cells[i-1][j+1]);
			}
			if (notRight) {
				//c.neighbors.push(this.cells[i+1][j]);
				if (notTop) c.neighbors.push(this.cells[i+1][j-1]);
				//if (notBottom) c.neighbors.push(this.cells[i+1][j+1]);
			}
			if (notTop) c.neighbors.push(this.cells[i][j-1]);
			//if (notBottom) c.neighbors.push(this.cells[i][j+1]);
		}
	}
	
	this.clearCells = function() {
		for (var i = 0; i < this.width; i++) {
			for (var j = 0; j < this.height; j++) {
				this.cells[i][j].objects = [];
			}
		}
	}
	
	this.posToCellCoord = function(pos) {
		var x = Math.min(Math.max(Math.floor(pos.elements[0] / this.gridSize), 0), this.width-1);
		var y = Math.min(Math.max(Math.floor(pos.elements[1] / this.gridSize), 0), this.height-1);
		return {x: x, y: y}
	}
	
	this.posToCell = function(pos) {
		var coord = this.posToCellCoord(pos);
		return this.cells[coord.x][coord.y];
	}
	
	this.registerObject = function(obj, pos) {
		this.posToCell(pos).objects.push(obj);
	}
	
	this.collidingCandidates = function(obj, pos) {
		cell = this.posToCell(pos);
		ret = [];
		cell.neighbors.each( function(cell) {
			cell.objects.each( function(o) {
				if (obj != o) ret.push(o);
			});
		});
		return ret;
	}
	
	this.candidatesInRadius = function(pos, r) {
		var objs = [];
		var steps = Math.ceil(r / this.gridSize);
		var p = this.posToCellCoord(pos);
		var p_x_start = Math.max(p.x - steps, 0);
		var p_x_end   = Math.min(p.x + steps, this.width - 1);
		var p_y_start = Math.max(p.y - steps, 0);
		var p_y_end   = Math.min(p.y + steps, this.height - 1);
		for (var x = p_x_start; x <= p_x_end; x++) {
			for (var y = p_y_start; y <= p_y_end; y++) {
				objs = objs.concat(this.cells[x][y].objects);
			}
		}
		return objs;
	}

	function Cell() {
		this.neighbors = [];
		this.objects   = [];
	}
}

window.addEventListener('load', init, false);