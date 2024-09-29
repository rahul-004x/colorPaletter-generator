// DOM Elements
const searchInput = document.getElementById("search-input");
     searchColor = document.querySelector(".search-color");
     paletteContainer = document.getElementById("palette");
     relatedContainer = document.getElementById("related-palette");
     randomBtn = document.getElementById("random-btn");
     typeSelect = document.getElementById("palette-type");
     countSelect = document.getElementById("palette-count");
     searchImage = document.getElementById("search-image-input");
     imageColorsContainer = document.getElementById("image-colors");
     imageColorsWrapper = document.querySelector(".image-colors-wrapper");

let currentColor = 'skyblue',
    currentType = 'analogous',
    currentCount = 6,
    imageColors = [];

// Utility functions to convert RGB to HSL and HSL to HEX
function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if(max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function HslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
    return `#${(1 << 24 | f(0) << 16 | f(8) << 8 | f(4)).toString(16).slice(1)}`;
}

// Generate color palettes
function generateAnalogousPalette(hsl, count) {
    const palette = [];
    const [hue, saturation, lightness] = hsl;
    for (let i = 0; i < count; i++) {
        let newHue = (hue + 30 * i) % 360;
        palette.push([newHue, saturation, lightness]);
    }
    return palette;
}

function generateMonochromaticPalette(hsl, count) {
    const palette = [];
    const [hue, saturation, lightness] = hsl;
    for (let i = 0; i < count; i++) {
        let newLightness = (lightness + 10 * i) % 100;
        palette.push([hue, saturation, newLightness]);
    }
    return palette;
}

function generateTriadicPalette(hsl, count) {
    const palette = [];
    const [hue, saturation, lightness] = hsl;
    for (let i = 0; i < count; i++) {
        let newHue = (hue + 120 * i) % 360;
        palette.push([newHue, saturation, lightness]);
    }
    return palette;
}

function generateCompoundPalette(hsl, count) {
    const palette = [];
    const [hue, saturation, lightness] = hsl;
    for (let i = 0; i < count; i++) {
        let newHue = (hue + 150 * i) % 360;
        palette.push([newHue, saturation, lightness]);
    }
    return palette;
}

function generateShadesPalette(hsl, count) {
    const palette = [];
    const [hue, saturation, lightness] = hsl;
    for (let i = 0; i < count; i++) {
        let newSaturation = (saturation + 10 * i) % 100;
        palette.push([hue, newSaturation, lightness]);
    }
    return palette;
}

function generateTetradicPalette(hsl, count) {
    const palette = [];
    const [hue, saturation, lightness] = hsl;
    for (let i = 0; i < count; i++) {
        let newHue = (hue + 90 * i) % 360;
        palette.push([newHue, saturation, lightness]);
    }
    return palette;
}

function generateSquarePalette(hsl, count) {
    const palette = [];
    const [hue, saturation, lightness] = hsl;
    for (let i = 0; i < count; i++) {
        let newHue = (hue + 150 * i) % 360; 
        palette.push([newHue, saturation, lightness]);
    }
    return palette;
}

function generatePalette(hsl, type, count) {
    switch (type) {
        case "analogous":
            return generateAnalogousPalette(hsl, count);
        case "monochromatic":
            return generateMonochromaticPalette(hsl, count);
        case "triadic":
            return generateTriadicPalette(hsl, count);
        case "compound":
            return generateCompoundPalette(hsl, count);
        case "shades":
            return generateShadesPalette(hsl, count);
        case "tetradic":
            return generateTetradicPalette(hsl, count);
        case "square":
            return generateSquarePalette(hsl, count); 
        case 'related':
            return generateRelatedColors(hsl, count);
        default:
            return [];
    }
}


