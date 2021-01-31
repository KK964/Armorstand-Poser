var DEG2RAD = Math.PI / 180;
var width, height, renderer, scene, camera;
var clock = new THREE.Clock;
var rotY = 0, rotX = 0;
var matWood = new THREE.MeshLambertMaterial({ color: 0x826841 });
var matStone = new THREE.MeshLambertMaterial({ color: 0xadadad });
var matTransparentStone = new THREE.MeshLambertMaterial({ color: 0xadadad });
matTransparentStone.opacity = 0.8;
matTransparentStone.transparent = true;
var viewCenter = new THREE.Vector3(0,0,0);
var mBasePlate, mBody, mHead, mSkull, mLegLeft, mLegRight, mArmLeft, mArmRight;
var armorstand, armorstandWrapper

var mcVersion = "1.16";

var invisible = false;
var invulnerable = false;
var persistencerequired = false;
var noBasePlate = false;
var noGravity = false;
var showArms = false;
var small = false;
var marker = false;

var useEquipment;
var equipHandRight;
var equipHandLeft;
var equipShoes;
var equipLeggings;
var equipChestplate;
var equipHelmet = "";
var equipCustomHeadMode;
var equipColorShoes;
var equipColorLeggings;
var equipColorChestplate;
var equipColorHelmet;
var helmetList;
var chestplateList;
var leggingsList;
var bootsList;

var customName;
var showCustomName;
var nameColor;
var nameBold;
var nameItalic;
var nameobfuscated;
var nameStrikethrough;

var useDisabledSlots;

//The rotation values are all in degrees.
var head = new THREE.Vector3(0,0,0);
var body = new THREE.Vector3(0,0,0);
var leftLeg = new THREE.Vector3(0,0,0);
var rightLeg = new THREE.Vector3(0,0,0);
var leftArm = new THREE.Vector3(0,0,0);
var rightArm = new THREE.Vector3(0,0,0);
var rotation = 0;

//Stuff for mouse movements
var mouseDownX;
var mouseDownY;
var mouseMoveX;
var mouseMoveY;
var mouseRotationMultiplier = 0.008;
//A point class will help us manage the mouse movements.
Point = {
	x:null,
	y:null
};

jQuery.fn.selectAndCopyText = function(){
	// https://stackoverflow.com/a/9976413/1456971
	this.find('input').each(function() {
		if($(this).prev().length == 0 || !$(this).prev().hasClass('p_copy')) {
			$('<p class="p_copy" style="position: absolute; z-index: -1;"></p>').insertBefore($(this));
		}
		$(this).prev().html($(this).val());
	});

	var doc = document;
	var element = this[0];
	if (doc.body.createTextRange) {
		var range = document.body.createTextRange();
		range.moveToElementText(element);
		range.select();
	} else if (window.getSelection) {
		var selection = window.getSelection();
		var range = document.createRange();
		range.selectNodeContents(element);
		selection.removeAllRanges();
		selection.addRange(range);
	}

	document.execCommand("copy");
};

$(document).ready(function(){
	//Init
	setup();
	updateUI();
	render();
	loadScreen();

	// Confirm exit
	window.onbeforeunload = function(){
		return "Unsaved changes will NOT be saved. Exit anyways?";
	};

	//Stuff to handle and update input
	$("input").on("input", function(){
		handleInput();
	});
	$(':checkbox, #equipCustomHeadMode, #equipmode, #mcversion').change(function() {
		handleInput();
	});

	//updateURL


	$("#gl")
	.mousedown(function(event){
		mouseDownX = event.pageX;
		mouseDownY = event.pageY;
	})
	.mousemove(function(event){
		mouseMoveX = event.pageX;
		mouseMoveY = event.pageY;
	})
	.mouseup(function(event){
		rotY += getMouseDeltaX();
		rotX += getMouseDeltaY();
		mouseDownX = null;
		mouseDownY = null;
	});

	//Hide elements
	$("#credit").hide();
	$("#troubleshooting").hide();
	$("#inputarms").hide();
	$("#customequipment").hide();
	$("#disabledslots").hide();
	$("#namecustomization").hide();

	//Show elements
	$("#namecustomization").show();

	//Initialize colorpickers
	$('.colorfield').colpick({
		colorScheme:'light',
		layout:'hex',
		color:'ff8800',
		onSubmit:function(hsb,hex,rgb,el) {
			$(el).css('background-color', '#'+hex);
			$(el).colpickHide();
			handleInput();
		}
	});

	helmetList = $("#list-helmet").find("option");
	chestplateList = $("#list-chestplate").find("option");
	leggingsList = $("#list-leggings").find("option");
	bootsList = $("#list-shoes").find("option");

});

