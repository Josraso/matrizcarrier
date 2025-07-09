// views/js/visual-range-editor.js

$(document).ready(function() {
    'use strict';
    
    var visualEditor = {
        container: null,
        timeline: null,
        ranges: [],
        maxWeight: 100,
        scale: 1,
        snapToGrid: true,
        gridSize: 0.5,
        selectedRange: null,
        isDragging: false,
        isResizing: false,
        resizeHandle: null
    };
    
    // Inicializar si estamos en la página correcta
    if ($('#visual-range-editor').length > 0) {
        init();
    }
    
    function init() {
        visualEditor.container = $('#visual-range-editor');
        visualEditor.timeline = $('#range-timeline');
        
        // Cargar configuración
        loadSettings();
        
        // Bind eventos
        bindEvents();
        
        // Cargar rangos existentes
        loadRanges();
        
        // Dibujar escala
        drawScale();
    }
    
    function loadSettings() {
        // Cargar peso máximo
        visualEditor.maxWeight = parseFloat($('#max-weight-setting').val()) || 100;
        
        // Snap to grid
        visualEditor.snapToGrid = $('#snap-to-grid').is(':checked');
        
        // Tamaño de grid
        visualEditor.gridSize = parseFloat($('#grid-size').val()) || 0.5;
    }
    
    function bindEvents() {
        // Cambiar peso máximo
        $('#max-weight-setting').on('change', function() {
            visualEditor.maxWeight = parseFloat($(this).val()) || 100;
            redraw();
        });
        
        // Toggle snap to grid
        $('#snap-to-grid').on('change', function() {
            visualEditor.snapToGrid = $(this).is(':checked');
        });
        
        // Cambiar tamaño de grid
        $('#grid-size').on('change', function() {
            visualEditor.gridSize = parseFloat($(this).val()) || 0.5;
            if (visualEditor.snapToGrid) {
                redraw();
            }
        });
        
        // Añadir nuevo rango
        $('#add-visual-range').on('click', function() {
            addNewRange();
        });
        
        // Presets
        $('.range-preset-btn').on('click', function() {
            applyPreset($(this).data('preset'));
        });
        
        // Zoom
        $('#zoom-in').on('click', function() {
            zoom(1.2);
        });
        
        $('#zoom-out').on('click', function() {
            zoom(0.8);
        });
        
        $('#zoom-reset').on('click', function() {
            visualEditor.scale = 1;
            redraw();
        });
        
        // Eventos del timeline
        visualEditor.timeline.on('mousedown', '.range-bar', function(e) {
            handleRangeMouseDown(e, $(this));
        });
        
        visualEditor.timeline.on('mousedown', '.range-handle', function(e) {
            handleResizeMouseDown(e, $(this));
        });
        
        // Eventos globales de mouse
        $(document).on('mousemove', function(e) {
            handleMouseMove(e);
        });
        
        $(document).on('mouseup', function(e) {
            handleMouseUp(e);
        });
        
        // Click en timeline vacío
        visualEditor.timeline.on('click', function(e) {
            if ($(e.target).hasClass('range-timeline')) {
                deselectAllRanges();
            }
        });
        
        // Teclas
        $(document).on('keydown', function(e) {
            handleKeyDown(e);
        });
        
        // Guardar cambios
        $('#save-visual-ranges').on('click', function() {
            saveRanges();
        });
        
        // Importar/Exportar
        $('#export-visual').on('click', function() {
            exportVisual();
        });
        
        $('#import-visual').on('click', function() {
            $('#import-visual-file').click();
        });
        
        $('#import-visual-file').on('change', function(e) {
            importVisual(e.target.files[0]);
        });
    }
    
    function loadRanges() {
        // Cargar rangos del servidor o del DOM
        var carrierId = $('#carrier_id').val();
        
        if (window.visualRangesData) {
            visualEditor.ranges = window.visualRangesData;
            drawRanges();
        } else {
            $.ajax({
                url: window.location.href,
                type: 'POST',
                data: {
                    action: 'get_visual_ranges',
                    carrier_id: carrierId
                },
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        visualEditor.ranges = response.ranges;
                        drawRanges();
                    }
                }
            });
        }
    }
    
    function drawScale() {
        var scaleHtml = '<div class="range-scale">';
        var steps = 10;
        var stepSize = visualEditor.maxWeight / steps;
        
        for (var i = 0; i <= steps; i++) {
            var value = i * stepSize;
            var position = (value / visualEditor.maxWeight) * 100;
            
            scaleHtml += '<div class="scale-mark" style="left: ' + position + '%">';
            scaleHtml += '<span class="scale-value">' + value + '</span>';
            scaleHtml += '</div>';
        }
        
        scaleHtml += '</div>';
        
        // Grid
        if (visualEditor.snapToGrid) {
            scaleHtml += '<div class="range-grid">';
            var gridSteps = visualEditor.maxWeight / visualEditor.gridSize;
            
            for (var i = 1; i < gridSteps; i++) {
                var position = (i / gridSteps) * 100;
                scaleHtml += '<div class="grid-line" style="left: ' + position + '%"></div>';
            }
            
            scaleHtml += '</div>';
        }
        
        $('#range-scale-container').html(scaleHtml);
    }
    
    function drawRanges() {
        visualEditor.timeline.empty();
        
        visualEditor.ranges.forEach(function(range, index) {
            drawRange(range, index);
        });
        
        updateRangeList();
    }
    
    function drawRange(range, index) {
        var startPos = (range.from / visualEditor.maxWeight) * 100;
        var width = ((range.to - range.from) / visualEditor.maxWeight) * 100;
        
        var $range = $('<div class="range-bar" data-index="' + index + '">' +
            '<span class="range-handle left"></span>' +
            '<span class="range-value">' + range.from + ' - ' + range.to + ' kg</span>' +
            '<span class="range-handle right"></span>' +
            '</div>');
        
        $range.css({
            left: startPos + '%',
            width: width + '%'
        });
        
        // Color según índice
        var colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d', '#17a2b8'];
        $range.css('background-color', colors[index % colors.length]);
        
        visualEditor.timeline.append($range);
    }
    
    function addNewRange() {
        // Encontrar espacio libre
        var freeSpace = findFreeSpace();
        
        if (!freeSpace) {
            showError('No hay espacio libre para añadir un nuevo rango');
            return;
        }
        
        var newRange = {
            from: freeSpace.from,
            to: Math.min(freeSpace.from + 10, freeSpace.to)
        };
        
        visualEditor.ranges.push(newRange);
        visualEditor.ranges.sort(function(a, b) { return a.from - b.from; });
        
        drawRanges();
        
        // Seleccionar el nuevo rango
        var newIndex = visualEditor.ranges.indexOf(newRange);
        selectRange(newIndex);
    }
    
    function findFreeSpace() {
        if (visualEditor.ranges.length === 0) {
            return { from: 0, to: visualEditor.maxWeight };
        }
        
        // Buscar espacio al inicio
        if (visualEditor.ranges[0].from > 0) {
            return { from: 0, to: visualEditor.ranges[0].from };
        }
        
        // Buscar espacio entre rangos
        for (var i = 0; i < visualEditor.ranges.length - 1; i++) {
            if (visualEditor.ranges[i].to < visualEditor.ranges[i + 1].from) {
                return { from: visualEditor.ranges[i].to, to: visualEditor.ranges[i + 1].from };
            }
        }
        
        // Buscar espacio al final
        var lastRange = visualEditor.ranges[visualEditor.ranges.length - 1];
        if (lastRange.to < visualEditor.maxWeight) {
            return { from: lastRange.to, to: visualEditor.maxWeight };
        }
        
        return null;
    }
    
    function handleRangeMouseDown(e, $range) {
        if ($(e.target).hasClass('range-handle')) {
            return;
        }
        
        e.preventDefault();
        
        var index = parseInt($range.data('index'));
        selectRange(index);
        
        visualEditor.isDragging = true;
        visualEditor.dragStartX = e.pageX;
        visualEditor.dragStartLeft = parseFloat($range.css('left'));
        
        $range.addClass('dragging');
    }
    
    function handleResizeMouseDown(e, $handle) {
        e.preventDefault();
        e.stopPropagation();
        
        var $range = $handle.closest('.range-bar');
        var index = parseInt($range.data('index'));
        
        selectRange(index);
        
        visualEditor.isResizing = true;
        visualEditor.resizeHandle = $handle.hasClass('left') ? 'left' : 'right';
        visualEditor.resizeStartX = e.pageX;
        visualEditor.resizeStartWidth = parseFloat($range.css('width'));
        visualEditor.resizeStartLeft = parseFloat($range.css('left'));
        
        $range.addClass('resizing');
    }
    
    function handleMouseMove(e) {
        if (visualEditor.isDragging && visualEditor.selectedRange !== null) {
            var deltaX = e.pageX - visualEditor.dragStartX;
            var deltaPercent = (deltaX / visualEditor.timeline.width()) * 100;
            var newLeft = visualEditor.dragStartLeft + deltaPercent;
            
            var $range = $('.range-bar[data-index="' + visualEditor.selectedRange + '"]');
            var width = parseFloat($range.css('width'));
            
            // Limitar movimiento
            newLeft = Math.max(0, Math.min(newLeft, 100 - width));
            
            // Snap to grid
            if (visualEditor.snapToGrid) {
                var newFrom = (newLeft / 100) * visualEditor.maxWeight;
                newFrom = Math.round(newFrom / visualEditor.gridSize) * visualEditor.gridSize;
                newLeft = (newFrom / visualEditor.maxWeight) * 100;
            }
            
            // Verificar colisiones
            var newFrom = (newLeft / 100) * visualEditor.maxWeight;
            var range = visualEditor.ranges[visualEditor.selectedRange];
            var rangeWidth = range.to - range.from;
            var newTo = newFrom + rangeWidth;
            
            if (!checkCollision(visualEditor.selectedRange, newFrom, newTo)) {
                $range.css('left', newLeft + '%');
                
                // Actualizar valores
                range.from = Math.round(newFrom * 100) / 100;
                range.to = Math.round(newTo * 100) / 100;
                
                updateRangeValue($range, range);
            }
        } else if (visualEditor.isResizing && visualEditor.selectedRange !== null) {
            handleResize(e);
        }
    }
    
    function handleResize(e) {
        var deltaX = e.pageX - visualEditor.resizeStartX;
        var deltaPercent = (deltaX / visualEditor.timeline.width()) * 100;
        
        var $range = $('.range-bar[data-index="' + visualEditor.selectedRange + '"]');
        var range = visualEditor.ranges[visualEditor.selectedRange];
        
        if (visualEditor.resizeHandle === 'left') {
            var newLeft = visualEditor.resizeStartLeft + deltaPercent;
            var newWidth = visualEditor.resizeStartWidth - deltaPercent;
            
            // Limitar
            newLeft = Math.max(0, newLeft);
            newWidth = Math.max(5, newWidth); // Ancho mínimo 5%
            
            // Snap to grid
            if (visualEditor.snapToGrid) {
                var newFrom = (newLeft / 100) * visualEditor.maxWeight;
                newFrom = Math.round(newFrom / visualEditor.gridSize) * visualEditor.gridSize;
                newLeft = (newFrom / visualEditor.maxWeight) * 100;
            }
            
            var newFrom = (newLeft / 100) * visualEditor.maxWeight;
            
            if (!checkCollision(visualEditor.selectedRange, newFrom, range.to)) {
                $range.css({
                    left: newLeft + '%',
                    width: newWidth + '%'
                });
                
                range.from = Math.round(newFrom * 100) / 100;
            }
        } else {
            var newWidth = visualEditor.resizeStartWidth + deltaPercent;
            
            // Limitar
            newWidth = Math.max(5, Math.min(newWidth, 100 - visualEditor.resizeStartLeft));
            
            // Snap to grid
            if (visualEditor.snapToGrid) {
                var newTo = ((visualEditor.resizeStartLeft + newWidth) / 100) * visualEditor.maxWeight;
                newTo = Math.round(newTo / visualEditor.gridSize) * visualEditor.gridSize;
                newWidth = ((newTo / visualEditor.maxWeight) * 100) - visualEditor.resizeStartLeft;
            }
            
            var newTo = ((visualEditor.resizeStartLeft + newWidth) / 100) * visualEditor.maxWeight;
            
            if (!checkCollision(visualEditor.selectedRange, range.from, newTo)) {
                $range.css('width', newWidth + '%');
                
                range.to = Math.round(newTo * 100) / 100;
            }
        }
        
        updateRangeValue($range, range);
    }
    
    function handleMouseUp(e) {
        if (visualEditor.isDragging || visualEditor.isResizing) {
            $('.range-bar').removeClass('dragging resizing');
            
            visualEditor.isDragging = false;
            visualEditor.isResizing = false;
            
            // Reordenar rangos
            visualEditor.ranges.sort(function(a, b) { return a.from - b.from; });
            drawRanges();
        }
    }
    
    function handleKeyDown(e) {
        if (visualEditor.selectedRange === null) return;
        
        var range = visualEditor.ranges[visualEditor.selectedRange];
        var step = visualEditor.snapToGrid ? visualEditor.gridSize : 0.1;
        
        switch(e.keyCode) {
            case 37: // Flecha izquierda
                e.preventDefault();
                if (e.shiftKey) {
                    // Redimensionar desde la izquierda
                    if (range.from - step >= 0 && !checkCollision(visualEditor.selectedRange, range.from - step, range.to)) {
                        range.from = Math.round((range.from - step) * 100) / 100;
                        drawRanges();
                    }
                } else {
                    // Mover
                    if (range.from - step >= 0 && !checkCollision(visualEditor.selectedRange, range.from - step, range.to - step)) {
                        range.from = Math.round((range.from - step) * 100) / 100;
                        range.to = Math.round((range.to - step) * 100) / 100;
                        drawRanges();
                    }
                }
                break;
                
            case 39: // Flecha derecha
                e.preventDefault();
                if (e.shiftKey) {
                    // Redimensionar desde la derecha
                    if (range.to + step <= visualEditor.maxWeight && !checkCollision(visualEditor.selectedRange, range.from, range.to + step)) {
                        range.to = Math.round((range.to + step) * 100) / 100;
                        drawRanges();
                    }
                } else {
                    // Mover
                    if (range.to + step <= visualEditor.maxWeight && !checkCollision(visualEditor.selectedRange, range.from + step, range.to + step)) {
                        range.from = Math.round((range.from + step) * 100) / 100;
                        range.to = Math.round((range.to + step) * 100) / 100;
                        drawRanges();
                    }
                }
                break;
                
            case 46: // Delete
                e.preventDefault();
                deleteRange(visualEditor.selectedRange);
                break;
                
            case 68: // D - Duplicar
                if (e.ctrlKey) {
                    e.preventDefault();
                    duplicateRange(visualEditor.selectedRange);
                }
                break;
        }
    }
    
    function selectRange(index) {
        deselectAllRanges();
        
        visualEditor.selectedRange = index;
        $('.range-bar[data-index="' + index + '"]').addClass('selected');
        
        // Actualizar campos de edición
        var range = visualEditor.ranges[index];
        $('#range-from-input').val(range.from);
        $('#range-to-input').val(range.to);
        
        // Habilitar botones de edición
        $('.range-edit-controls').prop('disabled', false);
    }
    
    function deselectAllRanges() {
        visualEditor.selectedRange = null;
        $('.range-bar').removeClass('selected');
        
        // Limpiar campos
        $('#range-from-input').val('');
        $('#range-to-input').val('');
        
        // Deshabilitar botones
        $('.range-edit-controls').prop('disabled', true);
    }
    
    function updateRangeValue($range, range) {
        $range.find('.range-value').text(range.from + ' - ' + range.to + ' kg');
        
        // Actualizar lista
        updateRangeList();
        
        // Si está seleccionado, actualizar campos
        if (visualEditor.selectedRange !== null) {
            $('#range-from-input').val(range.from);
            $('#range-to-input').val(range.to);
        }
    }
    
    function updateRangeList() {
        var html = '';
        
        visualEditor.ranges.forEach(function(range, index) {
            html += '<div class="range-list-item" data-index="' + index + '">';
            html += '<span class="range-color" style="background-color: ' + getRangeColor(index) + '"></span>';
            html += '<span class="range-text">' + range.from + ' - ' + range.to + ' kg</span>';
            html += '<div class="range-actions">';
            html += '<button class="btn btn-xs btn-default edit-range" data-index="' + index + '"><i class="icon-edit"></i></button>';
            html += '<button class="btn btn-xs btn-danger delete-range" data-index="' + index + '"><i class="icon-trash"></i></button>';
            html += '</div>';
            html += '</div>';
        });
        
        $('#range-list').html(html);
        
        // Bind eventos
        $('.range-list-item').on('click', function() {
            var index = $(this).data('index');
            selectRange(index);
        });
        
        $('.edit-range').on('click', function(e) {
            e.stopPropagation();
            var index = $(this).data('index');
            editRange(index);
        });
        
        $('.delete-range').on('click', function(e) {
            e.stopPropagation();
            var index = $(this).data('index');
            deleteRange(index);
        });
    }
    
    function getRangeColor(index) {
        var colors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d', '#17a2b8'];
        return colors[index % colors.length];
    }
    
    function checkCollision(excludeIndex, from, to) {
        for (var i = 0; i < visualEditor.ranges.length; i++) {
            if (i === excludeIndex) continue;
            
            var range = visualEditor.ranges[i];
            
            // Verificar solapamiento
            if ((from < range.to && to > range.from)) {
                return true;
            }
        }
        
        return false;
    }
    
    function editRange(index) {
        selectRange(index);
        $('#range-from-input').focus();
    }
    
    function deleteRange(index) {
        if (!confirm('¿Eliminar este rango?')) {
            return;
        }
        
        visualEditor.ranges.splice(index, 1);
        drawRanges();
        deselectAllRanges();
    }
    
    function duplicateRange(index) {
        var original = visualEditor.ranges[index];
        var freeSpace = findFreeSpace();
        
        if (!freeSpace) {
            showError('No hay espacio para duplicar el rango');
            return;
        }
        
        var rangeWidth = original.to - original.from;
        var newRange = {
            from: freeSpace.from,
            to: Math.min(freeSpace.from + rangeWidth, freeSpace.to)
        };
        
        visualEditor.ranges.push(newRange);
        visualEditor.ranges.sort(function(a, b) { return a.from - b.from; });
        
        drawRanges();
        
        // Seleccionar el nuevo rango
        var newIndex = visualEditor.ranges.indexOf(newRange);
        selectRange(newIndex);
    }
    
    function applyPreset(preset) {
        if (!confirm('¿Aplicar este preset? Se eliminarán los rangos actuales.')) {
            return;
        }
        
        visualEditor.ranges = [];
        
        switch(preset) {
            case 'standard':
                visualEditor.ranges = [
                    {from: 0, to: 1},
                    {from: 1, to: 5},
                    {from: 5, to: 10},
                    {from: 10, to: 20},
                    {from: 20, to: 30}
                ];
                break;
                
            case 'express':
                visualEditor.ranges = [
                    {from: 0, to: 2},
                    {from: 2, to: 10},
                    {from: 10, to: 30}
                ];
                break;
                
            case 'heavy':
                visualEditor.ranges = [
                    {from: 0, to: 30},
                    {from: 30, to: 50},
                    {from: 50, to: 100}
                ];
                visualEditor.maxWeight = 100;
                $('#max-weight-setting').val(100);
                break;
                
            case 'detailed':
                for (var i = 0; i < 20; i += 2) {
                    visualEditor.ranges.push({from: i, to: i + 2});
                }
                break;
                
            case 'ecommerce':
                visualEditor.ranges = [
                    {from: 0, to: 0.5},
                    {from: 0.5, to: 1},
                    {from: 1, to: 2},
                    {from: 2, to: 5},
                    {from: 5, to: 10},
                    {from: 10, to: 15},
                    {from: 15, to: 20}
                ];
                break;
        }
        
        drawRanges();
        drawScale();
    }
    
    function zoom(factor) {
        visualEditor.scale *= factor;
        visualEditor.scale = Math.max(0.5, Math.min(visualEditor.scale, 3));
        
        visualEditor.timeline.css('transform', 'scaleX(' + visualEditor.scale + ')');
        $('#zoom-level').text(Math.round(visualEditor.scale * 100) + '%');
    }
    
    function redraw() {
        drawScale();
        drawRanges();
    }
    
    function saveRanges() {
        // Validar rangos
        var errors = validateRanges();
        if (errors.length > 0) {
            showError('Errores en los rangos:\n' + errors.join('\n'));
            return;
        }
        
        var carrierId = $('#carrier_id').val();
        
        showLoading();
        
        $.ajax({
            url: window.location.href,
            type: 'POST',
            data: {
                action: 'save_visual_ranges',
                carrier_id: carrierId,
                ranges: JSON.stringify(visualEditor.ranges)
            },
            dataType: 'json',
            success: function(response) {
                hideLoading();
                
                if (response.success) {
                    showSuccess('Rangos guardados correctamente');
                    
                    // Recargar la página si estamos en la matriz
                    if (window.location.href.includes('action=matrix')) {
                        setTimeout(function() {
                            window.location.href = window.location.href.replace('action=visual_ranges', 'action=matrix');
                        }, 1000);
                    }
                } else {
                    showError(response.message || 'Error al guardar los rangos');
                }
            },
            error: function() {
                hideLoading();
                showError('Error de conexión');
            }
        });
    }
    
    function validateRanges() {
        var errors = [];
        
        if (visualEditor.ranges.length === 0) {
            errors.push('Debe haber al menos un rango');
        }
        
        // Verificar gaps
        for (var i = 0; i < visualEditor.ranges.length - 1; i++) {
            if (visualEditor.ranges[i].to < visualEditor.ranges[i + 1].from) {
                errors.push('Hay un espacio entre ' + visualEditor.ranges[i].to + ' y ' + visualEditor.ranges[i + 1].from + ' kg');
            }
        }
        
        // Verificar rangos válidos
        visualEditor.ranges.forEach(function(range, index) {
            if (range.from >= range.to) {
                errors.push('Rango ' + (index + 1) + ': el valor inicial debe ser menor que el final');
            }
        });
        
        return errors;
    }
    
    function exportVisual() {
        var data = {
            version: '1.0',
            maxWeight: visualEditor.maxWeight,
            ranges: visualEditor.ranges
        };
        
        var blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        var url = URL.createObjectURL(blob);
        
        var a = document.createElement('a');
        a.href = url;
        a.download = 'visual_ranges_' + new Date().toISOString().slice(0, 10) + '.json';
        a.click();
        
        URL.revokeObjectURL(url);
    }
    
    function importVisual(file) {
        if (!file) return;
        
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var data = JSON.parse(e.target.result);
                
                if (!data.ranges || !Array.isArray(data.ranges)) {
                    throw new Error('Formato inválido');
                }
                
                if (confirm('¿Importar ' + data.ranges.length + ' rangos?')) {
                    visualEditor.ranges = data.ranges;
                    
                    if (data.maxWeight) {
                        visualEditor.maxWeight = data.maxWeight;
                        $('#max-weight-setting').val(data.maxWeight);
                    }
                    
                    redraw();
                    showSuccess('Rangos importados correctamente');
                }
            } catch (error) {
                showError('Error al leer el archivo: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    }
    
    // Actualización manual de campos
    $('#range-from-input, #range-to-input').on('change', function() {
        if (visualEditor.selectedRange === null) return;
        
        var from = parseFloat($('#range-from-input').val());
        var to = parseFloat($('#range-to-input').val());
        
        if (isNaN(from) || isNaN(to)) {
            showError('Valores inválidos');
            return;
        }
        
        if (from >= to) {
            showError('El valor inicial debe ser menor que el final');
            return;
        }
        
        if (checkCollision(visualEditor.selectedRange, from, to)) {
            showError('El rango se solapa con otro existente');
            return;
        }
        
        var range = visualEditor.ranges[visualEditor.selectedRange];
        range.from = from;
        range.to = to;
        
        drawRanges();
    });
    
    // Split range
    $('#split-range').on('click', function() {
        if (visualEditor.selectedRange === null) return;
        
        var range = visualEditor.ranges[visualEditor.selectedRange];
        var splitPoint = prompt('Punto de división (entre ' + range.from + ' y ' + range.to + '):', 
                               ((range.from + range.to) / 2).toFixed(1));
        
        if (!splitPoint) return;
        
        splitPoint = parseFloat(splitPoint);
        
        if (isNaN(splitPoint) || splitPoint <= range.from || splitPoint >= range.to) {
            showError('Punto de división inválido');
            return;
        }
        
        // Crear dos nuevos rangos
        var newRange1 = {from: range.from, to: splitPoint};
        var newRange2 = {from: splitPoint, to: range.to};
        
        // Reemplazar el rango original
        visualEditor.ranges.splice(visualEditor.selectedRange, 1, newRange1, newRange2);
        
        drawRanges();
        deselectAllRanges();
    });
    
    // Merge ranges
    $('#merge-ranges').on('click', function() {
        var selectedCount = $('.range-bar.selected').length;
        
        if (selectedCount < 2) {
            showError('Selecciona al menos 2 rangos para fusionar');
            return;
        }
        
        // Por ahora solo funciona con el rango seleccionado y el siguiente
        if (visualEditor.selectedRange === null || visualEditor.selectedRange >= visualEditor.ranges.length - 1) {
            return;
        }
        
        var range1 = visualEditor.ranges[visualEditor.selectedRange];
        var range2 = visualEditor.ranges[visualEditor.selectedRange + 1];
        
        if (range1.to !== range2.from) {
            showError('Los rangos deben ser contiguos para fusionarlos');
            return;
        }
        
        // Fusionar
        range1.to = range2.to;
        visualEditor.ranges.splice(visualEditor.selectedRange + 1, 1);
        
        drawRanges();
    });
    
    // Funciones auxiliares
    function showLoading() {
        if ($('.visual-loading').length === 0) {
            visualEditor.container.append('<div class="visual-loading"><div class="loading-spinner"></div></div>');
        }
        $('.visual-loading').show();
    }
    
    function hideLoading() {
        $('.visual-loading').hide();
    }
    
    function showError(message) {
        showNotification(message, 'error');
    }
    
    function showSuccess(message) {
        showNotification(message, 'success');
    }
    
    function showNotification(message, type) {
        var alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
        var $notification = $('<div class="alert ' + alertClass + ' alert-dismissible">' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
            message + '</div>');
        
        $('#visual-notifications').html($notification);
        
        setTimeout(function() {
            $notification.fadeOut();
        }, 5000);
    }
});