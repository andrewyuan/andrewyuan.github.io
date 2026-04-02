// ============================================
// RIVERS OF CIVILIZATION — STREAMGRAPH ENGINE
// ============================================

(function () {
    'use strict';

    // ========== CONFIGURATION ==========
    const CONFIG = {
        START_YEAR: -3500,
        END_YEAR: 2025,
        SAMPLE_STEP: 5,
        PX_PER_YEAR: 2.2,
        MIN_ZOOM: 0.3,
        MAX_ZOOM: 5,
        ZOOM_STEP: 0.15,
        TENSION: 0.45,
        RAMP_FRACTION: 0.15,
        MAX_RAMP: 120,
        STREAM_GAP: 0.5,
        LABEL_MIN_HEIGHT: 14,
    };

    // ========== POWER (influence weight) for each civilization ==========
    const POWER = {
        // Americas
        'maya': 12, 'olmec': 8, 'teotihuacan': 10, 'aztec': 22, 'inca': 25, 'usa': 70,
        // Africa
        'egypt-old': 28, 'egypt-middle': 24, 'egypt-new': 38, 'kush': 14, 'aksum': 11,
        'ghana': 14, 'mali': 24, 'songhai': 18,
        // Europe
        'minoan': 8, 'mycenaean': 10, 'greek': 24, 'roman': 68, 'byzantine': 30,
        'charlemagne': 24, 'hre': 20, 'france': 24, 'british': 62, 'soviet': 58,
        // Middle East
        'sumer': 14, 'akkad': 10, 'babylon': 20, 'assyria': 24, 'achaemenid': 48,
        'parthia': 24, 'sassanid': 30, 'umayyad': 38, 'abbasid': 42, 'ottoman': 45,
        // South Asia
        'indus': 20, 'maurya': 34, 'gupta': 30, 'chola': 14, 'mughal': 40,
        // East Asia
        'shang': 14, 'zhou': 20, 'qin': 22, 'han': 54, 'tang': 50, 'song': 34,
        'mongol': 68, 'ming': 44, 'qing': 50, 'roc': 20, 'prc': 65, 'japan': 28,
        'india': 45,
    };

    // ========== STATE ==========
    let state = {
        zoom: 1,
        theme: 'dark',
        hoveredLayer: null,
        mapHoveredCiv: null,
        legendVisible: false,
        isDragging: false,
        dragStartX: 0,
        scrollStartX: 0,
        mapVisible: true,
        mapExpanded: false,
        mapYear: CONFIG.START_YEAR,
        // Draggable year indicator (screen-fixed)
        indicatorRatio: 0.5,           // screen X position as fraction (0–1), default center
        isDraggingIndicator: false,    // true while user drags the indicator
    };

    // ========== DOM ==========
    let bgCanvas, fgCanvas, bgCtx, fgCtx;
    let scrollContainer, tooltip, legendPanel, legendContent;
    let detailOverlay, detailContent;
    let mapCanvas, mapCtx, mapPanel, mapYearEl, mapCivList;

    // ========== COMPUTED ==========
    let timePoints = [];
    let layers = [];
    let canvasW, canvasH, stepPx, centerY, vScale;

    // ========== HELPERS ==========
    function smoothstep(t) {
        t = Math.max(0, Math.min(1, t));
        return t * t * (3 - 2 * t);
    }

    function formatYear(y) {
        if (y < 0) return Math.abs(y) + ' BCE';
        if (y === 0) return '1 BCE';
        return y + ' CE';
    }

    function hexToRGBA(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
    }

    function darkenHex(hex, factor) {
        const r = Math.round(parseInt(hex.slice(1, 3), 16) * factor);
        const g = Math.round(parseInt(hex.slice(3, 5), 16) * factor);
        const b = Math.round(parseInt(hex.slice(5, 7), 16) * factor);
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    // ========== TIME SERIES ==========
    function generateTimePoints() {
        timePoints = [];
        for (let y = CONFIG.START_YEAR; y <= CONFIG.END_YEAR; y += CONFIG.SAMPLE_STEP) {
            timePoints.push(y);
        }
    }

    function civWeight(year, start, end, power) {
        if (year < start || year > end) return 0;
        const duration = end - start;
        const ramp = Math.min(duration * CONFIG.RAMP_FRACTION, CONFIG.MAX_RAMP);
        let env = 1.0;
        if (ramp > 0) {
            if (year < start + ramp) env = smoothstep((year - start) / ramp);
            else if (year > end - ramp) env = smoothstep((end - year) / ramp);
        }
        return power * env;
    }

    function generateLayers() {
        // Order layers by region (geographic grouping)
        // Bottom → Top: Americas, Africa, Europe, Middle East, South Asia, East Asia
        const regionOrder = ['americas', 'africa', 'europe', 'middle-east', 'south-asia', 'east-asia'];
        const ordered = [];
        regionOrder.forEach(rid => {
            const civs = CIVILIZATIONS.filter(c => c.region === rid);
            civs.sort((a, b) => a.start - b.start);
            ordered.push(...civs);
        });

        layers = ordered.map(civ => {
            const power = POWER[civ.id] || 10;
            const weights = timePoints.map(t => civWeight(t, civ.start, civ.end, power));
            return {
                civ: civ,
                weights: weights,
                y0: new Float64Array(timePoints.length),
                y1: new Float64Array(timePoints.length),
            };
        });
    }

    // ========== STREAMGRAPH LAYOUT ==========
    function computeLayout() {
        const n = timePoints.length;
        const m = layers.length;
        const gap = CONFIG.STREAM_GAP;

        // Silhouette (centered) baseline
        for (let j = 0; j < n; j++) {
            let total = 0;
            for (let i = 0; i < m; i++) {
                total += layers[i].weights[j];
                if (layers[i].weights[j] > 0) total += gap;
            }
            let y = -total / 2;
            for (let i = 0; i < m; i++) {
                layers[i].y0[j] = y;
                const w = layers[i].weights[j];
                y += w;
                if (w > 0) y += gap;
                layers[i].y1[j] = y - (w > 0 ? gap : 0);
            }
        }

        // Compute vertical scale to fit canvas
        let maxExtent = 0;
        for (let j = 0; j < n; j++) {
            if (m > 0) {
                const top = Math.abs(layers[0].y0[j]);
                const bot = Math.abs(layers[m - 1].y1[j]);
                maxExtent = Math.max(maxExtent, top, bot);
            }
        }
        const availH = canvasH - 80;
        vScale = maxExtent > 0 ? (availH / 2) / maxExtent : 1;
    }

    // ========== CANVAS SETUP ==========
    function setupCanvases() {
        const dpr = window.devicePixelRatio || 1;
        const mainEl = document.getElementById('sgMain');
        const rect = mainEl.getBoundingClientRect();

        canvasW = Math.ceil((CONFIG.END_YEAR - CONFIG.START_YEAR) * CONFIG.PX_PER_YEAR * state.zoom);
        canvasH = Math.floor(rect.height);
        stepPx = CONFIG.SAMPLE_STEP * CONFIG.PX_PER_YEAR * state.zoom;
        centerY = canvasH / 2;

        [bgCanvas, fgCanvas].forEach(c => {
            c.width = canvasW * dpr;
            c.height = canvasH * dpr;
            c.style.width = canvasW + 'px';
            c.style.height = canvasH + 'px';
        });
        bgCtx = bgCanvas.getContext('2d');
        fgCtx = fgCanvas.getContext('2d');
        bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ========== SPLINE DRAWING ==========
    function splineTo(ctx, points, tension, startMove) {
        if (points.length < 2) return;
        if (startMove) ctx.moveTo(points[0].x, points[0].y);

        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[Math.max(0, i - 1)];
            const p1 = points[i];
            const p2 = points[i + 1];
            const p3 = points[Math.min(points.length - 1, i + 2)];
            ctx.bezierCurveTo(
                p1.x + (p2.x - p0.x) * tension / 3,
                p1.y + (p2.y - p0.y) * tension / 3,
                p2.x - (p3.x - p1.x) * tension / 3,
                p2.y - (p3.y - p1.y) * tension / 3,
                p2.x, p2.y
            );
        }
    }

    // Build the closed path for a stream layer
    function traceStreamPath(ctx, layer) {
        const top = [], bot = [];
        for (let j = 0; j < timePoints.length; j++) {
            const x = j * stepPx;
            top.push({ x, y: centerY - layer.y1[j] * vScale });
            bot.push({ x, y: centerY - layer.y0[j] * vScale });
        }
        ctx.beginPath();
        splineTo(ctx, top, CONFIG.TENSION, true);
        // Right edge connector
        ctx.lineTo(bot[bot.length - 1].x, bot[bot.length - 1].y);
        // Bottom boundary (reversed)
        const botRev = [];
        for (let i = bot.length - 1; i >= 0; i--) botRev.push(bot[i]);
        splineTo(ctx, botRev, CONFIG.TENSION, false);
        ctx.closePath();
    }

    // ========== RENDERING ==========
    function clearCanvas(ctx, canvas) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    function drawBackground(ctx) {
        const isDark = state.theme === 'dark';
        const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
        if (isDark) {
            grad.addColorStop(0, 'rgba(8,8,24,0.55)');
            grad.addColorStop(0.3, 'rgba(12,12,34,0.5)');
            grad.addColorStop(0.5, 'rgba(14,14,40,0.45)');
            grad.addColorStop(0.7, 'rgba(12,12,34,0.5)');
            grad.addColorStop(1, 'rgba(8,8,24,0.55)');
        } else {
            grad.addColorStop(0, 'rgba(240,236,229,0.6)');
            grad.addColorStop(0.5, 'rgba(248,246,242,0.55)');
            grad.addColorStop(1, 'rgba(240,236,229,0.6)');
        }
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasW, canvasH);
    }

    function drawEraBands(ctx) {
        const isDark = state.theme === 'dark';
        ERAS.forEach((era, i) => {
            const x1 = (era.start - CONFIG.START_YEAR) * CONFIG.PX_PER_YEAR * state.zoom;
            const x2 = (era.end - CONFIG.START_YEAR) * CONFIG.PX_PER_YEAR * state.zoom;
            ctx.fillStyle = hexToRGBA(era.color, isDark ? 0.04 : 0.03);
            ctx.fillRect(x1, 0, x2 - x1, canvasH);
            // Boundary
            if (i > 0) {
                ctx.strokeStyle = hexToRGBA(era.color, isDark ? 0.12 : 0.08);
                ctx.lineWidth = 1;
                ctx.setLineDash([8, 8]);
                ctx.beginPath();
                ctx.moveTo(x1, 0);
                ctx.lineTo(x1, canvasH);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            // Era name
            ctx.font = '600 9px Inter, sans-serif';
            ctx.fillStyle = hexToRGBA(era.color, isDark ? 0.3 : 0.2);
            ctx.textAlign = 'left';
            ctx.fillText(era.name.toUpperCase(), x1 + 10, canvasH - 42);
        });
    }

    function drawTimeAxis(ctx) {
        const isDark = state.theme === 'dark';
        let interval = 500;
        if (state.zoom > 1.5) interval = 200;
        if (state.zoom > 2.5) interval = 100;
        if (state.zoom > 4) interval = 50;
        if (state.zoom < 0.6) interval = 1000;

        ctx.font = '500 9px Inter, sans-serif';
        ctx.textAlign = 'center';

        const start = Math.ceil(CONFIG.START_YEAR / interval) * interval;
        for (let year = start; year <= CONFIG.END_YEAR; year += interval) {
            const x = (year - CONFIG.START_YEAR) * CONFIG.PX_PER_YEAR * state.zoom;
            // Tick
            ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, canvasH - 26);
            ctx.lineTo(x, canvasH - 18);
            ctx.stroke();
            // Label
            ctx.fillStyle = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)';
            ctx.fillText(formatYear(year), x, canvasH - 8);
        }
    }

    function drawStreams(ctx, alpha) {
        layers.forEach(layer => {
            traceStreamPath(ctx, layer);

            // Gradient fill
            const col = layer.civ.color;
            const a = alpha || 0.55;
            // Top-bottom gradient within the stream
            let minY = Infinity, maxY = -Infinity;
            for (let j = 0; j < timePoints.length; j++) {
                const t = centerY - layer.y1[j] * vScale;
                const b = centerY - layer.y0[j] * vScale;
                if (t < minY) minY = t;
                if (b > maxY) maxY = b;
            }
            if (maxY - minY < 1) { minY = centerY - 1; maxY = centerY + 1; }
            const grad = ctx.createLinearGradient(0, minY, 0, maxY);
            grad.addColorStop(0, hexToRGBA(col, a * 0.95));
            grad.addColorStop(0.4, hexToRGBA(col, a));
            grad.addColorStop(1, hexToRGBA(col, a * 0.8));
            ctx.fillStyle = grad;
            ctx.fill();

            // Subtle stroke
            ctx.strokeStyle = hexToRGBA(col, a * 0.4);
            ctx.lineWidth = 0.5;
            ctx.stroke();
        });
    }

    function drawStreamLabels(ctx) {
        const isDark = state.theme === 'dark';
        layers.forEach(layer => {
            // Find widest section
            let maxH = 0, maxJ = 0;
            for (let j = 0; j < timePoints.length; j++) {
                const h = (layer.y1[j] - layer.y0[j]) * vScale;
                if (h > maxH) { maxH = h; maxJ = j; }
            }
            if (maxH < CONFIG.LABEL_MIN_HEIGHT) return;

            const x = maxJ * stepPx;
            const topY = centerY - layer.y1[maxJ] * vScale;
            const botY = centerY - layer.y0[maxJ] * vScale;
            const midY = (topY + botY) / 2;
            const fontSize = Math.min(12, Math.max(6, maxH * 0.32));

            ctx.font = '700 ' + fontSize + 'px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Check text fits
            const metrics = ctx.measureText(layer.civ.name);
            const availWidth = getStreamWidthAtJ(layer, maxJ);
            let name = layer.civ.name;
            if (metrics.width > availWidth * 0.9) {
                // Try short name
                name = name.length > 12 ? name.substring(0, 10) + '…' : name;
            }

            ctx.fillStyle = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.9)';
            ctx.shadowColor = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 4;
            ctx.fillText(name, x, midY);
            ctx.shadowBlur = 0;
        });
    }

    function getStreamWidthAtJ(layer, j) {
        // Approximate horizontal width of the stream at time index j (how many consecutive non-zero samples)
        let start = j, end = j;
        while (start > 0 && layer.weights[start - 1] > 0.1) start--;
        while (end < timePoints.length - 1 && layer.weights[end + 1] > 0.1) end++;
        return (end - start) * stepPx;
    }

    function drawEventMarkers(ctx) {
        const isDark = state.theme === 'dark';
        const events = EVENTS.filter(e => e.importance >= 5 && e.icon);

        events.forEach(ev => {
            const x = (ev.year - CONFIG.START_YEAR) * CONFIG.PX_PER_YEAR * state.zoom;
            const j = Math.round((ev.year - CONFIG.START_YEAR) / CONFIG.SAMPLE_STEP);
            if (j < 0 || j >= timePoints.length) return;

            // Find y center of region's active streams
            const regionLayers = layers.filter(l => l.civ.region === ev.region && l.weights[j] > 0.1);
            if (regionLayers.length === 0) return;

            let minTop = Infinity, maxBot = -Infinity;
            regionLayers.forEach(l => {
                const t = centerY - l.y1[j] * vScale;
                const b = centerY - l.y0[j] * vScale;
                if (t < minTop) minTop = t;
                if (b > maxBot) maxBot = b;
            });
            const cy = (minTop + maxBot) / 2;

            // Draw small icon
            ctx.font = '10px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.7;
            ctx.fillText(ev.icon, x, cy);
            ctx.globalAlpha = 1.0;
        });
    }

    // ========== FULL RENDER ==========
    function renderFull() {
        clearCanvas(bgCtx, bgCanvas);
        drawBackground(bgCtx);
        drawEraBands(bgCtx);
        drawStreams(bgCtx);
        drawStreamLabels(bgCtx);
        drawEventMarkers(bgCtx);
        drawTimeAxis(bgCtx);
    }

    function renderHover() {
        clearCanvas(fgCtx, fgCanvas);

        // Sync map highlight whenever stream hover changes
        if (state.mapVisible) renderMap(state.mapYear);

        if (state.hoveredLayer) {
            const isDark = state.theme === 'dark';

            // Dim overlay
            fgCtx.fillStyle = isDark ? 'rgba(8,8,24,0.65)' : 'rgba(240,236,229,0.65)';
            fgCtx.fillRect(0, 0, canvasW, canvasH);

            // Draw highlighted stream at full brightness
            const hl = state.hoveredLayer;
            traceStreamPath(fgCtx, hl);
            const col = hl.civ.color;
            let minY = Infinity, maxY = -Infinity;
            for (let j = 0; j < timePoints.length; j++) {
                const t = centerY - hl.y1[j] * vScale;
                const b = centerY - hl.y0[j] * vScale;
                if (t < minY) minY = t;
                if (b > maxY) maxY = b;
            }
            if (maxY - minY < 1) { minY = centerY - 1; maxY = centerY + 1; }
            const grad = fgCtx.createLinearGradient(0, minY, 0, maxY);
            grad.addColorStop(0, hexToRGBA(col, 0.95));
            grad.addColorStop(0.5, hexToRGBA(col, 1.0));
            grad.addColorStop(1, hexToRGBA(col, 0.9));
            fgCtx.fillStyle = grad;
            fgCtx.fill();
            // Bright stroke
            fgCtx.strokeStyle = hexToRGBA(col, 0.8);
            fgCtx.lineWidth = 1.5;
            fgCtx.stroke();

            // Draw related streams (parent/child) at medium brightness
            layers.forEach(l => {
                if (l === hl) return;
                if (!isRelated(hl, l)) return;
                traceStreamPath(fgCtx, l);
                fgCtx.fillStyle = hexToRGBA(l.civ.color, 0.5);
                fgCtx.fill();
                fgCtx.strokeStyle = hexToRGBA(l.civ.color, 0.4);
                fgCtx.lineWidth = 1;
                fgCtx.stroke();
            });

            // Highlighted stream label
            let maxH = 0, maxJ = 0;
            for (let j = 0; j < timePoints.length; j++) {
                const h = (hl.y1[j] - hl.y0[j]) * vScale;
                if (h > maxH) { maxH = h; maxJ = j; }
            }
            if (maxH > 8) {
                const x = maxJ * stepPx;
                const topY = centerY - hl.y1[maxJ] * vScale;
                const botY = centerY - hl.y0[maxJ] * vScale;
                const midY = (topY + botY) / 2;
                const fontSize = Math.min(14, Math.max(8, maxH * 0.38));
                fgCtx.font = '800 ' + fontSize + 'px Inter, sans-serif';
                fgCtx.fillStyle = 'rgba(255,255,255,0.95)';
                fgCtx.textAlign = 'center';
                fgCtx.textBaseline = 'middle';
                fgCtx.shadowColor = 'rgba(0,0,0,0.7)';
                fgCtx.shadowBlur = 5;
                fgCtx.fillText(hl.civ.name, x, midY);
                fgCtx.shadowBlur = 0;
            }
        }

        // Always draw the year indicator on top
        drawYearIndicator();
    }

    // ========== HIT DETECTION ==========
    function isRelated(a, b) {
        if (!a || !b) return false;
        return a.civ.parent === b.civ.id ||
               b.civ.parent === a.civ.id ||
               (a.civ.parent && a.civ.parent === b.civ.parent);
    }

    function findLayerAt(cx, cy) {
        const j = Math.round(cx / stepPx);
        if (j < 0 || j >= timePoints.length) return null;
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].weights[j] < 0.1) continue;
            const top = centerY - layers[i].y1[j] * vScale;
            const bot = centerY - layers[i].y0[j] * vScale;
            if (cy >= top && cy <= bot) return layers[i];
        }
        return null;
    }

    // ========== INTERACTION ==========
    function handleMouseMove(e) {
        if (state.isDragging) return;
        if (state.isDraggingIndicator) return;

        const rect = fgCanvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;
        const layer = findLayerAt(cx, cy);

        if (layer !== state.hoveredLayer) {
            state.hoveredLayer = layer;
            renderHover();
        } else {
            // Redraw foreground to clear ghost trails, then redraw cursor + indicator
            clearCanvas(fgCtx, fgCanvas);
            if (state.hoveredLayer) renderHover();
            drawCursorLine(cx);
            drawYearIndicator();
        }

        // Update cursor style near indicator
        if (isNearIndicator(cx)) {
            fgCanvas.style.cursor = 'ew-resize';
        } else if (layer) {
            fgCanvas.style.cursor = 'pointer';
        } else {
            fgCanvas.style.cursor = state.isDragging ? 'grabbing' : 'grab';
        }

        // Tooltip
        if (layer) {
            const j = Math.round(cx / stepPx);
            const year = (j >= 0 && j < timePoints.length) ? timePoints[j] : 0;
            tooltip.innerHTML =
                '<div class="sg-tip-name" style="color:' + layer.civ.color + '">' + layer.civ.name + '</div>' +
                '<div class="sg-tip-range">' + formatYear(layer.civ.start) + ' – ' + formatYear(layer.civ.end) + '</div>' +
                '<div class="sg-tip-region">' + (REGIONS.find(r => r.id === layer.civ.region) || {}).name + '</div>' +
                '<div class="sg-tip-year">Cursor: ' + formatYear(year) + '</div>';
            tooltip.style.display = 'block';
            let tx = e.clientX + 16, ty = e.clientY - 12;
            tooltip.style.left = tx + 'px';
            tooltip.style.top = ty + 'px';
            // Keep on screen
            const tr = tooltip.getBoundingClientRect();
            if (tr.right > window.innerWidth - 10) tooltip.style.left = (e.clientX - tr.width - 16) + 'px';
            if (tr.bottom > window.innerHeight - 10) tooltip.style.top = (e.clientY - tr.height - 10) + 'px';
        } else {
            tooltip.style.display = 'none';
        }
    }

    function drawCursorLine(cx) {
        const isDark = state.theme === 'dark';
        // Faint cursor line (no ghost trails — fgCanvas is cleared before this)
        fgCtx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
        fgCtx.lineWidth = 1;
        fgCtx.setLineDash([5, 5]);
        fgCtx.beginPath();
        fgCtx.moveTo(cx, 0);
        fgCtx.lineTo(cx, canvasH);
        fgCtx.stroke();
        fgCtx.setLineDash([]);
    }

    // ========== YEAR INDICATOR LINE (screen-fixed) ==========
    function getIndicatorCanvasX() {
        // The indicator is at a fixed screen position; convert to canvas-local x
        return scrollContainer.scrollLeft + state.indicatorRatio * scrollContainer.clientWidth;
    }

    function getIndicatorYear() {
        var pxPerYear = CONFIG.PX_PER_YEAR * state.zoom;
        var cx = getIndicatorCanvasX();
        var y = Math.round(cx / pxPerYear + CONFIG.START_YEAR);
        return Math.max(CONFIG.START_YEAR, Math.min(CONFIG.END_YEAR, y));
    }

    function drawYearIndicator() {
        var ix = getIndicatorCanvasX();
        var year = getIndicatorYear();
        var isDark = state.theme === 'dark';
        var accentColor = '#f59e0b'; // amber accent

        // Main vertical line
        fgCtx.strokeStyle = accentColor;
        fgCtx.lineWidth = 2;
        fgCtx.setLineDash([]);
        fgCtx.beginPath();
        fgCtx.moveTo(ix, 0);
        fgCtx.lineTo(ix, canvasH);
        fgCtx.stroke();

        // Glow effect
        fgCtx.strokeStyle = isDark ? 'rgba(245,158,11,0.25)' : 'rgba(245,158,11,0.15)';
        fgCtx.lineWidth = 6;
        fgCtx.beginPath();
        fgCtx.moveTo(ix, 0);
        fgCtx.lineTo(ix, canvasH);
        fgCtx.stroke();
        fgCtx.lineWidth = 1;

        // Drag handle (diamond at top)
        fgCtx.fillStyle = accentColor;
        fgCtx.beginPath();
        fgCtx.moveTo(ix, 2);
        fgCtx.lineTo(ix + 6, 10);
        fgCtx.lineTo(ix, 18);
        fgCtx.lineTo(ix - 6, 10);
        fgCtx.closePath();
        fgCtx.fill();

        // Year label pill below handle
        var label = formatYear(year);
        fgCtx.font = '700 11px Inter, sans-serif';
        var tw = fgCtx.measureText(label).width + 12;
        var lx = ix - tw / 2, ly = 20;
        fgCtx.fillStyle = accentColor;
        fgCtx.beginPath();
        fgCtx.roundRect(lx, ly, tw, 18, 4);
        fgCtx.fill();
        fgCtx.fillStyle = '#000';
        fgCtx.textBaseline = 'middle';
        fgCtx.fillText(label, ix, ly + 9);
    }

    function isNearIndicator(cx) {
        var ix = getIndicatorCanvasX();
        return Math.abs(cx - ix) < 12;
    }

    function handleMouseLeave() {
        if (state.hoveredLayer) {
            state.hoveredLayer = null;
            renderHover();
        } else {
            // Ensure indicator stays visible even after mouse leaves
            clearCanvas(fgCtx, fgCanvas);
            drawYearIndicator();
        }
        tooltip.style.display = 'none';
    }

    function showCivDetail(civ) {
        const regionInfo = REGIONS.find(r => r.id === civ.region) || {};
        const relatedEvents = EVENTS.filter(ev =>
            ev.region === civ.region && ev.year >= civ.start && ev.year <= civ.end
        ).sort((a, b) => a.year - b.year);

        let html = '<div style="border-left:4px solid ' + civ.color + ';padding-left:16px;margin-bottom:20px;">' +
            '<h2 style="color:' + civ.color + ';margin:0;font-family:Playfair Display,serif;">' + civ.name + '</h2>' +
            '<p style="color:var(--text-muted);margin:4px 0 0;">' + formatYear(civ.start) + ' – ' + formatYear(civ.end) + '</p>' +
            '<p style="margin:4px 0 0;font-size:0.85rem;"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + regionInfo.color + ';margin-right:6px;vertical-align:middle;"></span>' + regionInfo.name + '</p>' +
            '</div>';

        if (civ.parent) {
            const parentCiv = CIVILIZATIONS.find(c => c.id === civ.parent);
            if (parentCiv) {
                html += '<p style="color:var(--text-secondary);font-size:0.82rem;margin-bottom:12px;">Successor of <strong style="color:' + parentCiv.color + '">' + parentCiv.name + '</strong></p>';
            }
        }

        // Children
        const children = CIVILIZATIONS.filter(c => c.parent === civ.id);
        if (children.length > 0) {
            html += '<p style="color:var(--text-secondary);font-size:0.82rem;margin-bottom:12px;">Succeeded by: ' +
                children.map(c => '<strong style="color:' + c.color + '">' + c.name + '</strong>').join(', ') + '</p>';
        }

        const relatedForDetail = EVENTS.filter(ev =>
            ev.region === civ.region && ev.year >= civ.start && ev.year <= civ.end
        ).sort((a, b) => a.year - b.year);

        if (relatedForDetail.length > 0) {
            html += '<h3 style="margin-top:16px;font-size:0.78rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;">Key Events</h3>';
            html += '<div style="margin-top:6px;">';
            relatedForDetail.slice(0, 12).forEach(ev => {
                html += '<div style="padding:6px 0;border-bottom:1px solid var(--border-color);font-size:0.82rem;">' +
                    '<span style="color:var(--text-muted);min-width:75px;display:inline-block;">' + formatYear(ev.year) + '</span> ' +
                    (ev.icon ? ev.icon + ' ' : '') + ev.title + '</div>';
            });
            html += '</div>';
        }

        detailContent.innerHTML = html;
        detailOverlay.classList.add('active');
    }

    function handleClick(e) {
        // Always move the year indicator to the clicked position
        var scRect = scrollContainer.getBoundingClientRect();
        var viewportX = e.clientX - scRect.left;
        state.indicatorRatio = Math.max(0.02, Math.min(0.98, viewportX / scrollContainer.clientWidth));
        updateMapFromIndicator();
        clearCanvas(fgCtx, fgCanvas);
        renderHover();

        // If clicking on a stream, also open its detail panel
        if (state.hoveredLayer) {
            showCivDetail(state.hoveredLayer.civ);
        }
    }

    // ========== DRAG TO PAN / INDICATOR DRAG ==========
    function handleDragStart(e) {
        if (e.button !== 0) return;
        // Convert to canvas-local X for hit-testing
        var scRect = scrollContainer.getBoundingClientRect();
        var viewportX = e.clientX - scRect.left;
        var cx = scrollContainer.scrollLeft + viewportX;

        // Check if clicking near the year indicator — start indicator drag
        if (isNearIndicator(cx)) {
            e.preventDefault();
            state.isDraggingIndicator = true;
            fgCanvas.style.cursor = 'ew-resize';
            return;
        }

        state.isDragging = true;
        state.dragStartX = e.clientX;
        state.scrollStartX = scrollContainer.scrollLeft;
        fgCanvas.style.cursor = 'grabbing';
    }

    function handleDragMove(e) {
        if (state.isDraggingIndicator) {
            var scRect = scrollContainer.getBoundingClientRect();
            var viewportX = e.clientX - scRect.left;
            var newRatio = Math.max(0.02, Math.min(0.98, viewportX / scrollContainer.clientWidth));
            if (newRatio !== state.indicatorRatio) {
                state.indicatorRatio = newRatio;
                updateMapFromIndicator();
                clearCanvas(fgCtx, fgCanvas);
                renderHover();
            }
            return;
        }
        if (!state.isDragging) return;
        const dx = e.clientX - state.dragStartX;
        scrollContainer.scrollLeft = state.scrollStartX - dx;
    }

    function handleDragEnd() {
        if (state.isDraggingIndicator) {
            state.isDraggingIndicator = false;
            fgCanvas.style.cursor = 'grab';
            return;
        }
        state.isDragging = false;
        fgCanvas.style.cursor = 'grab';
    }

    // ========== LEGEND ==========
    function buildLegend() {
        const regionOrder = ['americas', 'africa', 'europe', 'middle-east', 'south-asia', 'east-asia'];
        let html = '';
        regionOrder.forEach(rid => {
            const region = REGIONS.find(r => r.id === rid);
            const civs = CIVILIZATIONS.filter(c => c.region === rid).sort((a, b) => a.start - b.start);
            html += '<div class="sg-legend-group">' +
                '<div class="sg-legend-region" style="color:' + region.color + '">' + region.name + '</div>';
            civs.forEach(c => {
                html += '<div class="sg-legend-item">' +
                    '<span class="sg-legend-swatch" style="background:' + c.color + '"></span>' +
                    '<span class="sg-legend-name">' + c.name + '</span>' +
                    '<span class="sg-legend-dates">' + formatYear(c.start) + ' – ' + formatYear(c.end) + '</span>' +
                    '</div>';
            });
            html += '</div>';
        });
        legendContent.innerHTML = html;
    }

    function buildEraBar() {
        const eraBar = document.getElementById('eraBar');
        const totalYears = CONFIG.END_YEAR - CONFIG.START_YEAR;
        eraBar.innerHTML = ERAS.map(era => {
            const pct = ((era.end - era.start) / totalYears) * 100;
            return '<div class="sg-era-segment" data-era-start="' + era.start + '" data-era-end="' + era.end + '" style="width:' + pct + '%;background:' + hexToRGBA(era.color, 0.12) + ';border-bottom:3px solid ' + era.color + ';cursor:pointer;">' +
                '<span style="color:' + era.color + '">' + era.name + '</span></div>';
        }).join('');
        eraBar.addEventListener('click', function (e) {
            var seg = e.target.closest('.sg-era-segment');
            if (!seg) return;
            var start = parseInt(seg.getAttribute('data-era-start'));
            var end = parseInt(seg.getAttribute('data-era-end'));
            var midYear = (start + end) / 2;
            var targetX = (midYear - CONFIG.START_YEAR) * CONFIG.PX_PER_YEAR * state.zoom;
            scrollContainer.scrollTo({ left: targetX - scrollContainer.clientWidth / 2, behavior: 'smooth' });
        });
    }

    // ========== ZOOM ==========
    function setZoom(z) {
        const oldZoom = state.zoom;
        state.zoom = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, z));

        // Maintain scroll position (keep center year)
        const centerX = scrollContainer.scrollLeft + scrollContainer.clientWidth / 2;
        const yearAtCenter = centerX / (CONFIG.PX_PER_YEAR * oldZoom);

        setupCanvases();
        computeLayout();
        renderFull();
        renderHover();

        const newCenterX = yearAtCenter * CONFIG.PX_PER_YEAR * state.zoom;
        scrollContainer.scrollLeft = newCenterX - scrollContainer.clientWidth / 2;

        document.getElementById('zoomLevel').textContent = Math.round(state.zoom * 100) + '%';
        updateMapFromScroll();
    }

    function toggleTheme() {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', state.theme);
        renderFull();
        renderHover();
        // Theme affects base map cache
        mapBaseCacheDark = null;
        mapBaseCacheLight = null;
        renderMap(state.mapYear);
    }

    // ========== DEBOUNCE ==========
    function debounce(fn, ms) {
        let t;
        return function () {
            const args = arguments;
            const self = this;
            clearTimeout(t);
            t = setTimeout(function () { fn.apply(self, args); }, ms);
        };
    }

    // =========================================================
    //  WORLD MAP — D3 + TopoJSON canvas map with civ territories
    // =========================================================

    // World map data (loaded async from CDN)
    let worldTopology = null;
    let worldLand = null;
    let worldCountries = null;
    let mapProjection = null;
    let mapPathGen = null;
    let mapBaseCacheDark = null;  // offscreen canvas cache (dark theme)
    let mapBaseCacheLight = null; // offscreen canvas cache (light theme)

    // Approximate territory data for each civilization in [lon, lat] degrees
    // rlon/rlat = radius in degrees for territory extent
    const CIV_TERRITORIES = {
        // Americas
        'olmec':        { lon: -96, lat: 18, rlon: 4, rlat: 3 },
        'maya':         { lon: -89, lat: 17, rlon: 5, rlat: 4 },
        'teotihuacan':  { lon: -99, lat: 20, rlon: 3, rlat: 3 },
        'aztec':        { lon: -99, lat: 19, rlon: 5, rlat: 5 },
        'inca':         { lon: -72, lat: -13, rlon: 5, rlat: 15 },
        'usa':          { lon: -95, lat: 38, rlon: 25, rlat: 10 },
        // Africa
        'egypt-old':    { lon: 31, lat: 27, rlon: 4, rlat: 5 },
        'egypt-middle': { lon: 31, lat: 27, rlon: 4, rlat: 5 },
        'egypt-new':    { lon: 31, lat: 27, rlon: 6, rlat: 8 },
        'kush':         { lon: 33, lat: 18, rlon: 4, rlat: 5 },
        'aksum':        { lon: 39, lat: 14, rlon: 4, rlat: 4 },
        'ghana':        { lon: -5, lat: 12, rlon: 6, rlat: 4 },
        'mali':         { lon: -3, lat: 14, rlon: 10, rlat: 6 },
        'songhai':      { lon: 0, lat: 15, rlon: 8, rlat: 5 },
        // Europe
        'minoan':       { lon: 25, lat: 35.5, rlon: 2, rlat: 1.5 },
        'mycenaean':    { lon: 23, lat: 37.5, rlon: 3, rlat: 2 },
        'greek':        { lon: 23, lat: 38, rlon: 6, rlat: 4 },
        'roman':        { lon: 12, lat: 42, rlon: 15, rlat: 10 },
        'byzantine':    { lon: 29, lat: 41, rlon: 8, rlat: 5 },
        'charlemagne':  { lon: 7, lat: 49, rlon: 8, rlat: 6 },
        'hre':          { lon: 11, lat: 50, rlon: 6, rlat: 6 },
        'france':       { lon: 2, lat: 47, rlon: 5, rlat: 4 },
        'british':      { lon: -2, lat: 54, rlon: 4, rlat: 4 },
        'soviet':       { lon: 55, lat: 57, rlon: 40, rlat: 12 },
        // Middle East
        'sumer':        { lon: 45, lat: 31, rlon: 3, rlat: 3 },
        'akkad':        { lon: 44, lat: 33, rlon: 4, rlat: 3 },
        'babylon':      { lon: 44, lat: 33, rlon: 5, rlat: 3 },
        'assyria':      { lon: 43, lat: 36, rlon: 7, rlat: 5 },
        'achaemenid':   { lon: 52, lat: 32, rlon: 15, rlat: 10 },
        'parthia':      { lon: 56, lat: 35, rlon: 10, rlat: 7 },
        'sassanid':     { lon: 52, lat: 33, rlon: 10, rlat: 7 },
        'umayyad':      { lon: 36, lat: 30, rlon: 25, rlat: 12 },
        'abbasid':      { lon: 44, lat: 33, rlon: 20, rlat: 10 },
        'ottoman':      { lon: 32, lat: 39, rlon: 12, rlat: 8 },
        // South Asia
        'indus':        { lon: 69, lat: 27, rlon: 5, rlat: 5 },
        'maurya':       { lon: 80, lat: 23, rlon: 10, rlat: 8 },
        'gupta':        { lon: 82, lat: 25, rlon: 8, rlat: 7 },
        'chola':        { lon: 79, lat: 11, rlon: 4, rlat: 6 },
        'mughal':       { lon: 77, lat: 25, rlon: 10, rlat: 8 },
        // East Asia
        'shang':        { lon: 113, lat: 35, rlon: 5, rlat: 4 },
        'zhou':         { lon: 109, lat: 34, rlon: 8, rlat: 6 },
        'qin':          { lon: 109, lat: 34, rlon: 10, rlat: 8 },
        'han':          { lon: 112, lat: 34, rlon: 15, rlat: 10 },
        'tang':         { lon: 109, lat: 34, rlon: 20, rlat: 12 },
        'song':         { lon: 116, lat: 30, rlon: 10, rlat: 8 },
        'mongol':       { lon: 100, lat: 47, rlon: 35, rlat: 15 },
        'ming':         { lon: 116, lat: 35, rlon: 12, rlat: 10 },
        'qing':         { lon: 110, lat: 35, rlon: 18, rlat: 12 },
        'roc':          { lon: 112, lat: 32, rlon: 12, rlat: 8 },
        'prc':          { lon: 105, lat: 35, rlon: 18, rlat: 12 },
        'japan':        { lon: 136, lat: 36, rlon: 4, rlat: 7 },
        'india':        { lon: 80, lat: 22, rlon: 10, rlat: 10 },
    };

    // ISO 3166-1 numeric country codes covered by each civilization.
    // Used to fill real country polygons on the world map.
    const CIV_COUNTRY_IDS = {
        // Americas
        'olmec':        [484],
        'maya':         [484, 320, 84, 340, 222],
        'teotihuacan':  [484],
        'aztec':        [484],
        'inca':         [604, 68, 218, 152, 32, 170],
        'usa':          [840],
        // Africa
        'egypt-old':    [818],
        'egypt-middle': [818],
        'egypt-new':    [818, 729, 728, 376, 422, 760],
        'kush':         [729, 728, 818],
        'aksum':        [231, 232, 262, 706],
        'ghana':        [466, 478, 686],
        'mali':         [466, 324, 686, 270, 624, 854],
        'songhai':      [466, 562, 854, 478, 288],
        // Europe
        'minoan':       [300],
        'mycenaean':    [300],
        'greek':        [300, 792],
        'roman':        [380, 724, 620, 250, 826, 276, 528, 56, 756, 40, 348, 300, 792, 818, 434, 788, 191, 642, 100, 807, 8, 422, 376, 760],
        'byzantine':    [792, 300, 100, 642, 8, 807, 191, 422, 760, 376, 818, 434, 788, 380],
        'charlemagne':  [250, 276, 528, 56, 442, 756, 40, 380, 724, 203, 705, 191],
        'hre':          [276, 40, 203, 703, 756, 528, 56, 442, 380, 705, 191],
        'france':       [250],
        'british':      [826, 372],
        'soviet':       [643, 804, 112, 398, 268, 51, 31, 860, 795, 762, 417, 498, 428, 440, 233],
        // Middle East
        'sumer':        [368],
        'akkad':        [368, 760, 414],
        'babylon':      [368, 760, 414],
        'assyria':      [368, 760, 792, 422, 376, 818],
        'achaemenid':   [364, 368, 792, 818, 586, 4, 860, 729, 887, 400, 760, 422, 376, 414, 51, 31, 268],
        'parthia':      [364, 368, 4, 795, 586],
        'sassanid':     [364, 368, 4, 586, 795, 31, 51, 414, 887, 760],
        'umayyad':      [682, 760, 368, 818, 434, 788, 12, 724, 620, 364, 4, 586, 887, 422, 376, 400, 414, 512, 860, 762],
        'abbasid':      [368, 364, 682, 760, 400, 422, 376, 414, 818, 887, 512, 4, 586, 860, 31],
        'ottoman':      [792, 300, 100, 642, 348, 688, 70, 8, 807, 191, 368, 760, 422, 376, 400, 682, 818, 434, 788, 12, 887],
        // South Asia
        'indus':        [586, 356, 4],
        'maurya':       [356, 586, 50, 4, 524],
        'gupta':        [356, 586, 50, 524],
        'chola':        [356, 144],
        'mughal':       [356, 586, 50, 4, 524],
        // East Asia
        'shang':        [156],
        'zhou':         [156],
        'qin':          [156],
        'han':          [156, 496, 704, 408],
        'tang':         [156, 496, 704, 408, 4, 417, 860],
        'song':         [156, 704],
        'mongol':       [496, 156, 643, 398, 804, 364, 368, 792, 4, 795, 762, 417, 860, 31, 51, 268, 616, 348],
        'ming':         [156, 704, 496, 408],
        'qing':         [156, 496, 704, 408, 417, 762, 398],
        'roc':          [156, 158],
        'prc':          [156, 158],
        'japan':        [392],
        'india':        [356, 144, 462],
    };

    // Load world map TopoJSON data from CDN
    function loadWorldMap() {
        fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
            .then(function(r) { return r.json(); })
            .then(function(topology) {
                worldTopology = topology;
                worldLand = topojson.feature(topology, topology.objects.land);
                worldCountries = topojson.feature(topology, topology.objects.countries);
                mapBaseCacheDark = null;
                mapBaseCacheLight = null;
                // Force re-render now that data is loaded
                if (state.mapVisible) renderMap(state.mapYear);
            })
            .catch(function(e) {
                console.warn('Failed to load world map data:', e);
            });
    }

    // Build an offscreen canvas with the base map (land, borders, graticule)
    function buildMapBaseCache(isDark) {
        if (!worldLand || !mapProjection) return null;
        var dpr = window.devicePixelRatio || 1;
        var offscreen = document.createElement('canvas');
        offscreen.width = mapW * dpr;
        offscreen.height = mapH * dpr;
        var ctx = offscreen.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var pathGen = d3.geoPath(mapProjection).context(ctx);

        // Background
        var bgGrad = ctx.createRadialGradient(mapW * 0.5, mapH * 0.5, 0, mapW * 0.5, mapH * 0.5, mapW * 0.6);
        if (isDark) {
            bgGrad.addColorStop(0, '#0e0e28');
            bgGrad.addColorStop(1, '#080818');
        } else {
            bgGrad.addColorStop(0, '#eae6df');
            bgGrad.addColorStop(1, '#ddd8ce');
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, mapW, mapH);

        // Graticule
        var graticule = d3.geoGraticule10();
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        pathGen(graticule);
        ctx.stroke();

        // Land fill
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(60,50,40,0.08)';
        ctx.beginPath();
        pathGen(worldLand);
        ctx.fill();

        // Country borders
        var countries = topojson.mesh(worldTopology, worldTopology.objects.countries, function(a, b) { return a !== b; });
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 0.3;
        ctx.beginPath();
        pathGen(countries);
        ctx.stroke();

        // Coastlines
        var coastlines = topojson.mesh(worldTopology, worldTopology.objects.land);
        ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        pathGen(coastlines);
        ctx.stroke();

        return offscreen;
    }

    let mapW, mapH;

    function setupMapCanvas() {
        mapCanvas = document.getElementById('mapCanvas');
        const container = mapCanvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        mapW = Math.floor(rect.width);
        mapH = Math.floor(rect.height);
        mapCanvas.width = mapW * dpr;
        mapCanvas.height = mapH * dpr;
        mapCanvas.style.width = mapW + 'px';
        mapCanvas.style.height = mapH + 'px';
        mapCtx = mapCanvas.getContext('2d');
        mapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Setup D3 projection to fit the canvas
        mapProjection = d3.geoNaturalEarth1()
            .fitSize([mapW, mapH], { type: 'Sphere' });
        mapPathGen = d3.geoPath(mapProjection).context(mapCtx);

        // Invalidate base map caches on resize
        mapBaseCacheDark = null;
        mapBaseCacheLight = null;
    }

    function renderMap(year) {
        if (!mapCtx) return;
        const isDark = state.theme === 'dark';

        // Clear
        mapCtx.clearRect(0, 0, mapW, mapH);

        // Draw cached base map (or build it)
        if (worldLand) {
            var cache = isDark ? mapBaseCacheDark : mapBaseCacheLight;
            if (!cache) {
                cache = buildMapBaseCache(isDark);
                if (isDark) mapBaseCacheDark = cache;
                else mapBaseCacheLight = cache;
            }
            if (cache) {
                mapCtx.drawImage(cache, 0, 0, mapW, mapH);
            }
        } else {
            // Fallback while loading: plain background
            var bgGrad = mapCtx.createRadialGradient(mapW * 0.5, mapH * 0.5, 0, mapW * 0.5, mapH * 0.5, mapW * 0.6);
            if (isDark) {
                bgGrad.addColorStop(0, '#0e0e28');
                bgGrad.addColorStop(1, '#080818');
            } else {
                bgGrad.addColorStop(0, '#eae6df');
                bgGrad.addColorStop(1, '#ddd8ce');
            }
            mapCtx.fillStyle = bgGrad;
            mapCtx.fillRect(0, 0, mapW, mapH);
            // Loading text
            mapCtx.fillStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
            mapCtx.font = '11px Inter, sans-serif';
            mapCtx.textAlign = 'center';
            mapCtx.textBaseline = 'middle';
            mapCtx.fillText('Loading world map…', mapW / 2, mapH / 2);
        }

        // Draw active civilization territories
        if (!mapProjection) return;
        var activeCivs = CIVILIZATIONS.filter(function(c) {
            return year >= c.start && year <= c.end;
        });

        if (worldCountries) {
            // Determine focused civ: stream hover takes precedence over map hover
            var focusedCivId = null;
            if (state.hoveredLayer) focusedCivId = state.hoveredLayer.civ.id;
            else if (state.mapHoveredCiv) focusedCivId = state.mapHoveredCiv.id;
            var hasFocus = !!focusedCivId;

            // Build per-civ feature list (filter once per render call)
            var civFeatureMap = {};
            activeCivs.forEach(function(civ) {
                var ids = CIV_COUNTRY_IDS[civ.id];
                if (ids) {
                    civFeatureMap[civ.id] = worldCountries.features.filter(function(f) {
                        return ids.indexOf(+f.id) !== -1;
                    });
                }
            });

            // Sort: bigger empires drawn first so smaller overlays appear on top
            activeCivs.sort(function(a, b) {
                return ((civFeatureMap[b.id] || []).length) - ((civFeatureMap[a.id] || []).length);
            });

            var civPathGen = d3.geoPath(mapProjection).context(mapCtx);

            activeCivs.forEach(function(civ) {
                var features = civFeatureMap[civ.id];
                if (!features || features.length === 0) return;

                // Fade-in/out alpha based on indicator year position within civ lifespan
                var dur = civ.end - civ.start;
                var ramp = Math.min(dur * 0.15, 80);
                var alpha = 1.0;
                if (ramp > 0) {
                    if (year < civ.start + ramp) alpha = (year - civ.start) / ramp;
                    if (year > civ.end - ramp) alpha = (civ.end - year) / ramp;
                }
                alpha = Math.max(0, Math.min(1, alpha));

                var isFocused = !hasFocus || civ.id === focusedCivId;
                var dimFactor = hasFocus ? (isFocused ? 1.0 : 0.15) : 1.0;
                var fillAlpha = (isFocused && hasFocus) ? 0.60 : 0.38;

                // Colored fill
                mapCtx.shadowColor = civ.color;
                mapCtx.shadowBlur = (isFocused && hasFocus) ? 18 : 5;
                mapCtx.fillStyle = hexToRGBA(civ.color, fillAlpha * alpha * dimFactor);
                features.forEach(function(feature) {
                    mapCtx.beginPath();
                    civPathGen(feature);
                    mapCtx.fill();
                });
                mapCtx.shadowBlur = 0;

                // Border
                mapCtx.strokeStyle = hexToRGBA(civ.color, (isFocused && hasFocus ? 1.0 : 0.80) * alpha * dimFactor);
                mapCtx.lineWidth = (isFocused && hasFocus) ? 1.4 : 0.8;
                features.forEach(function(feature) {
                    mapCtx.beginPath();
                    civPathGen(feature);
                    mapCtx.stroke();
                });
            });
        }

        // Draw civilization labels at manually-tuned CIV_TERRITORIES positions
        mapCtx.textAlign = 'center';
        mapCtx.textBaseline = 'middle';
        activeCivs.forEach(function(civ) {
            // Only label civs that have a country mapping (real territory fill)
            if (!CIV_COUNTRY_IDS[civ.id]) return;
            var t = CIV_TERRITORIES[civ.id];
            if (!t) return;
            var pt = mapProjection([t.lon, t.lat]);
            if (!pt || pt[0] < 2 || pt[0] > mapW - 2 || pt[1] < 2 || pt[1] > mapH - 2) return;

            var dur = civ.end - civ.start;
            var ramp = Math.min(dur * 0.15, 80);
            var alpha = 1.0;
            if (ramp > 0) {
                if (year < civ.start + ramp) alpha = (year - civ.start) / ramp;
                if (year > civ.end - ramp) alpha = (civ.end - year) / ramp;
            }
            alpha = Math.max(0, Math.min(1, alpha));
            if (alpha < 0.25) return;

            mapCtx.font = '700 7px Inter, sans-serif';
            mapCtx.fillStyle = 'rgba(255,255,255,' + (0.95 * alpha) + ')';
            mapCtx.shadowColor = 'rgba(0,0,0,0.95)';
            mapCtx.shadowBlur = 4;
            mapCtx.fillText(civ.name, pt[0], pt[1]);
            mapCtx.shadowBlur = 0;
        });

        // Update civ tags below the map
        var html = '';
        activeCivs.forEach(function(civ) {
            html += '<span class="sg-map-civ-tag">' +
                '<span class="sg-map-civ-dot" style="background:' + civ.color + '"></span>' +
                civ.name + '</span>';
        });
        mapCivList.innerHTML = html;

        // Update year label
        mapYearEl.textContent = formatYear(year);
    }

    // ========== MAP MOUSE INTERACTION ==========
    function handleMapMouseMove(e) {
        if (!worldCountries || !mapProjection) return;
        var rect = mapCanvas.getBoundingClientRect();
        var scaleX = mapW / rect.width;
        var scaleY = mapH / rect.height;
        var px = (e.clientX - rect.left) * scaleX;
        var py = (e.clientY - rect.top) * scaleY;
        var lonlat = mapProjection.invert([px, py]);

        var found = null;
        if (lonlat) {
            var activeCivs = CIVILIZATIONS.filter(function(c) {
                return state.mapYear >= c.start && state.mapYear <= c.end;
            });
            outer: for (var i = 0; i < activeCivs.length; i++) {
                var civ = activeCivs[i];
                var ids = CIV_COUNTRY_IDS[civ.id];
                if (!ids) continue;
                for (var j = 0; j < worldCountries.features.length; j++) {
                    var feature = worldCountries.features[j];
                    if (ids.indexOf(+feature.id) === -1) continue;
                    if (d3.geoContains(feature, lonlat)) { found = civ; break outer; }
                }
            }
        }

        if (found !== state.mapHoveredCiv) {
            state.mapHoveredCiv = found;
            renderMap(state.mapYear);
        }

        if (found) {
            var regionInfo = REGIONS.find(function(r) { return r.id === found.region; }) || {};
            tooltip.innerHTML =
                '<div class="sg-tip-name" style="color:' + found.color + '">' + found.name + '</div>' +
                '<div class="sg-tip-range">' + formatYear(found.start) + ' – ' + formatYear(found.end) + '</div>' +
                '<div class="sg-tip-region">' + (regionInfo.name || '') + '</div>';
            tooltip.style.display = 'block';
            var tx = e.clientX + 16, ty = e.clientY - 12;
            tooltip.style.left = tx + 'px';
            tooltip.style.top = ty + 'px';
            var tr = tooltip.getBoundingClientRect();
            if (tr.right > window.innerWidth - 10) tooltip.style.left = (e.clientX - tr.width - 16) + 'px';
            if (tr.bottom > window.innerHeight - 10) tooltip.style.top = (e.clientY - tr.height - 10) + 'px';
            mapCanvas.style.cursor = 'pointer';
        } else {
            tooltip.style.display = 'none';
            mapCanvas.style.cursor = 'default';
        }
    }

    function handleMapMouseLeave() {
        if (state.mapHoveredCiv) {
            state.mapHoveredCiv = null;
            renderMap(state.mapYear);
        }
        tooltip.style.display = 'none';
        mapCanvas.style.cursor = 'default';
    }

    function handleMapClick() {
        if (state.mapHoveredCiv) showCivDetail(state.mapHoveredCiv);
    }

    // ========== ERA BACKGROUND CROSS-FADE ==========
    var eraLayers = {};
    var currentEraId = null;

    function initEraBg() {
        var layerEls = document.querySelectorAll('.sg-era-bg-layer');
        for (var i = 0; i < layerEls.length; i++) {
            eraLayers[layerEls[i].getAttribute('data-era')] = layerEls[i];
        }
    }

    function updateEraBg(year) {
        // Find which era this year belongs to
        var eraId = null;
        for (var i = 0; i < ERAS.length; i++) {
            if (year >= ERAS[i].start && year < ERAS[i].end) {
                eraId = ERAS[i].id;
                break;
            }
        }
        if (!eraId && year >= ERAS[ERAS.length - 1].end) eraId = ERAS[ERAS.length - 1].id;
        if (!eraId) eraId = ERAS[0].id;
        if (eraId === currentEraId) return;
        currentEraId = eraId;

        // Cross-fade: compute blend at era boundaries
        var era = null;
        for (var i = 0; i < ERAS.length; i++) {
            if (ERAS[i].id === eraId) { era = ERAS[i]; break; }
        }
        var keys = Object.keys(eraLayers);
        for (var i = 0; i < keys.length; i++) {
            eraLayers[keys[i]].style.opacity = (keys[i] === eraId) ? '1' : '0';
        }
    }

    function updateMapFromScroll() {
        var pxPerYear = CONFIG.PX_PER_YEAR * state.zoom;
        var centerX = scrollContainer.scrollLeft + scrollContainer.clientWidth / 2;
        var centerYear = Math.round(centerX / pxPerYear + CONFIG.START_YEAR);
        centerYear = Math.max(CONFIG.START_YEAR, Math.min(CONFIG.END_YEAR, centerYear));

        // Update era background
        updateEraBg(centerYear);

        // Redraw indicator (its canvas X shifts as scroll changes, but screen position is fixed)
        clearCanvas(fgCtx, fgCanvas);
        drawYearIndicator();

        // Update map to match the indicator's current year
        updateMapFromIndicator();
    }

    function updateMapFromIndicator() {
        var year = getIndicatorYear();
        if (!state.mapVisible) return;
        var snapped = Math.round(year / 5) * 5;
        if (snapped !== state.mapYear) {
            state.mapYear = snapped;
            renderMap(snapped);
        }
    }

    // ========== INIT ==========
    function init() {
        bgCanvas = document.getElementById('bgCanvas');
        fgCanvas = document.getElementById('fgCanvas');
        scrollContainer = document.getElementById('scrollContainer');
        tooltip = document.getElementById('tooltip');
        legendPanel = document.getElementById('legendPanel');
        legendContent = document.getElementById('legendContent');
        detailOverlay = document.getElementById('detailOverlay');
        detailContent = document.getElementById('detailContent');
        mapPanel = document.getElementById('mapPanel');
        mapYearEl = document.getElementById('mapYear');
        mapCivList = document.getElementById('mapCivList');

        // Generate data
        generateTimePoints();
        generateLayers();

        // Setup
        setupCanvases();
        computeLayout();

        // Setup map
        setupMapCanvas();

        // Kick off world map data fetch (async)
        loadWorldMap();

        // Init era backgrounds
        initEraBg();

        // Build UI
        buildLegend();
        buildEraBar();

        // Render
        renderFull();

        // Scroll to Classical Antiquity
        const classicalX = (-600 - CONFIG.START_YEAR) * CONFIG.PX_PER_YEAR * state.zoom;
        scrollContainer.scrollLeft = classicalX - scrollContainer.clientWidth / 2;

        // Initial map render
        updateMapFromScroll();

        // Event listeners
        fgCanvas.addEventListener('mousemove', handleMouseMove);
        fgCanvas.addEventListener('mouseleave', handleMouseLeave);
        fgCanvas.addEventListener('click', handleClick);

        // Drag to pan
        fgCanvas.addEventListener('mousedown', handleDragStart);
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);

        // Scroll → update map
        scrollContainer.addEventListener('scroll', updateMapFromScroll);

        // Zoom
        scrollContainer.addEventListener('wheel', function (e) {
            if (e.ctrlKey) {
                e.preventDefault();
                setZoom(state.zoom + (e.deltaY > 0 ? -CONFIG.ZOOM_STEP : CONFIG.ZOOM_STEP));
            }
        }, { passive: false });

        document.getElementById('zoomIn').addEventListener('click', function () { setZoom(state.zoom + CONFIG.ZOOM_STEP); });
        document.getElementById('zoomOut').addEventListener('click', function () { setZoom(state.zoom - CONFIG.ZOOM_STEP); });
        document.getElementById('themeToggle').addEventListener('click', toggleTheme);
        document.getElementById('toggleLegend').addEventListener('click', function () {
            state.legendVisible = !state.legendVisible;
            legendPanel.classList.toggle('active', state.legendVisible);
        });
        document.getElementById('mapToggle').addEventListener('click', function () {
            state.mapVisible = false;
            mapPanel.classList.add('hidden');
        });
        document.getElementById('mapExpand').addEventListener('click', function () {
            state.mapExpanded = !state.mapExpanded;
            mapPanel.classList.toggle('expanded', state.mapExpanded);
            var icon = document.getElementById('mapExpandIcon');
            icon.textContent = state.mapExpanded ? '⊡' : '⤢';
            setTimeout(function () {
                setupMapCanvas();
                renderMap(state.mapYear);
            }, 320);
        });
        document.getElementById('mapShow').addEventListener('click', function () {
            state.mapVisible = true;
            mapPanel.classList.remove('hidden');
            updateMapFromScroll();
        });
        // Map canvas interactions
        mapCanvas.addEventListener('mousemove', handleMapMouseMove);
        mapCanvas.addEventListener('mouseleave', handleMapMouseLeave);
        mapCanvas.addEventListener('click', handleMapClick);
        document.getElementById('detailClose').addEventListener('click', function () { detailOverlay.classList.remove('active'); });
        detailOverlay.addEventListener('click', function (e) { if (e.target === detailOverlay) detailOverlay.classList.remove('active'); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') detailOverlay.classList.remove('active');
        });

        window.addEventListener('resize', debounce(function () {
            setupCanvases();
            computeLayout();
            renderFull();
            renderHover();
            setupMapCanvas();
            updateMapFromScroll();
        }, 250));
    }

    document.addEventListener('DOMContentLoaded', init);
})();