function loadScreen() {
	$(`#creationname`).attr(`placeholder`, `My Armor Stand #${localStorage.length + 1}`);
	if (!localStorage.length) {
		$(`#loadlistopts`).hide();
		$(`#loadmessage`).text(`You do not have any creations to load!`);
	} else {
		$(`#loadlistopts`).show();
		$(`#loadmessage`).text(`Load your saved creations`);
		$(`#loadlist`).empty();
		for (let i = 0; i < localStorage.length; i++) {
			$(`#loadlist`).append(`<option value="${localStorage.key(i)}">${localStorage.key(i)}</option>`);
		};
	};
};

function setup(){
	width = $("#gl").width();
	height = $("#gl").height();

	renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true });
	renderer.setSize(width, height);
	$("#gl").append(renderer.domElement);


	scene = new THREE.Scene();
	armorstand = new THREE.Object3D();
	//Add an armorstandWrapper to the scene, so the armorstand can be rotated naturally.
	armorstandWrapper = new THREE.Object3D();
	armorstand.position.set(0,-0.5,0);
	armorstandWrapper.add(armorstand);


	//BasePlate
	mBasePlate = new THREE.Mesh(
		new THREE.BoxGeometry(12/16, 1/16, 12/16),
		matStone);
	mBasePlate.position.y = - (1/32 - armorstand.position.y);
	armorstandWrapper.add(mBasePlate);
	//Add a little dot, so the user knows which way is forward
	var mmBaseDot = new THREE.Mesh(
		new THREE.BoxGeometry(2/16, 1/16, 4/16),
		matStone);
	mmBaseDot.position.set(0,mBasePlate.position.y,10/16);
	armorstandWrapper.add(mmBaseDot);

	// To Generate the other body parts, we will use a mesh to display,
	// and add it as a child to the object that serves as a pivot.

	//Left Leg
	var mmLegLeft = new THREE.Mesh(
		new THREE.BoxGeometry(2/16, 11/16, 2/16),
		matWood);
	mmLegLeft.position.set(0,-5.5/16,0);
	mLegLeft = new THREE.Object3D();
	mLegLeft.position.set(2/16,11/16,0); //Pivot Point
	mLegLeft.add(mmLegLeft);
	armorstand.add(mLegLeft);

	//Right Leg
	var mmLegRight = new THREE.Mesh(
		new THREE.BoxGeometry(2/16, 11/16, 2/16),
		matWood);
	mmLegRight.position.set(0,-5.5/16,0);
	mLegRight = new THREE.Object3D();
	mLegRight.position.set(-2/16,11/16,0); //Pivot Point
	mLegRight.add(mmLegRight);
	armorstand.add(mLegRight);

	//Left Arm
	var mmArmLeft = new THREE.Mesh(
		new THREE.BoxGeometry(2/16, 12/16, 2/16),
		matWood);
	mmArmLeft.position.set(0,-4/16,0);
	mArmLeft = new THREE.Object3D();
	mArmLeft.position.set(6/16,21/16,0); //Pivot Point
	mArmLeft.add(mmArmLeft);
	armorstand.add(mArmLeft);

	//Right Arm
	var mmArmRight = new THREE.Mesh(
		new THREE.BoxGeometry(2/16, 12/16, 2/16),
		matWood);
	mmArmRight.position.set(0,-4/16,0);
	mArmRight = new THREE.Object3D();
	mArmRight.position.set(-6/16,21/16,0); //Pivot Point
	mArmRight.add(mmArmRight);
	armorstand.add(mArmRight);

	//Body (consists of four parts)
	var mmHip = new THREE.Mesh(
		new THREE.BoxGeometry(8/16, 2/16, 2/16),
		matWood);
	mmHip.position.set(0,-11/16,0);
	var mmBodyLeft = new THREE.Mesh(
		new THREE.BoxGeometry(2/16, 7/16, 2/16),
		matWood);
	mmBodyLeft.position.set(2/16,-6.5/16,0);
	var mmBodyRight = new THREE.Mesh(
		new THREE.BoxGeometry(2/16, 7/16, 2/16),
		matWood);
	mmBodyRight.position.set(-2/16,-6.5/16,0);
	var mmShoulders = new THREE.Mesh(
		new THREE.BoxGeometry(12/16, 3/16, 3/16),
		matWood);
	mmShoulders.position.set(0,-1.5/16,0);
	mBody = new THREE.Object3D();
	mBody.position.set(0,23/16,0); //Pivot Point
	mBody.add(mmHip);
	mBody.add(mmBodyLeft);
	mBody.add(mmBodyRight);
	mBody.add(mmShoulders);
	armorstand.add(mBody);

	//Head (neck and skull)
	var mmNeck = new THREE.Mesh(
		new THREE.BoxGeometry(2/16, 7/16, 2/16),
		matWood);
	mmNeck.position.set(0,3.5/16,0);
	mSkull = new THREE.Mesh(
		new THREE.BoxGeometry(10/16, 10/16, 10/16),
		matTransparentStone);
	mSkull.position.set(0,5/16,0);
	mHead = new THREE.Object3D();
	mHead.position.set(0,22/16,0); //Pivot Point
	mHead.add(mmNeck);
	mHead.add(mSkull);
	armorstand.add(mHead);


	scene.add(armorstandWrapper);

	camera = new THREE.PerspectiveCamera(45, width/height, 0.1, 1000);
	camera.position.y = 2;
	camera.position.z = 4;
	camera.lookAt(viewCenter);
	scene.add(camera);

	var pointLight = new THREE.PointLight(0xffffff);
	pointLight.position.set(0, 300, 200);

	scene.add(pointLight);
}