// Generate Palette HTML
function generatePaletteHTML(type, container) {
    const color = currentColor;
    const count = currentCount;
    const hsl = getHslFromColor(color);
    if (!hsl) return;

    let palette = [];

    if (type === "image-colors") {
        palette = imageColors;
    } else {
        palette = generatePalette(hsl, type, count);
    }

    container.innerHTML = "";

    palette.forEach((color) => {
        let hexColor = color;

        if (type !== "image-colors") {
            hexColor = HslToHex(...color);
        }

        const colorEl = document.createElement("div");
        colorEl.classList.add("color");
        colorEl.style.backgroundColor = hexColor;
        colorEl.innerHTML = `
            <div class="overlay">
                <div class="icons">
                    <div class="copy-color" title="Copy color code">
                        <i class="far fa-copy"></i>
                    </div>
                    <div class="generate-palette" title="Generate Palette">
                        <i class="fas fa-palette"></i>
                    </div>
                </div>
                <div class="code">${hexColor}</div>
            </div>
        `;
        container.appendChild(colorEl);
    });

    // Attach event listeners for new palette colors
    attachPaletteEventListeners();
}

// Generate related colors based on the current color
function generateRelatedColors(color, count = 5) {
    const hsl = getHslFromColor(color);
    if (!hsl) return [];

    const relatedColors = [];
    for (let i = 1; i <= count; i++) {
        let modifiedHsl = [...hsl];
        modifiedHsl[0] = (hsl[0] + i * 30) % 360; // Adjust hue to create related colors
        relatedColors.push(HslToHex(...modifiedHsl));
    }

    return relatedColors;
}

// Display related colors
function displayRelatedColors() {
    const relatedColors = generateRelatedColors(currentColor);
    relatedContainer.innerHTML = "";

    relatedColors.forEach((color) => {
        const colorEl = document.createElement("div");
        colorEl.classList.add("color");
        colorEl.style.backgroundColor = color;
        colorEl.innerHTML = `
            <div class="overlay">
                <div class="icons">
                    <div class="copy-color" title="Copy color code">
                        <i class="far fa-copy"></i>
                    </div>
                    <div class="generate-palette" title="Generate Palette">
                        <i class="fas fa-palette"></i>
                    </div>
                </div>
                <div class="code">${color}</div>
            </div>
        `;
        relatedContainer.appendChild(colorEl);
    });

    // Attach event listeners for related colors
    attachPaletteEventListeners();
}

// Get HSL from color
function getHslFromColor(color) {
    let hsl = null;
    if (isValidColor(color)) {
        let temp = document.createElement("div");
        temp.style.color = color;
        document.body.appendChild(temp);
        let styles = window.getComputedStyle(temp);
        let rgb = styles.getPropertyValue("color");
        document.body.removeChild(temp);

        rgb = rgb.match(/\d+/g).map(Number);
        hsl = rgbToHsl(...rgb);
    }
    return hsl;
}

// Event Listeners
randomBtn.addEventListener("click", () => {
    currentColor = getRandomColor();
    searchInput.value = currentColor;
    generatePaletteHTML(currentType, paletteContainer);
    displayRelatedColors();
});

typeSelect.addEventListener("change", (e) => {
    currentType = e.target.value;
    generatePaletteHTML(currentType, paletteContainer);
    displayRelatedColors();
});

countSelect.addEventListener("change", (e) => {
    currentCount = parseInt(e.target.value);
    generatePaletteHTML(currentType, paletteContainer);
    displayRelatedColors();
});

searchInput.addEventListener("keyup", (e) => {
    const value = e.target.value;
    if (isValidColor(value)){
        searchColor.style.backgroundColor = value;
        currentColor = value;
        generatePaletteHTML(currentType, paletteContainer);
        displayRelatedColors();
    }
});

searchImage.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function () {
            const image = new Image();
            image.src = reader.result;
            image.onload = function () {
                extractColorsFromImage(image);
            };
        };
        
        reader.readAsDataURL(file);
    }
});

// Generate random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Validate if the input is a valid color
function isValidColor(strColor) {
    const s = new Option().style;
    s.color = strColor;
    return s.color !== '';
}

// Extract colors from an image
function extractColorsFromImage(image) {
    colorjs.prominent(image, { amount: 6, format: 'hex' }).then((colors) => {
        imageColors = [];
        imageColors.push(...colors);
        generatePaletteHTML("image-colors", imageColorsContainer);
        imageColorsWrapper.classList.remove("hidden");
    });
}

