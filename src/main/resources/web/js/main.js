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
var initialized = false;
var invisible = false, invulnerable = false, noBasePlate = false, noGravity = false, showArms = false, small = false;

var useEquipment, equipHandRight, equipHandLeft, equipShoes, equipLeggings, equipChestplate, equipHelmet = "", equipCustomHeadMode, equipColorShoes, equipColorLeggings, equipColorChestplate, equipColorHelmet;

var customName, showCustomName, nameColor, nameBold, nameItalic, nameobfuscated, nameStrikethrough;
String.prototype.trimEllip = function (length) {
	return this.length > length ? this.substring(0, length) + "..." : this;
}
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
	loadData();

	//Stuff to handle and update input
	$("input").on("input", function(){
		handleInput();
		autoSave();
	});
	$(':checkbox, #equipCustomHeadMode, #equipmode, #mcversion').change(function() {
		handleInput();
		autoSave();
	});

	window.onbeforeunload = function(){
		return safeExit();
	};
	//save
	$("#save")
	.mousedown(function(event){
	var newUrl = getNewUrl("armorStandNbt="+generateCode());
	fetch(newUrl).then((response) => {response.text().then((text) => {alert(text)})});
	});
	//exit
	$("#exit")
	.mousedown(function(event){
		safeExit();
	});

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
});

function autoSave() {
	if(initialized == true && $('#auto-save').length > 0 && $('#auto-save').is(":checked")) {
		var newUrl = getNewUrl("armorStandNbt="+generateCode());
		fetch(newUrl).then((response) => {response.text().then((text) => {})});
	}
}

function getNewUrl(sep) {
	var url=window.location.href,
	separator = (url.indexOf("?")===-1)?"?":"&",
	newParam=separator + sep;
	newUrl=url.replace(newParam,"");
	newUrl+=newParam;
	return newUrl;
}

function safeExit() {
	var newUrl = getNewUrl("exit=true");
	fetch(newUrl).then((response) => {response.text().then((text) => {return close()})});
}

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
	noBasePlate = getCheckBoxInput("nobaseplate");
	noGravity = getCheckBoxInput("nogravity");
	showArms = getCheckBoxInput("showarms");
	small = getCheckBoxInput("small");

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
	customName = customName.trimEllip(100);
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
	if(invisible) 
		tags.push("Invisible:1b") 
	else 
		tags.push("Invisible:0b");
	if(invulnerable)
		tags.push("Invulnerable:1b")
	else
		tags.push("Invulnerable:0b");
	if(noBasePlate)
		tags.push("NoBasePlate:1b")
	else
		tags.push("NoBasePlate:0b");
	if(noGravity)
		tags.push("NoGravity:1b")
	else
		tags.push("NoGravity:0b");
	if(showArms)
		tags.push("ShowArms:1b")
	else
		tags.push("ShowArms:0b");
	if(small)
		tags.push("Small:1b")
	else
		tags.push("Small:0b");
	tags.push("Rotation:["+rotation+"f]");
	var armor = [];
	armor.push(getShoesItem() || "{}");
	armor.push(getLeggingsItem() || "{}");
	armor.push(getChestplateItem() || "{}");
	armor.push(getHeadItem() || "{}");
	tags.push("ArmorItems:["+armor.join(",")+"]");
	var hands = [];
	hands.push(getHandRightItem() || "{}");
	hands.push(getHandLeftItem() || "{}");
	tags.push("HandItems:["+hands.join(",")+"]");
	if(customName) {
		let name = [];
		name.push(getName().replaceAll("\\", ""));
		name.push(getNameColor().replaceAll("\\", ""));
		name.push(getNameBold().replaceAll("\\", ""));
		name.push(getNameItalic().replaceAll("\\", ""));
		name.push(getNameObfuscated().replaceAll("\\", ""));
		name.push(getNameStrikethrough().replaceAll("\\", ""));
		tags.push(`CustomName:'{${name.join("")}}'`);
	} else
	tags.push(`CustomName:'{"text":""}'`);

	if(showCustomName)
		tags.push("CustomNameVisible:1b")
	else 
		tags.push("CustomNameVisible:0b");
	if(useDisabledSlots)
		tags.push("DisabledSlots:"+calculateDisabledSlotsFlag())
	else
		tags.push("DisabledSlots:"+ "0");
	var pose = [];
	pose.push("Body:"+getJSONArray(body));
	pose.push("Head:"+getJSONArray(head));
	pose.push("LeftLeg:"+getJSONArray(leftLeg));
	pose.push("RightLeg:"+getJSONArray(rightLeg));

	pose.push("LeftArm:"+getJSONArray(leftArm));
	pose.push("RightArm:"+getJSONArray(rightArm));
	tags.push("Pose:{"+pose.join(",")+"}");
	code += tags.join(",");
	code += "}";
	return code;
}