// Write stuff from input into variables
function handleInput(){

	invisible = getCheckBoxInput("invisible");
	invulnerable = getCheckBoxInput("invulnerable");
	persistencerequired = getCheckBoxInput("persistencerequired");
	noBasePlate = getCheckBoxInput("nobaseplate");
	noGravity = getCheckBoxInput("nogravity");
	showArms = getCheckBoxInput("showarms");
	small = getCheckBoxInput("small");
	marker = getCheckBoxInput("marker");

	useEquipment = getCheckBoxInput("useequipment");
	equipHandRight = getInput("equipHandRight");
	equipHandLeft = getInput("equipHandLeft");
	equipShoes = getInput("equipShoes");
	equipLeggings = getInput("equipLeggings");
	equipChestplate = getInput("equipChestplate");
	equipHelmet = getInput("equipHelmet");
	equipCustomHeadMode = $("#equipCustomHeadMode").val();

	equipColorShoes = $("#shoecolor").css("background-color");
	equipColorLeggings = $("#leggingscolor").css("background-color");
	equipColorChestplate = $("#chestplatecolor").css("background-color");
	equipColorHelmet = $("#helmetcolor").css("background-color");

	customName = getInput("customname");
	showCustomName = getCheckBoxInput("showcustomname");
	nameColor = getInput("namecolor");
	nameBold = getCheckBoxInput("namebold");
	nameItalic = getCheckBoxInput("nameitalic");
	nameObfuscated = getCheckBoxInput("nameobfuscated");
	nameStrikethrough = getCheckBoxInput("namestrikethrough");

	useDisabledSlots = getCheckBoxInput("usedisabledslots");

	body.set(getRangeInput("bodyX"), getRangeInput("bodyY"), getRangeInput("bodyZ"));
	head.set(getRangeInput("headX"), getRangeInput("headY"), getRangeInput("headZ"));
	leftLeg.set(getRangeInput("leftLegX"), getRangeInput("leftLegY"), getRangeInput("leftLegZ"));
	rightLeg.set(getRangeInput("rightLegX"), getRangeInput("rightLegY"), getRangeInput("rightLegZ"));
	leftArm.set(getRangeInput("leftArmX"), getRangeInput("leftArmY"), getRangeInput("leftArmZ"));
	rightArm.set(getRangeInput("rightArmX"), getRangeInput("rightArmY"), getRangeInput("rightArmZ"));

	rotation = getRangeInput("rotation");

	updateUI();
};

