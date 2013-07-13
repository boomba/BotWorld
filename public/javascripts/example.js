
var status = 0;
var health,speed,maxspeed,speedlimit,view,tm,score,hiscore;
var shipX=shipY=0;
var fullscreen,windowHalfX,windowHalfY,windowX,windowY;
var mx=my=0;
var light1,light2;
var sensitivity=1,sen=1,autoswitch=1,controls=0,yinvert=0;
var bdy;
var key_up=key_down=key_left=key_right=key_space=false;

var sens_list = new Array( "low" , "default" , "high" , "very high" , "extreme" );
var sens_values = new Array( 1 , 1.3 , 1.6 , 2 , 4 );

function bind(id){
    var o = document.getElementById(id);
    o.addEventListener( 'click', buttonClick, false );
}

function show(id) {
    var o = document.getElementById(id);
    o.style.display='block';
}

function hide(id) {
    var o = document.getElementById(id);
    o.style.display='none';
}

function html(id,txt) {
    var o = document.getElementById(id);
    o.innerHTML = txt;
}

function gameReset() {
    health = 100;
    speed = 0;
    score = 0;
    status = 1;
    shipX = 0;
    shipY = 0;                  
    view = 1;
    score = 0;
    maxspeed = 52;
    speedlimit = 100;
    zcamera2 = 0;
    
    for ( var i = 0, l = objs.children.length; i < l; i++ ) {
        var obj = objs.children[ i ];
        obj.position.x = Math.random()*5000-2500;
        obj.position.y = -300;                  
    }
    
    html("score",score);
    
    //html("player","<object width='250' height='40' classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' id='gsSong2773678666' name='gsSong2773678666'><param name='movie' value='http://grooveshark.com/songWidget.swf' /><param name='wmode' value='window' /><param name='allowScriptAccess' value='always' /><param name='flashvars' value='hostname=cowbell.grooveshark.com&songIDs=27736786&style=metal&p=1' /><object type='application/x-shockwave-flash' data='http://grooveshark.com/songWidget.swf' width='250' height='40'><param name='wmode' value='window' /><param name='allowScriptAccess' value='always' /><param name='flashvars' value='hostname=cowbell.grooveshark.com&songIDs=27736786&style=metal&p=1' /></object></object>");
    
}

function introReset( gamecompleted ) {
    speed = 0;
    view = 2;
    status = 0;
    hiscore = localStorage.getItem("fk2hiscore");
    if ( hiscore == 0 || hiscore == undefined || hiscore == null ) hiscore = 0;
    
    if ( gamecompleted && hiscore < score ) {
        hiscore = score;
        localStorage.setItem("fk2hiscore", hiscore);
    }
    
    html("score","hi-score "+hiscore);
    hide("hud");
    show("like");
    show("panel1");
    show("feedback");
    html("player","");
}

function onWindowResize(){
    windowX = window.innerWidth;
    windowY = window.innerHeight;
    windowHalfX = windowX / 2;
    windowHalfY = windowY / 2;
    camera.aspect = windowX / windowY;
    camera.updateProjectionMatrix();
    renderer.setSize( windowX, windowY );
    fullscreen = ( windowX == window.outerWidth )
}           

// UI

function get(id,def) {
    var v = localStorage.getItem(id);
    if ( v == undefined || v == null || isNaN(v) ) v = def;
    return parseInt(v);
}

function set(id,v) {
    if ( v == undefined || v == null || isNaN(v) ) v = 0;
    localStorage.setItem(id,v);
}

function buttonClick(e){
    console.log (e.currentTarget.id);
    
    switch ( e.currentTarget.id ) {
        case "start":
            gameReset();
            show("hud");
            show("score");
            hide("like");
            hide("panel1");
            hide("feedback");                       
            break;
            
        case "options":
            hide("panel1");
            show("panel2");
            break;

        case "op_sensitivity":
            sensitivity ++;
            if ( sensitivity > 4 ) sensitivity = 0;
            updateUI();
            break;
            
        case "op_1stperson":
            //autoswitch = !autoswitch;
            autoswitch = 1-autoswitch;
            updateUI();
            break;

        case "op_controls":
            controls = 1-controls;
            updateUI();
            break;

        case "op_yinvert":
            yinvert = 1-yinvert;
            updateUI();
            break;
            
        case "op_close":
            hide("panel2");
            show("panel1");
            break;                      
    
    }
}           