function getHandRightItem(){
	if(!equipHandRight || equipHandRight == "") return "{}";
	if(equipHandRight.startsWith("{")) return equipHandRight;
	return "{id:\""+ getNbt(equipHandRight)+"}";
}

function getHandLeftItem(){
	if(!equipHandLeft || equipHandLeft == "") return "{}";
	if(equipHandLeft.startsWith("{")) return equipHandLeft;
	return "{id:\""+getNbt(equipHandLeft)+"}";
}

function getShoesItem(){
	if(!equipShoes || equipShoes == "") return "{}";
	if(equipShoes.startsWith("{")) return equipShoes;
	return "{id:\""+getNbt(equipShoes)
		+getLeatherColorString($("#shoecolor"), isLeatherArmor(equipShoes))+"}";
}

function getLeggingsItem(){
	if(!equipLeggings || equipLeggings == "") return "{}";
	if(equipLeggings.startsWith("{")) return equipLeggings;
	return "{id:\""+getNbt(equipLeggings)
		+getLeatherColorString($("#leggingscolor"), isLeatherArmor(equipLeggings))+"}";
}

function getChestplateItem(){
	if(!equipChestplate || equipChestplate == "") return "{}";
	if(equipChestplate.startsWith("{")) return equipChestplate;
	return "{id:\""+getNbt(equipChestplate)
		+getLeatherColorString($("#chestplatecolor"), isLeatherArmor(equipChestplate))+"}";
}