function getCheckBoxInput(name) {
	return $("input[name="+name+"]").prop("checked");
};

function getRangeInput(name) {
	return $("input[name="+name+"]").val();
};

function getInput(name) {
	return $("input[name="+name+"]").val();
};

/** Changes stuff according to our input values */
function updateUI(){

	//Hide/Show different inputs

	if(showArms)
		$("#inputarms").slideDown();
	else
		$("#inputarms").slideUp();

	if(useEquipment){
		$("#customequipment").slideDown();
		// Hide left hand item input for minecraft 1.8
		$("#equipHandLeft").show();
	}
	else
		$("#customequipment").slideUp();

	//Different colorinputs for armorparts
	if(isLeatherArmor(equipShoes))
		$("#shoecolor").slideDown();
	else
		$("#shoecolor").slideUp();
	if(isLeatherArmor(equipLeggings))
		$("#leggingscolor").slideDown();
	else
		$("#leggingscolor").slideUp();
	if(isLeatherArmor(equipChestplate))
		$("#chestplatecolor").slideDown();
	else
		$("#chestplatecolor").slideUp();
	if(isLeatherArmor(equipHelmet))
		$("#helmetcolor").slideDown();
	else
		$("#helmetcolor").slideUp();

	// Link to minecraft-heads.com
	if(equipCustomHeadMode == "givecode"){
		$("#minecraft-heads").slideDown();
	}
	else{
		$("#minecraft-heads").slideUp();
	}

	// Show disabled slots
	if(useDisabledSlots) {
		$(".sprite.offhand").show();
		$("#dO").show();
		$("#rO").show();
		$("#pO").show();

		$("#disabledslots").slideDown();
	}
	else
		$("#disabledslots").slideUp();

	$("#namecustomization").show();

	// Generate code
	$("#code").text(generateCode());

	// Rotate 3D Stuff
	// y and z rotation needs to be inverted
	setRotation(mBody, body);
	setRotation(mHead, head);
	setRotation(mLegLeft, leftLeg);
	setRotation(mLegRight, rightLeg);
	setRotation(mArmLeft, leftArm);
	setRotation(mArmRight, rightArm);
	armorstand.rotation.y = -rotation * DEG2RAD;

	// Scale model, depending on small variable
	if(small)
		armorstand.scale.set(0.6, 0.6, 0.6);
	else
		armorstand.scale.set(1, 1, 1);

	//Set Visibility
	mArmRight.visible = mArmLeft.visible = showArms;
	mBasePlate.visible = !noBasePlate;
	mSkull.visible = equipHelmet != "";
}

function generateCode(){
	var code = "{" 

	var tags = [];

	//CheckBoxes
	if(invisible)
		tags.push("Invisible:1b");
	if(invulnerable)
		tags.push("Invulnerable:1b");
	if(persistencerequired)
		tags.push("PersistenceRequired:1b");
	if(noBasePlate)
		tags.push("NoBasePlate:1b");
	if(noGravity)
		tags.push("NoGravity:1b");
	if(showArms)
		tags.push("ShowArms:1b");
	if(small)
		tags.push("Small:1b");
	if(marker)
		tags.push("Marker:1b");

	//Sliders
	if(rotation != 0)
		tags.push("Rotation:["+rotation+"f]");

	// Equipment
	if(useEquipment){
		var armor = [];

		armor.push(getShoesItem());
		armor.push(getLeggingsItem());
		armor.push(getChestplateItem());
		armor.push(getHeadItem());

		tags.push("ArmorItems:["+armor.join(",")+"]");

		var hands = [];

		hands.push(getHandRightItem());
		hands.push(getHandLeftItem());

		tags.push("HandItems:["+hands.join(",")+"]");

		$("#list-helmet").empty().append(helmetList);
		$("#list-chestplate").empty().append(chestplateList);
		$("#list-leggings").empty().append(leggingsList);
		$("#list-shoes").empty().append(bootsList);
	}

	// Custom name
	if(customName) {
		let name = [];
				// CustomNames from 1.14+ can now use single quotes to contain json
				// Replace escaped double quotes with single quotes to make it look pretty
		name.push(getName().replaceAll("\\", ""));
		name.push(getNameColor().replaceAll("\\", ""));
		name.push(getNameBold().replaceAll("\\", ""));
		name.push(getNameItalic().replaceAll("\\", ""));
		name.push(getNameObfuscated().replaceAll("\\", ""));
		name.push(getNameStrikethrough().replaceAll("\\", ""));
		tags.push(`CustomName:'{${name.join("")}}'`);
	}

	if(showCustomName)
		tags.push("CustomNameVisible:1b");

	//DisabledSlots
	if(useDisabledSlots){
		tags.push("DisabledSlots:"+calculateDisabledSlotsFlag());
	}

	//Now the pose
	var pose = [];
	if(!isZero(body))
		pose.push("Body:"+getJSONArray(body));
	if(!isZero(head))
		pose.push("Head:"+getJSONArray(head));
	if(!isZero(leftLeg))
		pose.push("LeftLeg:"+getJSONArray(leftLeg));
	if(!isZero(rightLeg))
		pose.push("RightLeg:"+getJSONArray(rightLeg));
	if(showArms){
		if(!isZero(leftArm))
			pose.push("LeftArm:"+getJSONArray(leftArm));
		if(!isZero(rightArm))
			pose.push("RightArm:"+getJSONArray(rightArm));
	}


	if(pose.length > 0)
		tags.push("Pose:{"+pose.join(",")+"}");

	code += tags.join(",");
	code += "}";
	return code;
}

