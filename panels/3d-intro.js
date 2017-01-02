/*
   3d-intro.js
   Implements a flashy 3D display for a given DTV chat user
   Meant to be used as a theme briefly, then back to normal theme
*/
      // Globals
      // -----------------------------------------
      // Own timer for Ajax command checks
      var oTimer;
      var iTimerDelay = 30;
      var sServerMsg = "";  // ajax via controller.js
      var sShoutoutName = "DronesoundTV"; // From external
      // Camera and cam motion
      var fRotRateX = 0.008; var fRotRateY = 0.013;  // Disused
      var fCamRange = 2.5; // Max distance from home
      var fCamTime = 4000;   // Tween time ms larger is slower
      var bCamFree = true;   // If false, looks at oLookAt

      // Where cam centered, starts from
      var oCamHome = {
        x : 0, 
        y : 0.30, 
        z : 1.0
      };

      var oCamPos = oCamHome;  // Start at home
      var oCamGo = {
        x : Math.random() * fCamRange - fCamRange / 2, 
        y : Math.random() * fCamRange - fCamRange / 2, 
        z : Math.random() * fCamRange - fCamRange / 2 
      };

      var oLookHome = {
        x: 0,
        y: oCamHome.y - 3,
        z: -4.0
      };

      var oLookAt = oLookHome;
      var fLookRange = 0.5;
      // Scene, Objects
      var scene, renderer, camera, boxGeom, flatGeom;
      var oGroundMat, oGround;
      var cube, boxMat, boxTex, boxTexOff;
      var iSkyRadius = 80;
      var oPlantMaterial;  // Plants
      var oPlants = [];    // Array of plants
      var iPlantCount = 3; // How many plants      
      var fPlantRange = 8;  // Max range from center for plants
      var iSphereFaces = 12; // Smaller performs better
      // Fonts and text stuff
      var oGlobalFont;      // See fnLoadFont
      var oGlobalText = "DronesoundTV",
	// font = undefined,	// SHOULDNT THIS BE oGlobalFont ??
        // See also: helvetiker, optimer, gentilis, droid sans, droid serif
	// fontName = "optimer",
	fontWeight = "bold";    // End compound definition
      
      // Lights
      var oAmbientLight, oPointLight;
      // Foliage texture files/urls/colors in SERVER relative paths
      var sTextures = new Array ( 
        "/assets/fg-foliage-001-white.png",
        "/assets/fg-foliage-002-white.png",
        "/assets/fg-foliage-003-white.png",         
        "/assets/fg-foliage-004.png",
        "/assets/fg-foliage-005.png",
        "/assets/fg-foliage-006.png",
        "/assets/fg-foliage-007.png",
        "/assets/fg-foliage-008.png"
      );
      // Colors for foliage
      var sColors = new Array (
        0xa2f27d, 0x295415, 0x0b6b2b, 0x08682e,  // Greenish
        0xf9cb6d, 0xf9f76d, 0xa2bff2, 0xffffff   // Others
      );
        
      // Seedable PRNG as object
      // Webkit2's crazy invertible mapping generator
      // var seed = 1234;
      var fnRand = (function() {
        var max = Math.pow(2, 32), seed;
          return {
            setSeed : function(val) {
              seed = val || Math.round(Math.random() * max);
            },
            getSeed : function() { return seed; },
            random : function() {
              // creates randomness...somehow...
              seed += (seed * seed) | 5;
              // Shift off bits, discard sign. Discard is
              // important, OR w/ 5 can give us + or - numbers.
              return (seed >>> 32) / max;
            }
          };
      }()); // End fnRand as object
        
      // Setup
      function fnInit() {
        // Add event listener to resize renderer with browser
        window.addEventListener ('resize', function() {
          var WIDTH = window.innerWidth, HEIGHT = window.innerHeight;
          renderer.setSize(WIDTH, HEIGHT);
          renderer.setClearColor(0x00ff00); // NOTE! BG set green screen! 
          camera.aspect = WIDTH / HEIGHT;
          camera.updateProjectionMatrix();
        });  // End listener		  

      }      // End function
    
      // Timer to check for ajax object inserts
      // Note: Duplicated in controller.js, fix that
      // Perform per-cycle work here
      function fnTimer () {
        // Test: If server buffer differs at all, insert object
        var sTemp = fnServerBufferRead(); // from controller.js 
        if (sTemp.indexOf(sServerMsg) == -1) {
          fnObjectAdd();
          fnLog ("3d: Object added via server.");
        }
        fnServerBufferClear();  // Clear taxi (controller.js)
        // Reinstate single-fire timer, see ya soon
        oTimer = setTimeout (fnTimer, iTimerDelay);
      }

      // -----------------------------------------------
      // Font functions mostly stolen from three.js
      // To do: Move to dtv-fonts.js - see also assets/*.json
      // Arg is FULL font file local url, ie
      //  assets/droid_serif_regular.typeface.json
      // -----------------------------------------------
     
      // New! MakeText both loads font and handles mesh
      // AND position, so it can be called from the page 
      // Load font to global oGlobalFont, create argText mesh
      // Args x, y, z are center position of text
      function fnMakeText (argFontURL, argText, argX, argY, argZ) {
        var loader = new THREE.FontLoader();
	loader.load (
          argFontURL,
          function (response) {
	    oGlobalFont = response;
            // Create mesh only when ready
            fnCreateText (argText, argX, argY, argZ); // Fwd args
   	  }                   // End inner anon function
        );                    // End .load
      }                       // End function

      // Add text to scene (AFTER font loaded see fnLoadFont)
      // To do: parameterize everything
      // Function: Create text after font loaded (from threejs.org)
      // To do: take args instead of globs
      function fnCreateText (argText, argX, argY, argZ) {
        // Temporary local material, make settable later
        // MeshNormalMaterial
        // Hi perf // var tempMat = new THREE.MeshBasicMaterial({
        var tempMat = new THREE.MeshLambertMaterial({
            map: null, 
            shading: THREE.FlatShading,
            // wireframe: true,
            // wireframeLinewidth: 5.0,
            color: 0xffffff,
            refractionRatio: 0
        });
        // Note textGeo is local only, no later reference!
        var textGeo = new THREE.TextGeometry (
          argText,             // Should be
          {
            font: oGlobalFont,
            size: 0.5,
            height: 0.05,            // Should be called 'depth'
            curveSegments: 2,       // Fewer is faster
            bevelEnabled: false,    // Bevel disabled
            material: tempMat, 
            extrudeMaterial: 0      // Q: wtf is this?
          }                         // End TextGeo props
        );	                    // End geometry 

        textGeo.computeBoundingBox();		// Superfluous?
        textGeo.computeVertexNormals();

        // Figure center of text
        var centerOffset = -0.5 * (
          textGeo.boundingBox.max.x - textGeo.boundingBox.min.x
        );
    
        // Create and add mesh (note local scope)
        var textMesh1 = new THREE.Mesh (textGeo, tempMat);
        textMesh1.position.x = argX + centerOffset;    // Center text
        // textMesh1.position.y = 1.8;		
        textMesh1.position.y = argY;		
        // textMesh1.position.z = -2.9;
        textMesh1.position.z = argZ;
        textMesh1.rotation.x = 0;
        textMesh1.rotation.y = Math.PI * 2;	// Turn to face south
    
        // Add to (glob) scene
        fnLog ("3d: Text added to scene");
        scene.add (textMesh1);

      } // End function fnCreateText
 
      // Add object to scene in response to ajax msg
      // (see also controller.js:fnObjectAdd_3D)
      function fnObjectAdd() {
        fnLog ("3D: fnObjectAdd entered");  // from controller.js
        var tempTexOff = 0.00;   // Local
        // TO DO: Load specified (user) image:
        var tempTex = THREE.ImageUtils.loadTexture ("/requestor.jpg");
        // Disused? // boxTex.needsUpdate = true;
        var tempMat = new THREE.MeshBasicMaterial({map: tempTex});
        var tempObj = new THREE.Mesh (
          new THREE.SphereGeometry (0.25, iSphereFaces, iSphereFaces ), 
          tempMat);
        tempObj.position.y = Math.random() * 2 + 0.5; // Altitude
        tempObj.position.x = Math.random() * 8 - 4;
        tempObj.position.z = Math.random() * 8 - 4;
        tempObj.rotation.y = - Math.PI / Math.random() * 2;        
        tempObj.rotation.z = - Math.PI / Math.random() * 2;        
        scene.add (tempObj); 
      }

      // Function: Add the 'skybox'
      function fnSkybox() {

        // Broken: Sky to encompass entire scene
        var oSkyTex = THREE.ImageUtils.loadTexture ("/assets/sky-00.jpg");
        var oSkyObj = new THREE.Mesh (
          new THREE.PlaneGeometry (32, 32), 
          new THREE.MeshBasicMaterial(
            { map: oSkyTex, shading: THREE.FlatShading, refractionRatio: 0 }
          )
        );
        oSkyObj.doubleSided = false;
        oSkyObj.position.x = 0;
        oSkyObj.position.y = 15.15;  // Kludged to match texture
        oSkyObj.position.z = -16;
        scene.add (oSkyObj);

        var oSkyDupe = oSkyObj.clone (true);
        oSkyDupe.position.x = -16;
        oSkyDupe.position.z = 0;
        oSkyDupe.rotation.y = Math.PI * 0.5;        
        scene.add (oSkyDupe);

        var oSkyDupe = oSkyObj.clone (true);  // Re-clone skyObj
        oSkyDupe.position.x = 16;
        oSkyDupe.position.z = 0;
        oSkyDupe.rotation.y = Math.PI * -0.5;        
        scene.add (oSkyDupe);
      }

      // Function: Add a single foliage plant to (global) scene
      // Random pos, rot and texture, color (from array of)
      function fnPlantAdd () {
        fnLog ("3d: Adding plant");
        var iTexNum = Math.round(Math.random() * 7);  // WARE hardwired array len
        var oTempTex = THREE.ImageUtils.loadTexture (sTextures[iTexNum]);
        var iColor = sColors[Math.round (Math.random() * 8)]; // Rand color
        var oTempObj = new THREE.Mesh (
          new THREE.PlaneGeometry (1.2, 1.0),
          // new THREE.MeshBasicMaterial ({
          new THREE.MeshLambertMaterial ({
            map: oTempTex, 
            color: iColor,
            transparent: true,        // For alpha ch
            opacity: 0.85,            // Nice effect 
            shading: THREE.SmoothShading
          })                       // End Mesh material
        );                         // End Mesh

        oTempObj.position.x = Math.random() * fPlantRange - fPlantRange / 2;
        oTempObj.position.y = 0.55; // Half way up means nothing underground
        oTempObj.position.z = Math.random() * fPlantRange - fPlantRange / 2;
        // Disabled // oTempObj.rotation.y = - Math.PI / Math.random() * 2;        
        scene.add (oTempObj);    // Add it to the scene
      }

      // Function: Add a 'stage', backing with other elements
      function fnStage (argImageURL) {
        var oTempTex = THREE.ImageUtils.loadTexture (argImageURL);
        var oTempObj = new THREE.Mesh (
          new THREE.PlaneGeometry (64, 64), 
          new THREE.MeshBasicMaterial ({
            map: oTempTex,
            fog: false,
            shading: THREE.FlatShading,
            refractionRatio: 0
          })                          // End material def
        );                            // End mesh
        oTempObj.doubleSided = false;
        oTempObj.position.x = 0;
        oTempObj.position.y = 0;      // Center height
        oTempObj.position.z = -3.0;     // Slightly behind center stage
        scene.add (oTempObj);         // ADD TO SCENE
      }

      // Function: fnShoutout
      // Adds, changes, removes 'shoutout' area
      // To do: Generalize to a "add plane here", w/fnStage
      function fnShoutout (argImageURL) {
       // Currently using a flat plane
       var sTempTex = THREE.ImageUtils.loadTexture (argImageURL);
       var sTempMat = new THREE.MeshBasicMaterial({map: sTempTex});
       var oTempObj = new THREE.Mesh (
         new THREE.PlaneGeometry (1, 1),
         sTempMat
       );
       oTempObj.position.y = 1.0;
       oTempObj.position.z = -2.9;  // JUST in front of back
       oTempObj.doubleSided = false;

       // For now, only adds
       scene.add (oTempObj); 
      }

      // Function: Render called on frame update
      function render() {
        requestAnimationFrame (render);     // Req frame update
        // cube.rotation.x += fRotRateX;    // Ex: move stuff
        // cube.rotation.y += fRotRateY;
        // Update wandering camera
        fnCameraAnim();
        // fnTextureAnim();  // Broke?
        renderer.render (scene, camera);    // Update
      }
    	  
      // DISUSED: Model loader
      // Load Blender-exported ThreeJS file
      function fnLoadModel() {
        // Load in the mesh and add it to the scene.
        var loader = new THREE.JSONLoader();
        loader.load( "models/BLENDEREXPORTMODEL.js", 
          function (geometry) {
            var material = 
              new THREE.MeshLambertMaterial({color: 0x99FF44});
            mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
          }
        );  // End loader
      }     // End function
     
      // Texture animations
      function fnTextureAnim() {
        // textureCanvas.offset.set(textureOffset += .001,0);
        boxTexOff += 0.01;
        oBoxTex.offset.set (boxTexOff, 0);
      }
     
      // Camera: Update camera tween,
      // or start a random tween if inactive
      function fnCameraAnim() {      
        // Update tween if cam not at cam go
        if (camera.position != oCamGo) {
          TWEEN.update();
          return;         // Done here, shunt
        }
      }                   // end function
          
      function fnCameraRand() { 
        // No cam tween active, set new target
        oCamGo.x = oCamHome.x + Math.random() * fCamRange - fCamRange / 2;
        // Limit to pos altitude
        oCamGo.y = oCamHome.y + Math.random() * fCamRange * 0.25;
        oCamGo.z = oCamHome.z 
          + 0.5 * (Math.random() * fCamRange - fCamRange / 2);  // Limit Z

        // Look at new destination
        // if (Math.round (Math.random() * 3) == 0) {
        //  oLookAt = oCamGo;
        // } else {
          oLookAt.x = 0;
          oLookAt.y = 0;
          oLookAt.z = 0;
        // }

        // Sometimes set a new look at
        if (Math.round (Math.random() * 3) == 0) {
          oLookAt.x = Math.random() * fLookRange.x - fLookRange.x / 2;
          oLookAt.y = Math.random() * fLookRange.y - fLookRange.y / 2;
          oLookAt.z = Math.random() * fLookRange.z - fLookRange.z / 2;
        } 
    
        oCamPos = camera.position;
        // Do NOT reinstantiate Tween:
        oTween = new TWEEN.Tween(oCamPos).to(oCamGo, fCamTime); 
        // Hook tween callback to position update
        oTween.onUpdate (function() {
          camera.position.x = oCamPos.x;
          camera.position.y = oCamPos.y;
          camera.position.z = oCamPos.z;
          if (bCamFree == false) {    // If cam locked
            camera.lookAt (oLookAt);  // Stick look at
          }
        });
    
        oTween.onComplete (function() {
          fnCameraRand();            // On tween finished
        });
            
        oTween.start();              // (Re) start tween
      }                              // End fnCameraRand
    
      // Kludge: Setter/getter for shoutout name
      function fnSetShoutout (sArgName) {
        sShoutoutName = sArgName;
        fnLog ("3d-intro.js: sShoutoutName set to " + sArgName);
      }
 
      // Mainline
      // -----------------------------------------      
      fnInit();                     // Incl. resize listener
      fnRand.setSeed (1518);        // New seedable prng 
          
      // Set up 3d scene - note cam parm 0 is focal len
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera (
        50, window.innerWidth/window.innerHeight, 0.1, 1000
       );
      camera.position = oCamPos; 

      // fnSkybox(); // Add skybox
      fnStage("/assets/sky.jpg");
    
      // Light sources
      oAmbientLight = new THREE.AmbientLight (0x444444); 
      scene.add (oAmbientLight);
      // Point light just in front of title text
      oPointLight = new THREE.PointLight (0xffffff, 0.5, 100, 2);
      oPointLight.position.set (0, 0, 2.9);
      scene.add (oPointLight);
            
      // Set up render/page, add the scene to dom
      renderer = new THREE.WebGLRenderer();
      renderer.setSize (window.innerWidth, window.innerHeight);
      document.body.appendChild (renderer.domElement);
    
      // Object: Box with image texture
      /*
      boxGeom = new THREE.BoxGeometry (1, 1, 1);
      boxTexOff = 0.00;   // Glob texture offset
      boxTex = THREE.ImageUtils.loadTexture ("/requestor.jpg");
      // boxTex.needsUpdate = true;
      boxMat = new THREE.MeshBasicMaterial({map: boxTex});
      cube = new THREE.Mesh (boxGeom, boxMat);
      cube.position.y = 0.5;
      scene.add (cube); 
      */
      fnShoutout ("/requestor.jpg");

      // PLANTS: Add iPlantCount randomized foliage 
      for (var i=0; i < iPlantCount; i++) {
        fnPlantAdd();
      } 

      // (Disused here) New chat lobby user bubbles with profile images!
      // Note sLobbyImageList from chatlobby.jsp via PanelServerRefresh
      // CHAT LOBBY LIST DISABLED with fake condition 
      if (sLobbyImageList && 1 == 0) {
        var iCount = 0;     // For figuring position
        var aChatters = sLobbyImageList.split (" ");
        fnLog ("3d: Split sLobbyImageList (" + sLobbyImageList + ")");

        // Iterate chat user pics, generating objects for each
        aChatters.forEach(function(argItem, argIndex) {
          fnLog ("3d: Insert chatter " + argIndex + " / " + argItem);
          // MOVE to fnAddChatter - Note cludge to server path
          var oChatterTex = THREE.ImageUtils.loadTexture ("/" + argItem);
          var oChatterObj = new THREE.Mesh (
            new THREE.SphereGeometry (0.40, iSphereFaces, iSphereFaces ),
            new THREE.MeshBasicMaterial ({
              map: oChatterTex, 
              reflectivity: 0, 
              transparent: true,
              opacity: 1.0,
              shading: THREE.SmoothShading  // Alt: FlatShading
            })                       // End Mesh material
          );                         // End Mesh

          // Line chatters up in a X-wide row, in Y-sized spacing
          oChatterObj.position.x = 
            1.3 * iCount - 1.3 * 2;  // TO DO: Proper adjust
          oChatterObj.position.y = 0;
          oChatterObj.position.z = -2; // Just put in row
          // Rotate to face camera
          oChatterObj.rotation.y = - Math.PI * 0.25;
          scene.add (oChatterObj);   // Obj gets reused for each 
          iCount++;
        });                          // End foreach
      }                              // End if

      // New: Test font! Note load from server absolute path
      // Note: Loads to oGlobalFont, arg 2 is text to display
      /* Moved to page
        fnLoadFont ( "/assets/droid_sans_regular.typeface.json",
          sShoutoutName    // From external);
      */

      // Tween setups
      var oTween = new TWEEN.Tween(oCamPos).to(oCamGo, fCamTime);
      var oTween;       // Instantiated in fnCameraRand
      fnCameraRand();   // Starts/restarts random tweens
    
      // Start renderer
      render();              // Repeats on clock