function updateUI(){
    html('op_sensitivity','controls sensitivity : ' + sens_list[sensitivity]);
    sen = sens_values[sensitivity];
    html('op_1stperson','automatic 1st/3th person : ' + ( autoswitch ? "yes" : "no" ) );
    html('op_controls','controls : ' + ( controls == 0 ? "mouse" : "arrows / WASD" ) );
    html('op_yinvert','invert Y axis : ' + ( yinvert == 0 ? "no" : "yes" ) );

    set("fk2sensitivity",sensitivity);
    set("fk2autoswitch",autoswitch);
    set("fk2controls",controls);
    set("fk2yinvert",yinvert);
    
}

function drawSector( centerX , centerY , r , a1 , a2 , color ) {
    ctx.save();

    var startingAngle = a1;
    var arcSize = a2-a1;
    var endingAngle = a2;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, r, startingAngle, endingAngle, false);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, r*0.65, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.fillStyle = "#000000";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, r*0.60, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.fillStyle = "#ff0000";
    ctx.fill();

    
    if ( health > 0 ) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, r*0.60*(health/100), 0, Math.PI*2, false);
        ctx.closePath();
        ctx.fillStyle = "#ffffff";
        ctx.fill();
    }
    
    ctx.restore();
}               

// GEOMETRY/COLORS

function rgbColor(r,g,b){
    return b + (256*g)|0 + (256*256*r)|0;
}           

function generateCubesRing( cubes , y , radius , spreading , depthspread , sizeVariance ){
    // cubes qt.
    // y offset
    // radius
    // spreading
    // objects size variance
    
    var mergedGeo = new THREE.Geometry();   // container

    var geometry = new THREE.CubeGeometry( 10, 10, 10 );
    var mesh = new THREE.Mesh( geometry );
    
    for ( var i = 0; i < cubes ; i++ ) {
        mesh.scale.x = mesh.scale.y = mesh.scale.z = 1+Math.random()*sizeVariance; 
    
        mesh.position.x = Math.cos( i/cubes*Math.PI*2 )*radius + Math.random()* spreading - spreading/2 ;
        mesh.position.y = y + Math.random()* (depthspread);
        mesh.position.z = Math.sin( i/cubes*Math.PI*2 )*radius + Math.random()* spreading - spreading/2;
        
        mesh.rotation.x = Math.random() * 360 * ( Math.PI / 180 );
        mesh.rotation.y = Math.random() * 360 * ( Math.PI / 180 );
        THREE.GeometryUtils.merge(mergedGeo, mesh);
    }
    
    return mergedGeo;

}

function generateObstacle(){
    var geometry    = new THREE.SphereGeometry( 50, 5 , 3 );
    
    var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 150, opacity:1 , shading: THREE.FlatShading } );
    var mesh = new THREE.Mesh( geometry, material );
    
    mesh.matrixAutoUpdate = true;
    mesh.updateMatrix();
    objs.add( mesh );

    return mesh;

}           