function getHandRightItem(){
	if(equipHandRight == "") return "{}";
	return "{id:\""+equipHandRight+"\",Count:1b}";
}

function getHandLeftItem(){
	if(equipHandLeft == "") return "{}";
	return "{id:\""+equipHandLeft+"\",Count:1b}";
}

function getShoesItem(){
	if(equipShoes == "") return "{}";
	return "{id:\""+equipShoes+"\",Count:1b"
					+getLeatherColorString($("#shoecolor"), isLeatherArmor(equipShoes))
					+"}";
}

function getLeggingsItem(){
	if(equipLeggings == "") return "{}";
	return "{id:\""+equipLeggings+"\",Count:1b"
					+getLeatherColorString($("#leggingscolor"), isLeatherArmor(equipLeggings))
					+"}";
}

function getChestplateItem(){
	if(equipChestplate == "") return "{}";
	return "{id:\""+equipChestplate+"\",Count:1b"
				+getLeatherColorString($("#chestplatecolor"), isLeatherArmor(equipChestplate))
				+"}";
}

function getHeadItem(){
	if(equipHelmet == "") return "{}";

	// Use input as item
	if(equipCustomHeadMode == "item"){
		return "{id:\""+equipHelmet+"\",Count:1b"
		+getLeatherColorString($("#helmetcolor"), isLeatherArmor(equipHelmet))
		+"}";
	}

	// Use input as player name
	else if(equipCustomHeadMode == "player"){
		return "{id:\"player_head\",Count:1b,tag:{SkullOwner:\""+equipHelmet+"\"}}";
	}

	// Use input as url
	// Best reference: http://redd.it/24quwx
	else if(equipCustomHeadMode == "url"){
		var base64Value = btoa('{"textures":{"SKIN":{"url":"'+equipHelmet+'"}}}');
		return '{id:"minecraft:player_head",Count:1b,tag:{SkullOwner:{Id:'+generateIntArray()+',Properties:{textures:[{Value:"'+base64Value+'"}]}}}}';
	}

	else if(equipCustomHeadMode == "givecode"){

		if(equipHelmet.indexOf("SkullOwner:{") >= 0){
			var skullOwnerRaw = equipHelmet.substring(equipHelmet.indexOf("SkullOwner"));
			var parsed = "";
			var bracketCounter = 0;
			var bracketsStarted = false;

			for(var i = 0; i < skullOwnerRaw.length; i++){
				var c = skullOwnerRaw[i];

				if(c == "{") bracketCounter++;
				if(c == "}") bracketCounter--;

				parsed += c;
				if(bracketCounter == 0 && bracketsStarted) break;
				if(c == ":") bracketsStarted = true;
			}
			return '{id:"player_head",Count:1b,tag:{'+parsed+'}}';
		}
		else{
			var skullOwnerRaw = equipHelmet.substring(equipHelmet.indexOf("SkullOwner:"));
			skullOwnerRaw = skullOwnerRaw.substring(0, skullOwnerRaw.indexOf("}"));
			return '{id:"player_head",Count:1b,tag:{'+skullOwnerRaw+'}}';
		}

	}

}