// Toast notification
function toast(message) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add("show");
    }, 20);

    setTimeout(() => {
        toast.classList.remove("show");
        document.body.removeChild(toast);
    }, 1500);
}

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(err => console.error('Failed to copy text: ', err));
    } else {
        const input = document.createElement("input");
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
    }
}

// Attach event listeners to palette items
function attachPaletteEventListeners() {
    const palettes = document.querySelectorAll(".palette .color");

    palettes.forEach((palette) => {
        palette.addEventListener("click", (e) => {
            const target = e.target;

            if (target.classList.contains("generate-palette")) {
                const colorElement = target.closest(".color")?.querySelector(".code");
                if (colorElement) {
                    const color = colorElement.textContent;
                    searchInput.value = color;
                    searchColor.style.backgroundColor = color;
                    currentColor = color;
                    generatePaletteHTML(currentType, paletteContainer);
                    displayRelatedColors();
                    toast(`Palette generated for ${color}`);
                } else {
                    toast("No color found for palette generation.");
                }
            } else {
                const colorElement = target.closest(".color")?.querySelector(".code");
                if (colorElement) {
                    const color = colorElement.textContent;
                    copyToClipboard(color);
                    toast(`Color ${color} copied to clipboard`);
                }
            }
        });
    });
}

// Initialize the page with default values
document.addEventListener("DOMContentLoaded", () => {
    generatePaletteHTML(currentType, paletteContainer);
    displayRelatedColors();
});

const downloadBtn = document.querySelector("#download-btn");
const downloadFormat = document.querySelector("#download-format");
const downloadName = document.querySelector("#download-name");

downloadBtn.addEventListener("click", () => {
    const format = downloadFormat.value;
    let name = downloadName.value;
    // If name is empty
    name = name === "" ? "palette" : name;
    downloadPalette(format, name);
});

function downloadPalette(format, name) {
    const palette = document.querySelector("#palette");
    const paletteColors = palette.querySelectorAll(".color");
    const colors = [];
    // Store all colors of palette in an array
    paletteColors.forEach((color) => {
        colors.push(color.style.backgroundColor);
    });
    
    switch (format) {
        case "png":
            downloadPalettePng(colors, name);
            break;
        case "svg":
            downloadPaletteSvg(colors, name);
            break;
        case "css":
            downloadPaletteCss(colors, name);
            break;
        case "json":
            downloadPaletteJson(colors, name);
            break;
        default:
            break;
    }
}

function downloadPalettePng(colors, name) {
    const canvas = document.createElement("canvas");
    canvas.width = colors.length * 200;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    colors.forEach((color, index) => {
        ctx.fillStyle = color;
        ctx.fillRect(index * 200, 0, 200, 1000);
    });
    // Download canvas as png
    const link = document.createElement("a");
    link.download = name + ".png";  // Added dot before extension
    link.href = canvas.toDataURL();
    link.click();
}
function downloadPaletteSvg(colors, name) {
    const width = 200;
    const height = 1000;
    const svgParts = colors.map((color, index) => {
        return `<rect x="${index * width}" y="0" width="${width}" height="${height}" fill="${color}" />`;
    });
    
    const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${colors.length * width}" height="${height}">
            ${svgParts.join('')}
        </svg>`;
    
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const link = document.createElement("a");
    link.download = name + ".svg";
    link.href = URL.createObjectURL(blob);
    link.click();
}

function downloadPaletteCss(colors, name) {
    const cssContent = colors.map((color, index) => {
        return `.color-${index} { background-color: ${color}; }`;
    }).join('\n');
    
    const blob = new Blob([cssContent], { type: 'text/css' });
    const link = document.createElement("a");
    link.download = name + ".css";
    link.href = URL.createObjectURL(blob);
    link.click();
}

function downloadPaletteJson(colors, name) {
    const jsonContent = JSON.stringify(colors, null, 2);
    
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement("a");
    link.download = name + ".json";
    link.href = URL.createObjectURL(blob);
    link.click();
}

const toggle = document.querySelector("#toggle");

toggle.addEventListener("change", (e) => {
    if (e.target.checked){
        document.body.classList.add("dark")
    }else {
        document.body.classList.remove("dark")
    }
})