function generateShip(){
    var mergedGeo;
    mergedGeo = new THREE.Geometry();

    var geometry_cube = new THREE.CubeGeometry( 50, 50, 50 );
    var geometry_cyl = new THREE.CylinderGeometry( 50, 20, 50 , 8 , 1 );
    var geometry_cyl2 = new THREE.CylinderGeometry( 50, 40, 50 , 4 , 1 );
    
    var material = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff, shininess: 50, opacity:1 , shading: THREE.FlatShading } );

        // Building the space ship, LEGO style!
        
        var mesh = new THREE.Mesh( geometry_cube, material );
        var mesh2 = new THREE.Mesh( geometry_cyl, material );
        var mesh3 = new THREE.Mesh( geometry_cyl2, material );

        // body
        mesh2.position.x = 0;
        mesh2.position.y = 0;
        mesh2.position.z = 0;
        mesh2.rotation.x = Math.PI/2;
        mesh2.rotation.y = Math.PI/2;
        mesh2.scale.x = 0.25; 
        THREE.GeometryUtils.merge(mergedGeo, mesh2);

        // siedewings
        mesh3.position.x = 0;
        mesh3.position.y = 0;
        mesh3.position.z = 16;
        mesh3.rotation.x = Math.PI/2;
        mesh3.rotation.y = Math.PI/2;
        mesh3.scale.x = 0.1;
        mesh3.scale.y = 0.5;
        mesh3.scale.z = 1.6;
        THREE.GeometryUtils.merge(mergedGeo, mesh3);

        // wings up
        mesh.position.y = 15;
        mesh.position.z = 12;
        mesh.scale.x = 0.015; 
        mesh.scale.y = 0.4; 
        mesh.scale.z = 0.25;
        mesh.rotation.y = 0;
        mesh.rotation.x = -Math.PI/10;

        mesh.position.x = 20;
        mesh.rotation.z = -Math.PI/20;
        THREE.GeometryUtils.merge(mergedGeo, mesh);
        
        mesh.position.x = -20;
        mesh.rotation.z = Math.PI/20;
        THREE.GeometryUtils.merge(mergedGeo, mesh);
        
    
    mergedGeo.computeFaceNormals();
    var group = new THREE.Mesh( mergedGeo, material );
    group.matrixAutoUpdate = true;
    group.updateMatrix();
    
    scene.add( group );

    scale = 0.08;
    var enginepng = THREE.ImageUtils.loadTexture( "engine_small.png" );
    
    engine_lt = new THREE.Sprite( { map:enginepng, useScreenCoordinates:false } );
    engine_lt.position.set( -20 , 0 , 35 );
    engine_lt.scale.set( scale, scale, scale );
    engine_lt.blending = THREE.AdditiveBlending;
    group.add( engine_lt );
    
    engine_rt = new THREE.Sprite( { map:enginepng, useScreenCoordinates:false } );
    engine_rt.position.set( 20 , 0 , 35 );
    engine_rt.scale.set( scale, scale, scale );
    engine_rt.blending = THREE.AdditiveBlending;
    group.add( engine_rt );
    
    return group;

}           

// INPUT

function keyDown( event ) {
    //console.log(event.keyCode);
    switch("keyDown ", event.keyCode ) {
        case 38:
        case 87:
            key_up = true; break;
        case 40:
        case 83:
            key_down = true; break;
        case 37:
        case 65:
            key_left = true; break;
        case 39:
        case 68:
            key_right = true; break;
        case 27:// ESC
            materials.opacity = 0;
            bdy.style.backgroundColor = '#000';
            introReset(false);
            break;
        case 67:// C
            console.log("C");
            //var tempcanvas = document.getElementsByTagName("canvas");
            //window.open(tempcanvas[1].toDataURL('image/png'))
            
            /*
            var new_window = window.open( 'about:blank' );
            var image = new_window.document.createElement( 'img' );
            image.src = renderer.domElement.toDataURL();
            new_window.document.body.appendChild( image );                      
            */
            
            break;
            
    }
}

function keyUp( event ) {
    switch( event.keyCode ) {
        case 38:
        case 87:
            key_up = false; break;
        case 40:
        case 83:
            key_down = false; break;
        case 37:
        case 65:
            key_left = false; break;
        case 39:
        case 68:
            key_right = false; break;
    }
}

function keyPress( event ) {
    switch (event.keyCode) {
        case 32://space
            if ( view == 2 ) {
                view = 1;
                zcamera2 = 0;
            } else {
                view = 2;
                zcamera2 = -220;
            }
            break;
        case 102: // f
            var stpos = stats.domElement.style.top;
            if ( stpos == "0px" ) {
                stats.domElement.style.top = "-200px"
            } else {
                stats.domElement.style.top = "0px"
            }
            break;
    }
}

function onDocumentMouseMove(event) {
    mouseX = ( event.clientX - windowHalfX ) / windowX * 2;
    mouseY = ( event.clientY - windowHalfY ) / windowY * 2;
}