function getName() {
	if (!customName) return ""
	return `\\"text\\":\\"${customName}\\"`
}

function getNameColor() {
	if (nameColor == "") return ""
	return `,\\"color\\":\\"${nameColor}\\"`
}

function getNameBold() {
	if (!nameBold) return ""
	return `,\\"bold\\":\\"true\\"`
}

function getNameItalic() {
	if (!nameItalic) return ""
	return `,\\"italic\\":\\"true\\"`
}

function getNameStrikethrough() {
	if (!nameStrikethrough) return ""
	return `,\\"strikethrough\\":\\"true\\"`
}

function getNameObfuscated() {
	if (!nameObfuscated) return ""
	return `,\\"obfuscated\\":\\"true\\"`
}

function calculateDisabledSlotsFlag() {
	var dO = $("#dO").is(":checked") ? 1 << (5) : 0;
	var dH = $("#dH").is(":checked") ? 1 << (4) : 0;
	var dC = $("#dC").is(":checked") ? 1 << (3) : 0;
	var dL = $("#dL").is(":checked") ? 1 << (2) : 0;
	var dB = $("#dB").is(":checked") ? 1 << (1) : 0;
	var dW = $("#dW").is(":checked") ? 1 << (0) : 0;
	var dR = dO + dH + dC + dL + dB + dW;

	var rO = $("#rO").is(":checked") ? 1 << (5 + 8) : 0;
	var rH = $("#rH").is(":checked") ? 1 << (4 + 8) : 0;
	var rC = $("#rC").is(":checked") ? 1 << (3 + 8) : 0;
	var rL = $("#rL").is(":checked") ? 1 << (2 + 8) : 0;
	var rB = $("#rB").is(":checked") ? 1 << (1 + 8) : 0;
	var rW = $("#rW").is(":checked") ? 1 << (0 + 8) : 0;
	var rR = rO + rH + rC + rL + rB + rW;

	var pO = $("#pO").is(":checked") ? 1 << (5 + 16) : 0;
	var pH = $("#pH").is(":checked") ? 1 << (4 + 16) : 0;
	var pC = $("#pC").is(":checked") ? 1 << (3 + 16) : 0;
	var pL = $("#pL").is(":checked") ? 1 << (2 + 16) : 0;
	var pB = $("#pB").is(":checked") ? 1 << (1 + 16) : 0;
	var pW = $("#pW").is(":checked") ? 1 << (0 + 16) : 0;
	var pR = pO + pH + pC + pL + pB + pW;

	var result = dR + rR + pR;
	return result;
}

function isZero(vector){
	return vector.x == 0 && vector.y == 0 && vector.z == 0;
}
function getJSONArray(vector){
	return "["+vector.x+"f,"+vector.y+"f,"+vector.z+"f]";
}

function getMouseDeltaX(){
	var mouseDeltaX = 0;
	if(mouseDownX != null && mouseMoveX != null){
		mouseDeltaX = mouseMoveX - mouseDownX;
	}
	return mouseDeltaX * mouseRotationMultiplier;
}
function getMouseDeltaY(){
	var mouseDeltaY = 0;
	if(mouseDownY != null && mouseMoveY != null){
		mouseDeltaY = mouseMoveY - mouseDownY;
	}
	return mouseDeltaY * mouseRotationMultiplier;
}

function render(){
	renderer.render(scene, camera);

	var deltaTime = clock.getDelta();

	armorstandWrapper.rotation.y = rotY + getMouseDeltaX();
	armorstandWrapper.rotation.x = rotX + getMouseDeltaY();

	requestAnimationFrame(render);
}

// ---- Additional functions

// From here: http://stackoverflow.com/a/8809472/1456971
function generateUUID(){
	var d = new Date().getTime();
	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = (d + Math.random()*16)%16 | 0;
		d = Math.floor(d/16);
		return (c=='x' ? r : (r&0x3|0x8)).toString(16);
	});
	return uuid;
}

