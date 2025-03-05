class Lighting {
    constructor(gl) {
        this.gl = gl;
        
        // Light sources
        this.pointLight = {
            position: new Vector3([0, 10, 0]),
            color: [1.0, 1.0, 1.0],
            enabled: true,
            cube: new Cube()  // Visual representation of light
        };
        
        this.spotLight = {
            position: new Vector3([5, 10, 5]),
            direction: new Vector3([0, -1, 0]),  // Points downward
            color: [1.0, 0.8, 0.4],  // Warmer color for spot light
            cutoff: Math.cos(Math.PI / 6),  // 30 degrees
            enabled: false,
            cube: new Cube()  // Visual representation of light
        };
        
        // Ambient light parameters
        this.ambientLight = [0.2, 0.2, 0.3];
        
        // Material properties
        this.specularPower = 32.0;
        
        // Animation settings
        this.lightAngle = 0;
        this.rotationRadius = 8;
        this.animate = false;
        
        // Toggle flags
        this.lightingEnabled = true;
        this.showNormals = false;
        
        // Configure light cubes
        this._configurePointLightCube();
        this._configureSpotLightCube();
    }
    
    // Configure point light cube appearance
    _configurePointLightCube() {
        this.pointLight.cube.color = this.pointLight.color.concat(1.0);
        this.pointLight.cube.textureNum = -2;  // Solid color
    }
    
    // Configure spot light cube appearance
    _configureSpotLightCube() {
        this.spotLight.cube.color = this.spotLight.color.concat(1.0);
        this.spotLight.cube.textureNum = -2;  // Solid color
    }
    
    // Update light positions for animation
    update(deltaTime) {
        if (this.animate) {
            this.lightAngle += 0.01;
            
            // Update point light position in a circle
            this.pointLight.position.elements[0] = Math.cos(this.lightAngle) * this.rotationRadius;
            this.pointLight.position.elements[2] = Math.sin(this.lightAngle) * this.rotationRadius;
            
            // Make light move up and down a bit
            this.pointLight.position.elements[1] = 8 + Math.sin(this.lightAngle * 2) * 3;
        }
    }
    
    // Render light cubes
    renderLights(viewMatrix, projectionMatrix, globalRotateMatrix) {
        if (this.pointLight.enabled) {
            // Draw point light cube
            this.pointLight.cube.matrix.setIdentity();
            this.pointLight.cube.matrix.translate(
                this.pointLight.position.elements[0],
                this.pointLight.position.elements[1],
                this.pointLight.position.elements[2]
            );
            this.pointLight.cube.matrix.scale(0.5, 0.5, 0.5);  // Small cube
            this.pointLight.cube.render();
        }
        
        if (this.spotLight.enabled) {
            // Draw spot light cube
            this.spotLight.cube.matrix.setIdentity();
            this.spotLight.cube.matrix.translate(
                this.spotLight.position.elements[0],
                this.spotLight.position.elements[1],
                this.spotLight.position.elements[2]
            );
            this.spotLight.cube.matrix.scale(0.3, 0.6, 0.3);  // Elongated cube to indicate direction
            this.spotLight.cube.render();
        }
    }
    
    // Set lighting uniforms for the shaders
    setUniforms(gl, program) {
        // Create uniform locations if not yet created
        if (!this.uniformLocations) {
            this.uniformLocations = {
                pointLightPosition: gl.getUniformLocation(program, 'u_PointLightPosition'),
                pointLightColor: gl.getUniformLocation(program, 'u_PointLightColor'),
                spotLightPosition: gl.getUniformLocation(program, 'u_SpotLightPosition'),
                spotLightDirection: gl.getUniformLocation(program, 'u_SpotLightDirection'),
                spotLightColor: gl.getUniformLocation(program, 'u_SpotLightColor'),
                ambientLight: gl.getUniformLocation(program, 'u_AmbientLight'),
                specularPower: gl.getUniformLocation(program, 'u_SpecularPower'),
                spotCutoff: gl.getUniformLocation(program, 'u_SpotCutoff'),
                lightingOn: gl.getUniformLocation(program, 'u_LightingOn'),
                showNormals: gl.getUniformLocation(program, 'u_ShowNormals'),
                pointLightOn: gl.getUniformLocation(program, 'u_PointLightOn'),
                spotLightOn: gl.getUniformLocation(program, 'u_SpotLightOn'),
                cameraPosition: gl.getUniformLocation(program, 'u_CameraPosition')
            };
        }
        
        // Set uniform values
        gl.uniform3fv(this.uniformLocations.pointLightPosition, this.pointLight.position.elements);
        gl.uniform3fv(this.uniformLocations.pointLightColor, this.pointLight.color);
        gl.uniform3fv(this.uniformLocations.spotLightPosition, this.spotLight.position.elements);
        gl.uniform3fv(this.uniformLocations.spotLightDirection, this.spotLight.direction.elements);
        gl.uniform3fv(this.uniformLocations.spotLightColor, this.spotLight.color);
        gl.uniform3fv(this.uniformLocations.ambientLight, this.ambientLight);
        gl.uniform1f(this.uniformLocations.specularPower, this.specularPower);
        gl.uniform1f(this.uniformLocations.spotCutoff, this.spotLight.cutoff);
        gl.uniform1i(this.uniformLocations.lightingOn, this.lightingEnabled);
        gl.uniform1i(this.uniformLocations.showNormals, this.showNormals);
        gl.uniform1i(this.uniformLocations.pointLightOn, this.pointLight.enabled);
        gl.uniform1i(this.uniformLocations.spotLightOn, this.spotLight.enabled);
    }
    
    // Set UI controls for lighting
    setupControls() {
        // Add lighting UI elements to the DOM
        const controls = document.getElementById('controls');
        
        const lightingControls = document.createElement('div');
        lightingControls.innerHTML = `
            <h3>Lighting Controls</h3>
            <div>
                <button id="toggleLighting">Toggle Lighting</button>
                <button id="toggleNormals">Show Normals</button>
                <button id="togglePointLight">Toggle Point Light</button>
                <button id="toggleSpotLight">Toggle Spotlight</button>
                <button id="toggleAnimation">Toggle Light Animation</button>
            </div>
            <div>
                <label for="pointLightX">Point Light X: </label>
                <input type="range" id="pointLightX" min="-20" max="20" value="0" step="0.5">
                <span id="pointLightXValue">0</span>
            </div>
            <div>
                <label for="pointLightY">Point Light Y: </label>
                <input type="range" id="pointLightY" min="0" max="20" value="10" step="0.5">
                <span id="pointLightYValue">10</span>
            </div>
            <div>
                <label for="pointLightZ">Point Light Z: </label>
                <input type="range" id="pointLightZ" min="-20" max="20" value="0" step="0.5">
                <span id="pointLightZValue">0</span>
            </div>
            <div>
                <label for="spotLightX">Spot Light X: </label>
                <input type="range" id="spotLightX" min="-20" max="20" value="5" step="0.5">
                <span id="spotLightXValue">5</span>
            </div>
            <div>
                <label for="spotLightY">Spot Light Y: </label>
                <input type="range" id="spotLightY" min="0" max="20" value="10" step="0.5">
                <span id="spotLightYValue">10</span>
            </div>
            <div>
                <label for="spotLightZ">Spot Light Z: </label>
                <input type="range" id="spotLightZ" min="-20" max="20" value="5" step="0.5">
                <span id="spotLightZValue">5</span>
            </div>
            <div>
                <label for="ambientIntensity">Ambient Intensity: </label>
                <input type="range" id="ambientIntensity" min="0" max="1" value="0.2" step="0.05">
                <span id="ambientIntensityValue">0.2</span>
            </div>
            <div>
                <label for="pointLightR">Point Light R: </label>
                <input type="range" id="pointLightR" min="0" max="1" value="1.0" step="0.05">
            </div>
            <div>
                <label for="pointLightG">Point Light G: </label>
                <input type="range" id="pointLightG" min="0" max="1" value="1.0" step="0.05">
            </div>
            <div>
                <label for="pointLightB">Point Light B: </label>
                <input type="range" id="pointLightB" min="0" max="1" value="1.0" step="0.05">
            </div>
        `;
        controls.appendChild(lightingControls);
        
        // Setup event listeners
        document.getElementById('toggleLighting').addEventListener('click', () => {
            this.lightingEnabled = !this.lightingEnabled;
        });
        
        document.getElementById('toggleNormals').addEventListener('click', () => {
            this.showNormals = !this.showNormals;
        });
        
        document.getElementById('togglePointLight').addEventListener('click', () => {
            this.pointLight.enabled = !this.pointLight.enabled;
        });
        
        document.getElementById('toggleSpotLight').addEventListener('click', () => {
            this.spotLight.enabled = !this.spotLight.enabled;
        });
        
        document.getElementById('toggleAnimation').addEventListener('click', () => {
            this.animate = !this.animate;
        });
        
        // Point light position sliders
        document.getElementById('pointLightX').addEventListener('input', (e) => {
            this.pointLight.position.elements[0] = parseFloat(e.target.value);
            document.getElementById('pointLightXValue').textContent = e.target.value;
        });
        
        document.getElementById('pointLightY').addEventListener('input', (e) => {
            this.pointLight.position.elements[1] = parseFloat(e.target.value);
            document.getElementById('pointLightYValue').textContent = e.target.value;
        });
        
        document.getElementById('pointLightZ').addEventListener('input', (e) => {
            this.pointLight.position.elements[2] = parseFloat(e.target.value);
            document.getElementById('pointLightZValue').textContent = e.target.value;
        });
        
        // Spot light position sliders
        document.getElementById('spotLightX').addEventListener('input', (e) => {
            this.spotLight.position.elements[0] = parseFloat(e.target.value);
            document.getElementById('spotLightXValue').textContent = e.target.value;
        });
        
        document.getElementById('spotLightY').addEventListener('input', (e) => {
            this.spotLight.position.elements[1] = parseFloat(e.target.value);
            document.getElementById('spotLightYValue').textContent = e.target.value;
        });
        
        document.getElementById('spotLightZ').addEventListener('input', (e) => {
            this.spotLight.position.elements[2] = parseFloat(e.target.value);
            document.getElementById('spotLightZValue').textContent = e.target.value;
        });
        
        // Ambient intensity slider
        document.getElementById('ambientIntensity').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.ambientLight = [value, value, value];
            document.getElementById('ambientIntensityValue').textContent = value.toFixed(2);
        });
        
        // Point light color sliders
        document.getElementById('pointLightR').addEventListener('input', (e) => {
            this.pointLight.color[0] = parseFloat(e.target.value);
            this._configurePointLightCube();
        });
        
        document.getElementById('pointLightG').addEventListener('input', (e) => {
            this.pointLight.color[1] = parseFloat(e.target.value);
            this._configurePointLightCube();
        });
        
        document.getElementById('pointLightB').addEventListener('input', (e) => {
            this.pointLight.color[2] = parseFloat(e.target.value);
            this._configurePointLightCube();
        });
    }
}