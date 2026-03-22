class HexagonCanvas {
    constructor() {
        // Grid state
        this.hexagons = [];
        this.gridWidth = 10;
        this.gridHeight = 8;
        this.hexSize = 50;
        
        // Style settings
        this.hexOnColor = '#4a90d9';
        this.hexOffColor = '#e0e0e0';
        this.hexBorderColor = '#333333';
        this.textColor = '#ffffff';
        this.bgColor = '#ffffff';
        this.borderWidth = 0.5;
        this.hexGap = 2;
        this.fontFamily = 'Arial, sans-serif';
        this.showInactiveHex = true;
        this.textSize = 12;
        
        // Currently editing hexagon
        this.editingHex = null;
        
        // DOM elements
        this.gridContainer = document.getElementById('hexGrid');
        this.textModal = document.getElementById('textModal');
        this.textInput = document.getElementById('hexTextInput');
        
        this.init();
    }
    
    init() {
        this.loadStateFromURL();
        this.bindControls();
        this.generateGrid();
        this.applyStateToUI();
    }
    
    bindControls() {
        // Grid size
        document.getElementById('gridWidth').addEventListener('change', (e) => {
            this.gridWidth = parseInt(e.target.value) || 10;
        });
        document.getElementById('gridHeight').addEventListener('change', (e) => {
            this.gridHeight = parseInt(e.target.value) || 8;
        });
        document.getElementById('regenerateGrid').addEventListener('click', () => {
            this.generateGrid();
        });
        
        // Hexagon size
        const hexSizeSlider = document.getElementById('hexSize');
        const hexSizeValue = document.getElementById('hexSizeValue');
        hexSizeSlider.addEventListener('input', (e) => {
            this.hexSize = parseInt(e.target.value);
            hexSizeValue.textContent = this.hexSize;
            this.updateGridStyles();
        });
        
        // Colors
        document.getElementById('hexOnColor').addEventListener('input', (e) => {
            this.hexOnColor = e.target.value;
            this.updateHexagonColors();
        });
        document.getElementById('hexOffColor').addEventListener('input', (e) => {
            this.hexOffColor = e.target.value;
            this.updateHexagonColors();
        });
        document.getElementById('hexBorderColor').addEventListener('input', (e) => {
            this.hexBorderColor = e.target.value;
            this.updateHexagonColors();
        });
        document.getElementById('textColor').addEventListener('input', (e) => {
            this.textColor = e.target.value;
            this.updateHexagonColors();
        });
        document.getElementById('bgColor').addEventListener('input', (e) => {
            this.bgColor = e.target.value;
            this.gridContainer.style.background = this.bgColor;
        });
        
        // Style options
        const hexGapSlider = document.getElementById('hexGap');
        const hexGapValue = document.getElementById('hexGapValue');
        hexGapSlider.addEventListener('input', (e) => {
            this.hexGap = parseFloat(e.target.value);
            hexGapValue.textContent = this.hexGap;
            this.updateGridStyles();
        });
        
        document.getElementById('fontFamily').addEventListener('change', (e) => {
            this.fontFamily = e.target.value;
            this.updateHexagonColors();
        });
        
        // Text size
        const textSizeSlider = document.getElementById('textSize');
        const textSizeValue = document.getElementById('textSizeValue');
        textSizeSlider.addEventListener('input', (e) => {
            this.textSize = parseInt(e.target.value);
            textSizeValue.textContent = this.textSize;
            this.updateHexagonColors();
        });
        
        document.getElementById('showInactiveHex').addEventListener('change', (e) => {
            this.showInactiveHex = e.target.checked;
            this.updateHexagonColors();
        });
        
        // Text modal
        document.getElementById('saveText').addEventListener('click', () => {
            this.saveHexText();
        });
        document.getElementById('cancelText').addEventListener('click', () => {
            this.closeTextModal();
        });
        this.textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.saveHexText();
            } else if (e.key === 'Escape') {
                this.closeTextModal();
            }
        });
        
        // Close modal on outside click
        this.textModal.addEventListener('click', (e) => {
            if (e.target === this.textModal) {
                this.closeTextModal();
            }
        });
        
        // Reset canvas button
        document.getElementById('resetCanvas').addEventListener('click', () => {
            this.resetCanvas();
        });
        
        // Save state button
        document.getElementById('saveState').addEventListener('click', () => {
            this.saveStateToURL();
        });
    }
    
    generateGrid() {
        // Preserve existing hexagon states if grid dimensions match
        const oldHexagons = [...this.hexagons];
        this.hexagons = [];
        
        this.gridContainer.innerHTML = '';
        this.gridContainer.style.background = this.bgColor;
        
        for (let row = 0; row < this.gridHeight; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'hex-row' + (row % 2 === 1 ? ' odd' : '');
            
            for (let col = 0; col < this.gridWidth; col++) {
                const hexData = {
                    row,
                    col,
                    on: false,
                    text: ''
                };
                
                // Restore state from old grid if possible
                const oldHex = oldHexagons.find(h => h.row === row && h.col === col);
                if (oldHex) {
                    hexData.on = oldHex.on;
                    hexData.text = oldHex.text;
                }
                
                const hexElement = this.createHexagonElement(hexData);
                hexData.element = hexElement;
                
                this.hexagons.push(hexData);
                rowDiv.appendChild(hexElement);
            }
            
            this.gridContainer.appendChild(rowDiv);
        }
        
        this.updateGridStyles();
    }
    
    createHexagonElement(hexData) {
        const hex = document.createElement('div');
        hex.className = 'hexagon' + (hexData.on ? ' on' : '');
        hex.dataset.row = hexData.row;
        hex.dataset.col = hexData.col;
        
        const content = document.createElement('div');
        content.className = 'hexagon-content';
        content.textContent = hexData.text;
        hex.appendChild(content);
        
        // Click to toggle
        hex.addEventListener('click', (e) => {
            this.toggleHexagon(hexData);
        });
        
        // Double-click to edit text (only if on)
        hex.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (hexData.on) {
                this.openTextModal(hexData);
            }
        });
        
        // Right-click to edit text (only if on)
        hex.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (hexData.on) {
                this.openTextModal(hexData);
            }
        });
        
        this.applyHexagonStyles(hex, hexData);
        
        return hex;
    }
    
    toggleHexagon(hexData) {
        hexData.on = !hexData.on;
        hexData.element.classList.toggle('on', hexData.on);
        
        if (!hexData.on) {
            hexData.text = '';
            hexData.element.querySelector('.hexagon-content').textContent = '';
        }
        
        this.applyHexagonStyles(hexData.element, hexData);
    }
    
    openTextModal(hexData) {
        this.editingHex = hexData;
        this.textInput.value = hexData.text;
        this.textModal.classList.remove('hidden');
        this.textInput.focus();
        this.textInput.select();
    }
    
    saveHexText() {
        if (this.editingHex) {
            this.editingHex.text = this.textInput.value;
            const content = this.editingHex.element.querySelector('.hexagon-content');
            this.applyTextSize(content, this.editingHex.text);
        }
        this.closeTextModal();
    }
    
    closeTextModal() {
        this.textModal.classList.add('hidden');
        this.editingHex = null;
        this.textInput.value = '';
    }
    
    applyTextSize(element, text) {
        if (!text) {
            element.style.fontSize = '';
            element.textContent = '';
            return;
        }
        
        element.style.fontSize = this.textSize + 'px';
        element.textContent = text;
    }
    
    applyHexagonStyles(hexElement, hexData) {
        const size = this.hexSize;
        const height = size;
        const width = size * (2 / Math.sqrt(3)); // Exact: width = height * 2 / sqrt(3)
        
        // Precise hexagon tessellation math:
        // - Row vertical spacing (center to center) = height * 0.75
        // - For CSS layout: margin needed = (0.75H - H) / 2 = -0.125H per side
        // - Add half the gap to each side
        const verticalMargin = -size * 0.125 + this.hexGap / 2;
        const horizontalMargin = this.hexGap / 2;
        
        hexElement.style.width = width + 'px';
        hexElement.style.height = height + 'px';
        hexElement.style.margin = `${verticalMargin}px ${horizontalMargin}px`;
        
        // Use CSS custom properties for pseudo-element styling
        hexElement.style.setProperty('--border-inset', `${this.borderWidth}px`);
        hexElement.style.setProperty('--hex-bg-color', this.hexBorderColor);
        
        if (hexData.on) {
            hexElement.style.setProperty('--hex-fill-color', this.hexOnColor);
            hexElement.style.opacity = '1';
        } else {
            hexElement.style.setProperty('--hex-fill-color', this.hexOffColor);
            hexElement.style.opacity = this.showInactiveHex ? '0.5' : '0';
            hexElement.style.pointerEvents = 'auto';
        }
        
        const content = hexElement.querySelector('.hexagon-content');
        if (content) {
            content.style.color = this.textColor;
            content.style.fontFamily = this.fontFamily;
            this.applyTextSize(content, hexData.text);
        }
    }
    
    updateGridStyles() {
        // Odd rows offset by exactly half the hexagon width plus gap
        const hexWidth = this.hexSize * (2 / Math.sqrt(3));
        const offset = hexWidth / 2 + this.hexGap / 2;
        this.gridContainer.style.setProperty('--hex-offset', offset + 'px');
        
        // Add top padding to compensate for negative margins on first row
        this.gridContainer.style.paddingTop = (this.hexSize * 0.125 + 20) + 'px';
        
        this.hexagons.forEach(hexData => {
            this.applyHexagonStyles(hexData.element, hexData);
        });
    }
    
    updateHexagonColors() {
        this.hexagons.forEach(hexData => {
            this.applyHexagonStyles(hexData.element, hexData);
        });
    }
    
    resetCanvas() {
        if (confirm('Are you sure you want to reset the canvas? This will clear all hexagons and text.')) {
            // Reset all hexagon states
            this.hexagons.forEach(hexData => {
                hexData.on = false;
                hexData.text = '';
                hexData.element.classList.remove('on');
                const content = hexData.element.querySelector('.hexagon-content');
                content.textContent = '';
                content.innerHTML = '';
                this.applyHexagonStyles(hexData.element, hexData);
            });
        }
    }
    
    saveStateToURL() {
        const state = {
            // Grid settings
            gw: this.gridWidth,
            gh: this.gridHeight,
            hs: this.hexSize,
            // Colors
            hoc: this.hexOnColor,
            hofc: this.hexOffColor,
            hbc: this.hexBorderColor,
            tc: this.textColor,
            bg: this.bgColor,
            // Style options
            hg: this.hexGap,
            ff: this.fontFamily,
            sih: this.showInactiveHex ? 1 : 0,
            ts: this.textSize,
            // Hexagon data - only save active hexagons with text
            hex: this.hexagons
                .filter(h => h.on)
                .map(h => ({
                    r: h.row,
                    c: h.col,
                    t: h.text || ''
                }))
        };
        
        const stateString = encodeURIComponent(JSON.stringify(state));
        const url = `${window.location.origin}${window.location.pathname}?state=${stateString}`;
        
        navigator.clipboard.writeText(url).then(() => {
            alert('URL copied to clipboard!');
        }).catch(err => {
            // Fallback: show the URL in a prompt
            prompt('Copy this URL:', url);
        });
    }
    
    loadStateFromURL() {
        const params = new URLSearchParams(window.location.search);
        const stateParam = params.get('state');
        
        if (!stateParam) return;
        
        try {
            const state = JSON.parse(decodeURIComponent(stateParam));
            
            // Grid settings
            if (state.gw) this.gridWidth = state.gw;
            if (state.gh) this.gridHeight = state.gh;
            if (state.hs) this.hexSize = state.hs;
            
            // Colors
            if (state.hoc) this.hexOnColor = state.hoc;
            if (state.hofc) this.hexOffColor = state.hofc;
            if (state.hbc) this.hexBorderColor = state.hbc;
            if (state.tc) this.textColor = state.tc;
            if (state.bg) this.bgColor = state.bg;
            
            // Style options
            if (state.hg !== undefined) this.hexGap = state.hg;
            if (state.ff) this.fontFamily = state.ff;
            if (state.sih !== undefined) this.showInactiveHex = state.sih === 1;
            if (state.ts !== undefined) this.textSize = state.ts;
            
            // Store hexagon data to be applied after grid generation
            this._pendingHexData = state.hex || [];
        } catch (e) {
            console.error('Failed to load state from URL:', e);
        }
    }
    
    applyStateToUI() {
        // Update UI controls to reflect loaded state
        document.getElementById('gridWidth').value = this.gridWidth;
        document.getElementById('gridHeight').value = this.gridHeight;
        document.getElementById('hexSize').value = this.hexSize;
        document.getElementById('hexSizeValue').textContent = this.hexSize;
        document.getElementById('hexOnColor').value = this.hexOnColor;
        document.getElementById('hexOffColor').value = this.hexOffColor;
        document.getElementById('hexBorderColor').value = this.hexBorderColor;
        document.getElementById('textColor').value = this.textColor;
        document.getElementById('bgColor').value = this.bgColor;
        document.getElementById('hexGap').value = this.hexGap;
        document.getElementById('hexGapValue').textContent = this.hexGap;
        document.getElementById('fontFamily').value = this.fontFamily;
        document.getElementById('textSize').value = this.textSize;
        document.getElementById('textSizeValue').textContent = this.textSize;
        document.getElementById('showInactiveHex').checked = this.showInactiveHex;
        
        // Apply background color
        this.gridContainer.style.background = this.bgColor;
        
        // Apply pending hexagon data if any
        if (this._pendingHexData && this._pendingHexData.length > 0) {
            this._pendingHexData.forEach(hexState => {
                const hexData = this.hexagons.find(h => h.row === hexState.r && h.col === hexState.c);
                if (hexData) {
                    hexData.on = true;
                    hexData.text = hexState.t || '';
                    hexData.element.classList.add('on');
                    const content = hexData.element.querySelector('.hexagon-content');
                    content.textContent = hexData.text;
                    this.applyHexagonStyles(hexData.element, hexData);
                }
            });
            this._pendingHexData = null;
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.hexApp = new HexagonCanvas();
});