function generateIntArray() {
	const buffer = new Uint32Array(4);
	const UUID = new DataView(buffer.buffer);
	const paddings = [8, 4, 4, 4, 12];

	let hexUUID = generateUUID().split("-").map((val, i) => val.padStart(paddings[i], "0")).join("");
	let ints = [];

	for (let i = 0; i < 4; i++) {
		num = Number("0x" + hexUUID.substring(i*8, (i+1)*8));
		UUID.setInt32(i*4, num);
		ints.push(UUID.getInt32(i*4));
	}

	return '[I;' + ints.join(",") + ']';
}

function getDecimalRGB(rgb){
	//The string has the format 'rgb(r, g, b)'

	//Remove whitespaces. Now formatted: 'rgb(r,g,b)'
	rgb = rgb.replace(/ /g,"");

	var r = rgb.substring(4,rgb.indexOf(","));
	var g = rgb.substring(rgb.indexOf(",")+1,rgb.lastIndexOf(","));
	var b = rgb.substring(rgb.lastIndexOf(",")+1, rgb.length-1);


	return (r << 16) | (g << 8) | b;
}

function isLeatherArmor(item){
	if(item == null)
		return false;
	return item.indexOf("leather") == 0;
}

// Pass the colorpicker element as element. If condition is true, it will return a proper datatag for use in items, otherwise it will return an empty string.
function getLeatherColorString(element, condition){
	if(condition){
		var rgb = getDecimalRGB(element.css("background-color"));
		return ",tag:{display:{color:"+rgb+"}}";
	}
	return "";
}

// Rotate three.js mesh to fit the minecraft rotation
function setRotation(mesh, rotation){
	rotateAroundWorldAxis(mesh, new THREE.Vector3(1,0,0), rotation.x * DEG2RAD, true);
	rotateAroundWorldAxis(mesh, new THREE.Vector3(0,1,0), -rotation.y * DEG2RAD, false);
	rotateAroundWorldAxis(mesh, new THREE.Vector3(0,0,1), -rotation.z * DEG2RAD, false);
}

// From here: http://stackoverflow.com/a/11124197/1456971
var rotWorldMatrix;
// Rotate an object around an arbitrary axis in world space
function rotateAroundWorldAxis(object, axis, radians, reset) {
	rotWorldMatrix = new THREE.Matrix4();
	rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
		if(!reset)
		rotWorldMatrix.multiply(object.matrix);		// pre-multiply
	object.matrix = rotWorldMatrix;
	object.rotation.setFromRotationMatrix(object.matrix);
}

