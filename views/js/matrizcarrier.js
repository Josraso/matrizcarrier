// views/js/matrizcarrier.js

function handleAjaxRequest(url, action, data, successCallback) {
    showLoading();
    $.ajax({
        url: url,
        type: 'POST',
        data: Object.assign({
            ajax: 1,
            action: action
        }, data),
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                if (successCallback) {
                    successCallback(response);
                }
                showNotification('Operación completada con éxito', 'success');
            } else {
                showNotification('Error: ' + (response.message || 'Ha ocurrido un error'), 'error');
            }
        },
        error: function(xhr, status, error) {
            showNotification('Error en la solicitud: ' + error, 'error');
        },
        complete: function() {
            hideLoading();
        }
    });
}

$(document).ready(function() {
    'use strict';
    // Configuración AJAX global
$.ajaxSetup({
    beforeSend: function(xhr, settings) {
        if (settings.data && typeof settings.data === 'string') {
            settings.data += '&ajax=1';
        } else if (settings.data && typeof settings.data === 'object') {
            settings.data.ajax = 1;
        } else {
            settings.data = 'ajax=1';
        }
    }
});
    // Variables globales
    var hasChanges = false;
    var originalValues = {};
    var selectedCells = [];
    var isDragging = false;
    var isSelecting = false;
    var startCell = null;
    var dragValue = null;
    
    // Configuración
    var config = {
        autosaveInterval: 30000, // 30 segundos
        enableAutosave: false,
        enableKeyboardShortcuts: true,
        enableDragFill: true,
        enableMultiSelect: true
    };
    
    // Inicializar
    init();
    
    function init() {
        // Guardar valores originales
        $('.price-input').each(function() {
            var $input = $(this);
            var key = $input.attr('name');
            originalValues[key] = $input.val();
        });
        
        // Event listeners
        bindEvents();
        
        // Inicializar tooltips
        $('[data-toggle="tooltip"]').tooltip();
        
        // Calcular estadísticas
        updateStatistics();
        
        // Aplicar filtros guardados
        restoreFilters();
        
        // Inicializar búsqueda
        initializeSearch();
        
        // Si hay gráficos, inicializarlos
        if ($('#stats-tab').hasClass('active')) {
            initCharts();
        }
        
        // Autosave si está habilitado
        if (config.enableAutosave) {
            setInterval(autoSave, config.autosaveInterval);
        }
    }
    
    function bindEvents() {
        // Detectar cambios en inputs
        $('.price-input').on('input change', function() {
            var $input = $(this);
            var key = $input.attr('name');
            
            if ($input.val() !== originalValues[key]) {
                $input.addClass('changed');
                hasChanges = true;
            } else {
                $input.removeClass('changed');
            }
            
            updateStatistics();
        });
        
        // Navegación con teclado mejorada
        $('.price-input').on('keydown', function(e) {
            handleKeyboardNavigation($(this), e);
        });
        
        // Selección múltiple con Shift+Click
        if (config.enableMultiSelect) {
            $('.price-cell').on('mousedown', function(e) {
                handleCellSelection($(this), e);
            });
            
            $('.price-cell').on('mouseenter', function(e) {
                if (isSelecting) {
                    extendSelection($(this));
                }
            });
            
            $(document).on('mouseup', function() {
                isSelecting = false;
            });
        }
        
        // Drag & Drop para rellenar
        if (config.enableDragFill) {
            initializeDragFill();
        }
        
        // Búsqueda en tiempo real
        $('#matrix-search').on('input', function() {
            performSearch($(this).val());
        });
        
        // Filtros
        $('#hide-inactive-zones, #hide-empty-zones').on('change', function() {
            applyFilters();
            saveFilters();
        });
        
        // Plantillas
        $('#apply-template-btn').on('click', function() {
            var templateId = $('#template-select').val();
            if (templateId) {
                handleAjaxRequest(
                    window.location.href,
                    'apply_template',
                    {template_id: templateId},
                    function(response) {
                        location.reload();
                    }
                );
            }
        });
        
        $('#save-as-template-btn').on('click', function() {
            $('#saveTemplateModal').modal('show');
        });
        
        // Reglas
        $('#apply-rules-btn').on('click', function() {
            handleAjaxRequest(
                window.location.href,
                'get_rules',
                {},
                function(response) {
                    if (response.rules) {
                        showRulesDialog(response.rules);
                    }
                }
            );
        });
        
        // Botones de herramientas
        bindToolbarButtons();
        
        // Atajos de teclado globales
        if (config.enableKeyboardShortcuts) {
            bindGlobalShortcuts();
        }
        
        // Cambio de pestaña
        $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
            var target = $(e.target).attr('href');
            if (target === '#stats-tab') {
                initCharts();
            }
        });
        
        // Prevenir pérdida de datos
        $(window).on('beforeunload', function() {
            if (hasChanges) {
                return 'Hay cambios sin guardar. ¿Estás seguro de que quieres salir?';
            }
        });
        
        // Al enviar el formulario, quitar la alerta
        $('form').on('submit', function() {
            hasChanges = false;
        });
    }
    
    function bindToolbarButtons() {
        // Aplicar fórmula
        $('#apply-formula').on('click', function() {
            $('#formulaModal').modal('show');
        });
        
        $('#apply-formula-btn').on('click', function() {
            applyFormula();
            $('#formulaModal').modal('hide');
        });
        
        // Copiar zona
        $('#copy-zone').on('click', function() {
            handleAjaxRequest(
                window.location.href,
                'get_zones',
                {},
                function(response) {
                    if (response.zones) {
                        showCopyZoneDialog(response.zones);
                    }
                }
            );
        });
        
        // Limpiar todo
        $('#clear-all').on('click', function() {
            if (confirm('¿Estás seguro de que quieres limpiar todos los precios?')) {
                $('.price-input').val('').trigger('change');
                showNotification('Todos los precios han sido limpiados', 'info');
            }
        });
        
        // Reglas
        $('#rules-button').on('click', function() {
            handleAjaxRequest(
                window.location.href,
                'get_rules',
                {},
                function(response) {
                    if (response.rules) {
                        showRulesDialog(response.rules);
                    }
                }
            );
        });
        
        // Rellenar diagonal
        $('#fill-diagonal').on('click', function() {
            fillDiagonal();
        });
        
                // Botón flotante para aplicar a selección
        $('.btn-apply-to-selected').on('click', function() {
            showApplyToSelectedDialog();
        });
        
        // Autocompletar
        $('#autocomplete-btn').on('click', function() {
            toggleAutocomplete();
        });
        
        // Exportar avanzado
        $('#export-advanced').on('click', function() {
            $('#exportModal').modal('show');
        });
        
        // Importar con preview
        $('#import-preview').on('click', function() {
            $('#importModal').modal('show');
        });
    }
    
    function handleKeyboardNavigation($input, e) {
        var $cell = $input.closest('td');
        var $row = $cell.closest('tr');
        var cellIndex = $cell.index();
        var rowIndex = $row.index();
        
        switch(e.keyCode) {
            case 13: // Enter
                e.preventDefault();
                if (e.shiftKey) {
                    // Shift+Enter: ir arriba
                    navigateToCell(rowIndex - 1, cellIndex);
                } else {
                    // Enter: ir abajo
                    navigateToCell(rowIndex + 1, cellIndex);
                }
                break;
                
            case 37: // Flecha izquierda
                if (e.target.selectionStart === 0 || e.ctrlKey) {
                    e.preventDefault();
                    navigateToCell(rowIndex, cellIndex - 1);
                }
                break;
                
            case 38: // Flecha arriba
                e.preventDefault();
                navigateToCell(rowIndex - 1, cellIndex);
                break;
                
            case 39: // Flecha derecha
                if (e.target.selectionStart === e.target.value.length || e.ctrlKey) {
                    e.preventDefault();
                    navigateToCell(rowIndex, cellIndex + 1);
                }
                break;
                
            case 40: // Flecha abajo
                e.preventDefault();
                navigateToCell(rowIndex + 1, cellIndex);
                break;
                
            case 9: // Tab
                // Comportamiento por defecto, pero con wrap-around
                if (!e.shiftKey && cellIndex === $('.matrix-table thead th').length - 1) {
                    e.preventDefault();
                    navigateToCell(rowIndex + 1, 1);
                }
                break;
                
            case 46: // Delete
                if (e.ctrlKey && selectedCells.length > 0) {
                    e.preventDefault();
                    clearSelectedCells();
                }
                break;
        }
    }
    
    function navigateToCell(row, col) {
        var $rows = $('.matrix-table tbody tr:visible');
        var $targetRow = $rows.eq(row);
        
        if ($targetRow.length) {
            var $targetCell = $targetRow.find('td').eq(col);
            if ($targetCell.length) {
                var $input = $targetCell.find('.price-input');
                if ($input.length) {
                    $input.focus().select();
                    highlightCurrentPosition($input);
                }
            }
        }
    }
    
    function highlightCurrentPosition($input) {
        $('.highlight-row').removeClass('highlight-row');
        $('.highlight-col').removeClass('highlight-col');
        
        var $td = $input.closest('td');
        var index = $td.index();
        
        // Resaltar fila
        $td.closest('tr').addClass('highlight-row');
        
        // Resaltar columna
        $('.matrix-table tr').each(function() {
            $(this).find('td,th').eq(index).addClass('highlight-col');
        });
    }
    
    function handleCellSelection($cell, e) {
        if (e.shiftKey && startCell) {
            // Selección con Shift
            e.preventDefault();
            selectRange(startCell, $cell);
        } else if (e.ctrlKey) {
            // Añadir/quitar de selección
            e.preventDefault();
            toggleCellSelection($cell);
        } else {
            // Nueva selección
            clearSelection();
            startCell = $cell;
            selectCell($cell);
            isSelecting = true;
        }
    }
    
    function selectCell($cell) {
        $cell.addClass('selected');
        if (selectedCells.indexOf($cell[0]) === -1) {
            selectedCells.push($cell[0]);
        }
        updateSelectionInfo();
    }
    
    function toggleCellSelection($cell) {
        if ($cell.hasClass('selected')) {
            $cell.removeClass('selected');
            var index = selectedCells.indexOf($cell[0]);
            if (index > -1) {
                selectedCells.splice(index, 1);
            }
        } else {
            selectCell($cell);
        }
        updateSelectionInfo();
    }
    
    function selectRange(start, end) {
        clearSelection();
        
        var startRow = start.closest('tr').index();
        var endRow = end.closest('tr').index();
        var startCol = start.index();
        var endCol = end.index();
        
        var minRow = Math.min(startRow, endRow);
        var maxRow = Math.max(startRow, endRow);
        var minCol = Math.min(startCol, endCol);
        var maxCol = Math.max(startCol, endCol);
        
        $('.matrix-table tbody tr').slice(minRow, maxRow + 1).each(function() {
            $(this).find('td').slice(minCol, maxCol + 1).each(function() {
                if ($(this).hasClass('price-cell')) {
                    selectCell($(this));
                }
            });
        });
    }
    
    function extendSelection($cell) {
        if (startCell) {
            selectRange(startCell, $cell);
        }
    }
    
    function clearSelection() {
        $('.selected').removeClass('selected');
        selectedCells = [];
        updateSelectionInfo();
    }
    
    function updateSelectionInfo() {
        if (selectedCells.length > 1) {
            var values = [];
            $(selectedCells).each(function() {
                var val = $(this).find('.price-input').val();
                if (val) {
                    values.push(parseFloat(val));
                }
            });
            
            if (values.length > 0) {
                var sum = values.reduce((a, b) => a + b, 0);
                var avg = sum / values.length;
                var min = Math.min(...values);
                var max = Math.max(...values);
                
                showSelectionStats({
                    count: selectedCells.length,
                    sum: sum.toFixed(2),
                    avg: avg.toFixed(2),
                    min: min.toFixed(2),
                    max: max.toFixed(2)
                });
            }
            
            $('.btn-apply-to-selected').addClass('show');
        } else {
            hideSelectionStats();
            $('.btn-apply-to-selected').removeClass('show');
        }
    }
    
    function showSelectionStats(stats) {
        var $info = $('#selection-info');
        if ($info.length === 0) {
            $info = $('<div id="selection-info" class="alert alert-info"></div>');
            $('.matrix-tools').after($info);
        }
        
        $info.html(
            '<strong>Selección:</strong> ' + stats.count + ' celdas | ' +
            '<strong>Suma:</strong> ' + stats.sum + ' | ' +
            '<strong>Media:</strong> ' + stats.avg + ' | ' +
            '<strong>Min:</strong> ' + stats.min + ' | ' +
            '<strong>Max:</strong> ' + stats.max
        ).show();
    }
    
    function hideSelectionStats() {
        $('#selection-info').hide();
    }
    
    function clearSelectedCells() {
        if (confirm('¿Limpiar las celdas seleccionadas?')) {
            $(selectedCells).each(function() {
                $(this).find('.price-input').val('').trigger('change');
            });
            clearSelection();
        }
    }
    
    function initializeDragFill() {
        $('.price-input').on('mousedown', function(e) {
            if (e.shiftKey && e.button === 0) {
                isDragging = true;
                startCell = $(this);
                dragValue = $(this).val();
                $(this).addClass('drag-start');
                e.preventDefault();
            }
        });
        
        $('.price-input').on('mouseenter', function() {
            if (isDragging) {
                $(this).val(dragValue).trigger('change');
                $(this).addClass('drag-over');
            }
        });
        
        $(document).on('mouseup', function() {
            if (isDragging) {
                isDragging = false;
                $('.drag-start, .drag-over').removeClass('drag-start drag-over');
                showNotification('Valores rellenados correctamente', 'success');
            }
        });
    }
    
    function initializeSearch() {
        if ($('#matrix-search').length === 0) {
            var searchHtml = '<div class="search-box">' +
                '<i class="icon-search"></i>' +
                '<input type="text" id="matrix-search" class="form-control" placeholder="Buscar zona, precio...">' +
                '</div>';
            $('.matrix-tools').prepend(searchHtml);
        }
    }
    
    function performSearch(query) {
        query = query.toLowerCase();
        $('.matrix-table .price-input').removeClass('highlight');
        
        if (query.length === 0) {
            $('.matrix-table tbody tr').show();
            $('#search-results').remove();
            return;
        }
        
        var matches = 0;
        var visibleRows = 0;
        
        $('.matrix-table tbody tr').each(function() {
            var $row = $(this);
            var zoneName = $row.find('.zone-name').text().toLowerCase();
            var rowMatches = false;
            
            if (zoneName.includes(query)) {
                rowMatches = true;
            }
            
            $row.find('.price-input').each(function() {
                var price = $(this).val();
                if (price && price.includes(query)) {
                    $(this).addClass('highlight');
                    rowMatches = true;
                    matches++;
                }
            });
            
            if (rowMatches) {
                $row.show();
                visibleRows++;
            } else {
                $row.hide();
            }
        });
        
        showSearchResults(matches, visibleRows);
    }
    
    function showSearchResults(matches, rows) {
        var $results = $('#search-results');
        if ($results.length === 0) {
            $results = $('<div id="search-results" class="alert alert-info mt-10"></div>');
            $('.matrix-wrapper').before($results);
        }
        
        if (matches > 0) {
            $results.html(
                '<i class="icon-search"></i> ' +
                'Encontrados <strong>' + matches + '</strong> precios en <strong>' + rows + '</strong> zonas'
            ).show();
        } else {
            $results.html(
                '<i class="icon-search"></i> No se encontraron resultados'
            ).show();
        }
    }
    
    function applyFilters() {
        var hideInactive = $('#hide-inactive-zones').is(':checked');
        var hideEmpty = $('#hide-empty-zones').is(':checked');
        var visibleCount = 0;
        var hiddenCount = 0;
        
        $('.zone-row').each(function() {
            var $row = $(this);
            var shouldHide = false;
            var isActive = parseInt($row.data('zone-active'));
            
            if (hideInactive && !isActive) {
                shouldHide = true;
            }
            
            if (hideEmpty && !shouldHide) {
                var hasPrice = false;
                $row.find('.price-input').each(function() {
                    if ($(this).val() && parseFloat($(this).val()) > 0) {
                        hasPrice = true;
                        return false;
                    }
                });
                if (!hasPrice) {
                    shouldHide = true;
                }
            }
            
            if (shouldHide) {
                $row.hide();
                hiddenCount++;
            } else {
                $row.show();
                visibleCount++;
            }
        });
        
        updateFilterInfo(visibleCount, hiddenCount);
    }
    
    function updateFilterInfo(visible, hidden) {
        var $info = $('#filter-info');
        if ($info.length === 0) {
            $info = $('<div id="filter-info" class="alert alert-info"></div>');
            $('#matrizcarrier-matrix').before($info);
        }
        
        $info.html(
            '<i class="icon-filter"></i> Mostrando <strong>' + visible + '</strong> zonas' +
            (hidden > 0 ? ' (ocultando ' + hidden + ')' : '')
        );
        
        if (visible === 0) {
            $info.removeClass('alert-info').addClass('alert-warning');
        } else {
            $info.removeClass('alert-warning').addClass('alert-info');
        }
    }
    
    function saveFilters() {
        localStorage.setItem('matrizcarrier_filters', JSON.stringify({
            hideInactive: $('#hide-inactive-zones').is(':checked'),
            hideEmpty: $('#hide-empty-zones').is(':checked')
        }));
    }
    
    function restoreFilters() {
        var filters = localStorage.getItem('matrizcarrier_filters');
        if (filters) {
            filters = JSON.parse(filters);
            $('#hide-inactive-zones').prop('checked', filters.hideInactive);
            $('#hide-empty-zones').prop('checked', filters.hideEmpty);
            applyFilters();
        }
    }
    
    function showNotification(message, type, duration) {
        type = type || 'info';
        duration = duration || 3000;
        
        var $notification = $('<div class="saving-indicator show"></div>');
        $notification.text(message);
        
        switch(type) {
            case 'success':
                $notification.css('background', '#28a745');
                break;
            case 'error':
                $notification.css('background', '#dc3545');
                break;
            case 'warning':
                $notification.css('background', '#ffc107');
                break;
            default:
                $notification.css('background', '#17a2b8');
        }
        
        $('body').append($notification);
        
        setTimeout(function() {
            $notification.fadeOut(function() {
                $(this).remove();
            });
        }, duration);
    }
    
    function showLoading() {
        if ($('.loading-overlay').length === 0) {
            var loadingHtml = '<div class="loading-overlay">' +
                '<div class="loading-spinner"></div>' +
                '</div>';
            $('.matrix-wrapper').append(loadingHtml);
        }
        $('.loading-overlay').show();
    }
    
    function hideLoading() {
        $('.loading-overlay').hide();
    }
    
    function showCustomDialog(title, content, onConfirm) {
        var dialogHtml = '<div class="modal fade" id="customDialog">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal">&times;</button>' +
            '<h4 class="modal-title">' + title + '</h4>' +
            '</div>' +
            '<div class="modal-body">' + content + '</div>' +
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default" data-dismiss="modal">Cancelar</button>' +
            '<button type="button" class="btn btn-primary" id="customDialogConfirm">Aceptar</button>' +
            '</div></div></div></div>';
        
        $('#customDialog').remove();
        $('body').append(dialogHtml);
        
        $('#customDialog').modal('show');
        
        $('#customDialogConfirm').on('click', function() {
            $('#customDialog').modal('hide');
            if (onConfirm) onConfirm();
        });
        
        $('#customDialog').on('hidden.bs.modal', function() {
            $(this).remove();
        });
    }
    
    function showRulesDialog(rules) {
        if (!rules || !rules.length) {
            showNotification('No hay reglas disponibles', 'warning');
            return;
        }
        
        var content = '<div class="rules-list">';
        rules.forEach(function(rule) {
            content += '<div class="rule-item">' +
                '<label class="checkbox">' +
                '<input type="checkbox" value="' + rule.id_rule + '"> ' + rule.name +
                '</label>' +
                '<small class="text-muted">' + rule.description + '</small>' +
                '</div>';
        });
        content += '</div>';
        
        showCustomDialog('Aplicar reglas', content, function() {
            var selectedRules = [];
            $('.rules-list input:checked').each(function() {
                selectedRules.push($(this).val());
            });
            
            if (selectedRules.length === 0) {
                showNotification('Selecciona al menos una regla', 'warning');
                return;
            }
            
            handleAjaxRequest(
                window.location.href,
                'apply_rules',
                {rules: selectedRules},
                function(response) {
                    location.reload();
                }
            );
        });
    }
});