function getHeadItem(){
	if(!equipHelmet || equipHelmet == "") return "{}";
	if(equipHelmet.startsWith("{")) return equipHelmet;
	// Use input as item
	if(equipCustomHeadMode == "item"){
		return "{id:\""+getNbt(equipHelmet)+
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

function getNbt(inputString) {
	if(!inputString) return "\"";
	if(!inputString.includes("{")) return inputString+"\",Count:1b";
	var [first, ...rest] = inputString.split(/{(?=(.+))/);
	var nbt = first+"\",Count:1b,"+"tag:{"+rest[0].slice(0,-1)+"}";
	console.log(nbt);
	return nbt;
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

// Thanks to "spongebob is the best anime#8085" for figuring this part out :D
function reverseDisabled(data) {
	data = parseInt(data);
	var integer = [1,2,4,8,16,32,256,512,1024,2048,4096,8192,65536,131072,262144,524288,1048576,2097152];
	integer.reverse();

	var binaryValues = [];
	var bin;
	for (var i = integer.length; i >= 0; i--) {
		if ((data-integer[i])>=0) {
			total = data-integer[i];
			bin = Math.pow(2,i);
			var pre;
			for(var e of binaryValues)
				pre+=e;
			if(integer.includes(bin) && pre <= data)
				binaryValues.push(bin);
		}
	}
	return binaryValues;
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

function setToInt(data) {
	return parseInt(data.slice(0, 3));
}

function stringToBool(data) {
	return (data=="true"||data=="1b");
}

function loadData() {
	var newUrl = getNewUrl("requestData=true");
	fetch(newUrl).then((response) => {response.json().then((data) => {
		try {
			if(data.hasOwnProperty("Invisible"))
				$("input[name=invisible]").prop(`checked`, stringToBool(data.Invisible));
			if(data.hasOwnProperty("Invulnerable"))
				$("input[name=invulnerable]").prop(`checked`, stringToBool(data.Invulnerable));
			if(data.hasOwnProperty("NoBasePlate"))
				$("input[name=nobaseplate]").prop(`checked`, stringToBool(data.NoBasePlate));
			if(data.hasOwnProperty("NoGravity"))
				$("input[name=nogravity]").prop(`checked`, stringToBool(data.NoGravity));
			if(data.hasOwnProperty("ShowArms"))
				$("input[name=showarms]").prop(`checked`, stringToBool(data.ShowArms));
			if(data.hasOwnProperty("Small"))
				$("input[name=small]").prop(`checked`, stringToBool(data.Small));
			
			if(data.hasOwnProperty("Rotation"))
				$("input[name=rotation]").val(setToInt(data.Rotation[0]));
			
			if(data.hasOwnProperty("Pose")) {
				if(data.Pose.hasOwnProperty("Head")) {
					$("input[name=headX]").val(setToInt(data.Pose.Head[0]));
					$("input[name=headY]").val(setToInt(data.Pose.Head[1]));
					$("input[name=headZ]").val(setToInt(data.Pose.Head[2]));
				}
				if(data.Pose.hasOwnProperty("Body")) {
					$("input[name=bodyX]").val(setToInt(data.Pose.Body[0]));
					$("input[name=bodyY]").val(setToInt(data.Pose.Body[1]));
					$("input[name=bodyZ]").val(setToInt(data.Pose.Body[2]));
				}
				if(data.Pose.hasOwnProperty("LeftLeg")) {
					$("input[name=leftLegX]").val(setToInt(data.Pose.LeftLeg[0]));
					$("input[name=leftLegY]").val(setToInt(data.Pose.LeftLeg[1]));
					$("input[name=leftLegZ]").val(setToInt(data.Pose.LeftLeg[2]));	
				}
				if(data.Pose.hasOwnProperty("RightLeg")) {
					$("input[name=rightLegX]").val(setToInt(data.Pose.RightLeg[0]));
					$("input[name=rightLegY]").val(setToInt(data.Pose.RightLeg[1]));
					$("input[name=rightLegZ]").val(setToInt(data.Pose.RightLeg[2]));
				}
				if(data.Pose.hasOwnProperty("LeftArm")) {
					$("input[name=leftArmX]").val(setToInt(data.Pose.LeftArm[0]));
					$("input[name=leftArmY]").val(setToInt(data.Pose.LeftArm[1]));
					$("input[name=leftArmZ]").val(setToInt(data.Pose.LeftArm[2]));
				}
				if(data.Pose.hasOwnProperty("RightArm")) {
					$("input[name=rightArmX]").val(setToInt(data.Pose.RightArm[0]));
					$("input[name=rightArmY]").val(setToInt(data.Pose.RightArm[1]));
					$("input[name=rightArmZ]").val(setToInt(data.Pose.RightArm[2]));
				}
			}

			if(data.hasOwnProperty("HandItems") || data.hasOwnProperty("ArmorItems")) {
				var setArmor=false;
				if(data.hasOwnProperty("HandItems")) {
					if(data.HandItems[0] !="{}" || data.HandItems[1] !="{}") {
						setArmor=true;
						if(data.HandItems[0] !="{}")
							$(`input[name=equipHandRight]`).val(data.HandItems[0]);
						if(data.HandItems[1] !="{}")
							$(`input[name=equipHandLeft]`).val(data.HandItems[1]);
					}
				}
				if(data.hasOwnProperty("ArmorItems")) {
					if(data.ArmorItems[0] !="{}" || data.ArmorItems[1] !="{}" || data.ArmorItems[2] !="{}" || data.ArmorItems[3] !="{}") {
						setArmor=true;
						if(data.ArmorItems[0] !="{}")
							$(`input[name=equipShoes]`).val(data.ArmorItems[0]);
						if(data.ArmorItems[1] !="{}")
							$(`input[name=equipLeggings]`).val(data.ArmorItems[1]);
						if(data.ArmorItems[2] !="{}")
							$(`input[name=equipChestplate]`).val(data.ArmorItems[2]);
						if(data.ArmorItems[3] !="{}")
							$(`input[name=equipHelmet]`).val(data.ArmorItems[3]);
					}
				}
				$("input[name=useequipment]").prop(`checked`, setArmor);
			}

			if(data.hasOwnProperty("CustomName")) {
				if(data.CustomName.hasOwnProperty("text"))
					$(`#customname`).val(data.CustomName.text);
				if(data.CustomName.hasOwnProperty("bold"))
					$("input[name=namebold]").prop(`checked`, stringToBool(data.CustomName.bold));
				if(data.CustomName.hasOwnProperty("italic"))
					$("input[name=nameitalic]").prop(`checked`, stringToBool(data.CustomName.italic));
				if(data.CustomName.hasOwnProperty("obfuscated"))
					$("input[name=nameobfuscated]").prop(`checked`, stringToBool(data.CustomName.obfuscated));
				if(data.CustomName.hasOwnProperty("strikethrough"))
					$("input[name=namestrikethrough]").prop(`checked`, stringToBool(data.CustomName.strikethrough));
				if(data.CustomName.hasOwnProperty("color"))
					$(`input[name=namecolor]`).val(data.CustomName.color);
			}
			if(data.hasOwnProperty("CustomNameVisible"))
				$(`input[name=showcustomname]`).prop(`checked`, stringToBool(data.CustomNameVisible));

			if(data.hasOwnProperty("DisabledSlots") && data.DisabledSlots != "0") {
				$("input[name=usedisabledslots]").prop(`checked`, true);
				var disabledSlots = reverseDisabled(data.DisabledSlots);
				for(var i of disabledSlots) {
					//remove 1,2,4,8,16,32
					if(i==1 || data.DisabledSlots=="1")
						$(`#dW`).prop(`checked`, true); //weapon
					if(i==2)
						$(`#dB`).prop(`checked`, true); //boots
					if(i==4)
						$(`#dL`).prop(`checked`, true); //leggings
					if(i==8)
						$(`#dC`).prop(`checked`, true); //chestplate
					if(i==16)
						$(`#dH`).prop(`checked`, true); //helmet
					if(i==32)
						$(`#dO`).prop(`checked`, true); //offhand
					//replace 256,512,1024,2048,4096,8192
					if(i==256)
						$(`#rW`).prop(`checked`, true);
					if(i==512)
						$(`#rB`).prop(`checked`, true);
					if(i==1024)
						$(`#rL`).prop(`checked`, true);
					if(i==2048)
						$(`#rC`).prop(`checked`, true);
					if(i==4096)
						$(`#rH`).prop(`checked`, true);
					if(i==8192)
						$(`#rO`).prop(`checked`, true);
					//place 65536,131072,262144,524288,1048576,2097152
					if(i==65536)
						$(`#pW`).prop(`checked`, true);
					if(i==131072)
						$(`#pB`).prop(`checked`, true);
					if(i==262144)
						$(`#pL`).prop(`checked`, true);
					if(i==524288)
						$(`#pC`).prop(`checked`, true);
					if(i==1048576)
						$(`#pH`).prop(`checked`, true);
					if(i==2097152)
						$(`#pO`).prop(`checked`, true);
				}
			}
			handleInput();
			initialized = true;
		} catch (err) {
			console.error(err);
			alert(`An error occurred while loading the ArmorStand.`);
		};
	})});
};