function getParameterByName(name, url = window.location.href) {
	name = name.replace(/[\[\]]/g, '\\$&');
	var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function loadData() {
	var data = getParameterByName("armorstandSaveData")
	if (!data) return console.log("No ArmorStand data found. Starting from base.");
	
	try {
		data = JSON.parse(data);
		$("input[name=invisible]").prop(`checked`, data.options.invisible);
		$("input[name=invulnerable]").prop(`checked`, data.options.invulnerable);
		$("input[name=persistencerequired]").prop(`checked`, data.options.presistence_required);
		$("input[name=nobaseplate]").prop(`checked`, data.options.no_base_plate);
		$("input[name=nogravity]").prop(`checked`, data.options.no_gravity);
		$("input[name=showarms]").prop(`checked`, data.options.show_arms);
		$("input[name=small]").prop(`checked`, data.options.small);
		$("input[name=marker]").prop(`checked`, data.options.marker);
		$("input[name=center-corrected]").prop(`checked`, data.options.center_corrected);
		
		$("input[name=rotation]").val(data.rotation.main);
		$("input[name=headX]").val(data.rotation.head[0]);
		$("input[name=headY]").val(data.rotation.head[1]);
		$("input[name=headZ]").val(data.rotation.head[2]);
		
		$("input[name=bodyX]").val(data.rotation.body[0]);
		$("input[name=bodyY]").val(data.rotation.body[1]);
		$("input[name=bodyZ]").val(data.rotation.body[2]);
		
		$("input[name=leftLegX]").val(data.rotation.legs.left[0]);
		$("input[name=leftLegY]").val(data.rotation.legs.left[1]);
		$("input[name=leftLegZ]").val(data.rotation.legs.left[2]);
		
		$("input[name=rightLegX]").val(data.rotation.legs.right[0]);
		$("input[name=rightLegY]").val(data.rotation.legs.right[1]);
		$("input[name=rightLegZ]").val(data.rotation.legs.right[2]);
		
		$("input[name=leftArmX]").val(data.rotation.arms.left[0]);
		$("input[name=leftArmY]").val(data.rotation.arms.left[1]);
		$("input[name=leftArmZ]").val(data.rotation.arms.left[2]);
		
		$("input[name=rightArmX]").val(data.rotation.arms.right[0]);
		$("input[name=rightArmY]").val(data.rotation.arms.right[1]);
		$("input[name=rightArmZ]").val(data.rotation.arms.right[2]);
		
		$("input[name=useequipment]").prop(`checked`, data.equipment.enabled);
		$(`input[name=equipShoes]`).val(data.equipment.boots);
		$(`input[name=equipLeggings]`).val(data.equipment.leggings);
		$(`input[name=equipChestplate]`).val(data.equipment.chestplate);
		$(`input[name=equipHelmet]`).val(data.equipment.helmet);
		$(`input[name=equipHandRight]`).val(data.equipment.hands.right);
		$(`input[name=equipHandLeft]`).val(data.equipment.hands.left);
		$(`#equipCustomHeadMode`).val(data.equipment.helmet_specifies);
		
		$(`#helmetcolor`).css(`background-color`, data.equipment.leather_colours.helmet);
		$(`#chestplatecolor`).css(`background-color`, data.equipment.leather_colours.chestplate);
		$(`#leggingscolor`).css(`background-color`, data.equipment.leather_colours.leggings);
		$(`#shoecolor`).css(`background-color`, data.equipment.leather_colours.boots);
		
		getLeatherColorString($("#helmetcolor"))
		getLeatherColorString($("#chestplatecolor"))
		getLeatherColorString($("#leggingscolor"))
		getLeatherColorString($("#shoecolor"))
		
		$(`#customname`).val(data.custom_name.name);
		$(`input[name=showcustomname]`).prop(`checked`, data.custom_name.show_custom_name);
		$(`input[name=namecolor]`).val(data.custom_name.name_color);
		$("input[name=namebold]").prop(`checked`, data.custom_name.options.bold);
		$("input[name=nameitalic]").prop(`checked`, data.custom_name.options.italic);
		$("input[name=nameobfuscated]").prop(`checked`, data.custom_name.options.obfuscated);
		$("input[name=namestrikethrough]").prop(`checked`, data.custom_name.options.strikethrough);
		
		$("input[name=usedisabledslots]").prop(`checked`, data.lock_slot_interaction.enabled);
		
		$(`#dO`).prop(`checked`, data.lock_slot_interaction.remove.offhand);
		$(`#dH`).prop(`checked`, data.lock_slot_interaction.remove.helmet);
		$(`#dC`).prop(`checked`, data.lock_slot_interaction.remove.chestplate);
		$(`#dL`).prop(`checked`, data.lock_slot_interaction.remove.leggings);
		$(`#dB`).prop(`checked`, data.lock_slot_interaction.remove.boots);
		$(`#dW`).prop(`checked`, data.lock_slot_interaction.remove.weapons);

		$(`#rO`).prop(`checked`, data.lock_slot_interaction.replace.offhand);
		$(`#rH`).prop(`checked`, data.lock_slot_interaction.replace.helmet);
		$(`#rC`).prop(`checked`, data.lock_slot_interaction.replace.chestplate);
		$(`#rL`).prop(`checked`, data.lock_slot_interaction.replace.leggings);
		$(`#rB`).prop(`checked`, data.lock_slot_interaction.replace.boots);
		$(`#rW`).prop(`checked`, data.lock_slot_interaction.replace.weapons);

		$(`#pO`).prop(`checked`, data.lock_slot_interaction.place.offhand);
		$(`#pH`).prop(`checked`, data.lock_slot_interaction.place.helmet);
		$(`#pC`).prop(`checked`, data.lock_slot_interaction.place.chestplate);
		$(`#pL`).prop(`checked`, data.lock_slot_interaction.place.leggings);
		$(`#pB`).prop(`checked`, data.lock_slot_interaction.place.boots);
		$(`#pW`).prop(`checked`, data.lock_slot_interaction.place.weapons);
		handleInput();
	} catch (err) {
		console.error(err);
		alert(`An error occurred while loading the ArmorStand.`);
	};
};