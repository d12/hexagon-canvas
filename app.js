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
        
        document.getElementById('fontFamily').addEventListener('change', (e) => {
            this.fontFamily = e.target.value;
            this.updateHexagonColors();
        });
        
        document.getElementById('showInactiveHex').addEventListener('change', (e) => {
            this.showInactiveHex = e.target.checked;
            this.updateHexagonColors();
        });
        
        // Export
        document.getElementById('exportImage').addEventListener('click', () => {
            this.exportImage();
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
        const width = size * 1.1547; // width = height * 2 / sqrt(3)
        
        hexElement.style.width = width + 'px';
        hexElement.style.height = height + 'px';
        hexElement.style.margin = `${size * 0.02}px ${size * 0.05}px`;
        
        if (hexData.on) {
            hexElement.style.background = this.hexOnColor;
            hexElement.style.boxShadow = `inset 0 0 0 ${this.borderWidth}px ${this.hexBorderColor}`;
            hexElement.style.opacity = '1';
        } else {
            hexElement.style.background = this.hexOffColor;
            hexElement.style.boxShadow = `inset 0 0 0 ${this.borderWidth}px ${this.hexBorderColor}`;
            hexElement.style.opacity = this.showInactiveHex ? '0.5' : '0';
            hexElement.style.pointerEvents = this.showInactiveHex ? 'auto' : 'auto';
        }
        
        const content = hexElement.querySelector('.hexagon-content');
        if (content) {
            content.style.color = this.textColor;
            content.style.fontFamily = this.fontFamily;
            this.autoSizeText(content, size);
        }
    }
    
    updateGridStyles() {
        const offset = this.hexSize * 1.1547 / 2 + this.hexSize * 0.05;
        this.gridContainer.style.setProperty('--hex-offset', offset + 'px');
        
        this.hexagons.forEach(hexData => {
            this.applyHexagonStyles(hexData.element, hexData);
        });
    }
    
    updateHexagonColors() {
        this.hexagons.forEach(hexData => {
            this.applyHexagonStyles(hexData.element, hexData);
        });
    }
    
    async exportImage() {
        // Find bounding box of active hexagons
        const activeHexagons = this.hexagons.filter(h => h.on);
        
        if (activeHexagons.length === 0) {
            alert('No active hexagons to export!');
            return;
        }
        
        // Calculate bounds
        let minRow = Infinity, maxRow = -Infinity;
        let minCol = Infinity, maxCol = -Infinity;
        
        activeHexagons.forEach(h => {
            minRow = Math.min(minRow, h.row);
            maxRow = Math.max(maxRow, h.row);
            minCol = Math.min(minCol, h.col);
            maxCol = Math.max(maxCol, h.col);
        });
        
        // Calculate dimensions
        const hexWidth = this.hexSize * 1.1547;
        const hexHeight = this.hexSize;
        const hexMarginX = this.hexSize * 0.05;
        const hexMarginY = this.hexSize * 0.02;
        const rowOffset = hexWidth / 2 + hexMarginX;
        
        // Calculate canvas size based on active hexagons
        const padding = 20;
        
        // Row height considering overlap (hexagons overlap vertically)
        const rowHeight = hexHeight * 0.75 + hexMarginY * 2;
        
        const canvasWidth = (maxCol - minCol + 1) * (hexWidth + hexMarginX * 2) + rowOffset + padding * 2;
        const canvasHeight = (maxRow - minRow + 1) * rowHeight + hexHeight * 0.25 + padding * 2;
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        
        // Fill background
        ctx.fillStyle = this.bgColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw active hexagons
        activeHexagons.forEach(hexData => {
            const relRow = hexData.row - minRow;
            const relCol = hexData.col - minCol;
            
            // Calculate position
            const isOddRow = hexData.row % 2 === 1;
            const x = padding + relCol * (hexWidth + hexMarginX * 2) + hexWidth / 2 + 
                      (isOddRow ? rowOffset : 0);
            const y = padding + relRow * rowHeight + hexHeight / 2;
            
            this.drawHexagon(ctx, x, y, hexWidth, hexHeight, hexData);
        });
        
        // Download
        const link = document.createElement('a');
        link.download = 'hexagon-canvas.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
    
    drawHexagon(ctx, cx, cy, width, height, hexData) {
        const w = width / 2;
        const h = height / 2;
        
        // Draw hexagon path
        ctx.beginPath();
        ctx.moveTo(cx, cy - h);           // Top
        ctx.lineTo(cx + w, cy - h * 0.5); // Top right
        ctx.lineTo(cx + w, cy + h * 0.5); // Bottom right
        ctx.lineTo(cx, cy + h);           // Bottom
        ctx.lineTo(cx - w, cy + h * 0.5); // Bottom left
        ctx.lineTo(cx - w, cy - h * 0.5); // Top left
        ctx.closePath();
        
        // Fill
        ctx.fillStyle = this.hexOnColor;
        ctx.fill();
        
        // Border
        if (this.borderWidth > 0) {
            ctx.strokeStyle = this.hexBorderColor;
            ctx.lineWidth = this.borderWidth;
            ctx.stroke();
        }
        
        // Text
        if (hexData.text) {
            ctx.fillStyle = this.textColor;
            ctx.font = `600 ${this.calculateExportFontSize(hexData.text, width * 0.65, height * 0.5)}px ${this.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(hexData.text, cx, cy);
        }
    }
    
    calculateExportFontSize(text, maxWidth, maxHeight) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        let fontSize = this.hexSize * 0.4;
        const minFontSize = 8;
        
        while (fontSize > minFontSize) {
            ctx.font = `600 ${fontSize}px ${this.fontFamily}`;
            const metrics = ctx.measureText(text);
            const textWidth = metrics.width;
            const textHeight = fontSize;
            
            if (textWidth <= maxWidth && textHeight <= maxHeight) {
                break;
            }
            
            fontSize -= 1;
        }
        
        return fontSize;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.hexApp = new HexagonCanvas();
});
