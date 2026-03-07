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
        this.borderWidth = 2;
        this.hexGap = 2;
        this.fontFamily = 'Arial, sans-serif';
        this.showInactiveHex = true;
        
        // Currently editing hexagon
        this.editingHex = null;
        
        // DOM elements
        this.gridContainer = document.getElementById('hexGrid');
        this.textModal = document.getElementById('textModal');
        this.textInput = document.getElementById('hexTextInput');
        
        this.init();
    }
    
    init() {
        this.bindControls();
        this.generateGrid();
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
        const borderWidthSlider = document.getElementById('borderWidth');
        const borderWidthValue = document.getElementById('borderWidthValue');
        borderWidthSlider.addEventListener('input', (e) => {
            this.borderWidth = parseFloat(e.target.value);
            borderWidthValue.textContent = this.borderWidth;
            this.updateHexagonColors();
        });
        
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
            content.textContent = this.editingHex.text;
            this.autoSizeText(content, this.hexSize);
        }
        this.closeTextModal();
    }
    
    closeTextModal() {
        this.textModal.classList.add('hidden');
        this.editingHex = null;
        this.textInput.value = '';
    }
    
    autoSizeText(element, hexSize) {
        const text = element.textContent;
        if (!text) {
            element.style.fontSize = '';
            return;
        }
        
        // Calculate available space (hexagon inner area with margins)
        const availableWidth = hexSize * 0.65;
        const availableHeight = hexSize * 0.5;
        
        // Start with a large font size and reduce until it fits
        let fontSize = hexSize * 0.4;
        const minFontSize = 8;
        
        element.style.fontSize = fontSize + 'px';
        
        // Create a temporary element to measure text
        const temp = document.createElement('span');
        temp.style.cssText = `
            position: absolute;
            visibility: hidden;
            white-space: nowrap;
            font-family: ${this.fontFamily};
            font-weight: 600;
        `;
        document.body.appendChild(temp);
        
        while (fontSize > minFontSize) {
            temp.style.fontSize = fontSize + 'px';
            temp.textContent = text;
            
            const textWidth = temp.offsetWidth;
            const textHeight = temp.offsetHeight;
            
            if (textWidth <= availableWidth && textHeight <= availableHeight) {
                break;
            }
            
            fontSize -= 1;
        }
        
        document.body.removeChild(temp);
        element.style.fontSize = fontSize + 'px';
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
            this.autoSizeText(content, size);
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
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.hexApp = new HexagonCanvas();
});
