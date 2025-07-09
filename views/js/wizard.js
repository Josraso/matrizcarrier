// views/js/wizard.js

$(document).ready(function() {
    'use strict';
    
    // Variables del wizard
    var currentStep = 1;
    var totalSteps = 6;
    var wizardData = {
        carrierName: '',
        carrierType: '',
        template: null,
        zones: [],
        ranges: [],
        priceStrategy: 'manual',
        priceFormula: null,
        basePrice: 0,
        handling: 0
    };
    
    // Plantillas predefinidas
    var templates = {
        'standard': {
            name: 'Envío Peninsular Estándar',
            description: 'Configuración típica para envíos nacionales',
            ranges: ['0-1', '1-5', '5-10', '10-20', '20-30'],
            zones: {
                'España': [3.95, 5.95, 7.95, 12.95, 18.95],
                'Portugal': [8.95, 12.95, 16.95, 24.95, 34.95]
            }
        },
        'express': {
            name: 'Envío Express',
            description: 'Para entregas urgentes 24-48h',
            ranges: ['0-2', '2-10', '10-30'],
            zones: {
                'España': [9.95, 14.95, 29.95],
                'Portugal': [19.95, 29.95, 49.95],
                'Francia': [24.95, 39.95, 69.95]
            }
        },
        'islands': {
            name: 'Envío a Islas',
            description: 'Tarifas especiales para territorios insulares',
            ranges: ['0-5', '5-15', '15-30'],
            zones: {
                'Baleares': [12.95, 19.95, 34.95],
                'Canarias': [18.95, 29.95, 49.95]
            }
        },
        'international': {
            name: 'Envío Internacional',
            description: 'Para envíos a toda Europa',
            ranges: ['0-1', '1-5', '5-10', '10-20'],
            zones: {
                'Zone 1 (ES/PT)': [5.95, 8.95, 12.95, 19.95],
                'Zone 2 (FR/IT/DE)': [12.95, 18.95, 24.95, 34.95],
                'Zone 3 (UK/NL/BE)': [15.95, 22.95, 29.95, 39.95],
                'Zone 4 (Rest of EU)': [19.95, 28.95, 38.95, 49.95]
            }
        },
        'heavy': {
            name: 'Carga Pesada',
            description: 'Para productos voluminosos o pesados',
            ranges: ['0-30', '30-50', '50-100', '100-500'],
            zones: {
                'Nacional': [29.95, 49.95, 89.95, 149.95],
                'Internacional': [59.95, 99.95, 179.95, 299.95]
            }
        },
        'custom': {
            name: 'Personalizado',
            description: 'Configura tu propia estructura desde cero',
            ranges: [],
            zones: {}
        }
    };
    
    // Inicializar wizard
    init();
    
    function init() {
        bindEvents();
        showStep(1);
        updateProgress();
    }
    
    function bindEvents() {
        // Navegación
        $('.wizard-navigation .btn-prev').on('click', function() {
            if (currentStep > 1) {
                showStep(currentStep - 1);
            }
        });
        
        $('.wizard-navigation .btn-next').on('click', function() {
            if (validateStep(currentStep)) {
                if (currentStep < totalSteps) {
                    showStep(currentStep + 1);
                }
            }
        });
        
        $('.wizard-navigation .btn-finish').on('click', function() {
            if (validateStep(currentStep)) {
                finishWizard();
            }
        });
        
        // Click en pasos
        $('.wizard-step').on('click', function() {
            var step = $(this).data('step');
            if (step < currentStep || $(this).hasClass('completed')) {
                showStep(step);
            }
        });
        
        // Paso 1: Información básica
        $('#carrier-name').on('input', function() {
            wizardData.carrierName = $(this).val();
        });
        
        $('.carrier-type-card').on('click', function() {
            $('.carrier-type-card').removeClass('selected');
            $(this).addClass('selected');
            wizardData.carrierType = $(this).data('type');
            
            // Preseleccionar plantilla según tipo
            if (wizardData.carrierType === 'standard') {
                wizardData.template = 'standard';
            } else if (wizardData.carrierType === 'express') {
                wizardData.template = 'express';
            }
        });
        
        // Paso 2: Selección de plantilla
        $('.template-preview-card').on('click', function() {
            $('.template-preview-card').removeClass('selected');
            $(this).addClass('selected');
            wizardData.template = $(this).data('template');
            
            // Previsualizar plantilla
            previewTemplate(wizardData.template);
        });
        
        // Paso 3: Configuración de zonas
        $('.zone-quick-actions .btn').on('click', function() {
            var action = $(this).data('action');
            handleZoneQuickAction(action);
        });
        
        $('.zone-item input[type="checkbox"]').on('change', function() {
            updateSelectedZones();
        });
        
        // Paso 4: Definir rangos
        $('.range-preset').on('click', function() {
            $('.range-preset').removeClass('active');
            $(this).addClass('active');
            applyRangePreset($(this).data('preset'));
        });
        
        $('#add-range-btn').on('click', function() {
            addRange();
        });
        
        $(document).on('click', '.remove-range', function() {
            removeRange($(this).data('index'));
        });
        
        // Paso 5: Configurar precios
        $('.price-strategy-card').on('click', function() {
            $('.price-strategy-card').removeClass('selected');
            $(this).addClass('selected');
            wizardData.priceStrategy = $(this).data('strategy');
            
            // Mostrar/ocultar opciones según estrategia
            if (wizardData.priceStrategy === 'formula') {
                $('.price-formula-builder').show();
            } else {
                $('.price-formula-builder').hide();
            }
        });
        
        // Validación en tiempo real
        $('input[required]').on('blur', function() {
            validateField($(this));
        });
    }
    
    function showStep(step) {
        // Guardar datos del paso actual
        saveStepData(currentStep);
        
        // Actualizar paso actual
        currentStep = step;
        
        // Actualizar UI de pasos
        $('.wizard-step').removeClass('active completed');
        for (var i = 1; i < step; i++) {
            $('.wizard-step[data-step="' + i + '"]').addClass('completed');
        }
        $('.wizard-step[data-step="' + step + '"]').addClass('active');
        
        // Mostrar contenido del paso
        $('.wizard-panel').removeClass('active');
        $('#wizard-step-' + step).addClass('active');
        
        // Animar transición
        if (step > currentStep) {
            $('#wizard-step-' + step).addClass('slide-in-right');
        } else {
            $('#wizard-step-' + step).addClass('slide-in-left');
        }
        
        // Actualizar botones de navegación
        updateNavigationButtons();
        
        // Actualizar barra de progreso
        updateProgress();
        
        // Cargar datos del paso si es necesario
        loadStepData(step);
    }
    
    function updateNavigationButtons() {
        $('.btn-prev').prop('disabled', currentStep === 1);
        
        if (currentStep === totalSteps) {
            $('.btn-next').hide();
            $('.btn-finish').show();
        } else {
            $('.btn-next').show();
            $('.btn-finish').hide();
        }
    }
    
    function updateProgress() {
        var progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
        $('.wizard-progress-fill').css('width', progress + '%');
    }
    
    function validateStep(step) {
        var isValid = true;
        var errors = [];
        
        switch (step) {
            case 1:
                if (!wizardData.carrierName) {
                    errors.push('El nombre del transportista es obligatorio');
                    isValid = false;
                }
                if (!wizardData.carrierType) {
                    errors.push('Selecciona un tipo de transportista');
                    isValid = false;
                }
                break;
                
            case 2:
                if (!wizardData.template) {
                    errors.push('Selecciona una plantilla');
                    isValid = false;
                }
                break;
                
            case 3:
                if (wizardData.zones.length === 0) {
                    errors.push('Selecciona al menos una zona');
                    isValid = false;
                }
                break;
                
            case 4:
                if (wizardData.ranges.length === 0) {
                    errors.push('Define al menos un rango de peso');
                    isValid = false;
                }
                break;
                
            case 5:
                if (!wizardData.priceStrategy) {
                    errors.push('Selecciona una estrategia de precios');
                    isValid = false;
                }
                break;
        }
        
        if (!isValid) {
            showErrors(errors);
        }
        
        return isValid;
    }
    
    function validateField($field) {
        var isValid = true;
        
        if ($field.prop('required') && !$field.val()) {
            $field.addClass('error');
            $field.parent().find('.error-message').remove();
            $field.parent().append('<span class="error-message">Este campo es obligatorio</span>');
            isValid = false;
        } else {
            $field.removeClass('error');
            $field.parent().find('.error-message').remove();
        }
        
        return isValid;
    }
    
    function saveStepData(step) {
        switch (step) {
            case 1:
                wizardData.carrierName = $('#carrier-name').val();
                wizardData.delay = $('#carrier-delay').val();
                wizardData.logo = $('#carrier-logo').val();
                break;
                
            case 3:
                updateSelectedZones();
                break;
                
            case 4:
                // Los rangos se actualizan en tiempo real
                break;
                
            case 5:
                if (wizardData.priceStrategy === 'manual') {
                    wizardData.basePrice = parseFloat($('#base-price').val()) || 0;
                } else if (wizardData.priceStrategy === 'formula') {
                    wizardData.priceFormula = buildFormulaFromUI();
                }
                wizardData.handling = parseFloat($('#handling-fee').val()) || 0;
                break;
        }
    }
    
    function loadStepData(step) {
        switch (step) {
            case 1:
                $('#carrier-name').val(wizardData.carrierName);
                if (wizardData.carrierType) {
                    $('.carrier-type-card[data-type="' + wizardData.carrierType + '"]').click();
                }
                break;
                
            case 2:
                if (wizardData.template) {
                    $('.template-preview-card[data-template="' + wizardData.template + '"]').click();
                }
                break;
                
            case 3:
                // Marcar zonas seleccionadas
                $('.zone-item input[type="checkbox"]').prop('checked', false);
                wizardData.zones.forEach(function(zoneId) {
                    $('.zone-item input[value="' + zoneId + '"]').prop('checked', true);
                });
                updateZoneCounter();
                break;
                
            case 4:
                displayRanges();
                break;
                
            case 5:
                if (wizardData.priceStrategy) {
                    $('.price-strategy-card[data-strategy="' + wizardData.priceStrategy + '"]').click();
                }
                $('#base-price').val(wizardData.basePrice);
                $('#handling-fee').val(wizardData.handling);
                break;
                
            case 6:
                showReview();
                break;
        }
    }
    
    function previewTemplate(templateKey) {
        var template = templates[templateKey];
        if (!template) return;
        
        var html = '<h5>' + template.name + '</h5>';
        html += '<p>' + template.description + '</p>';
        
        if (template.ranges.length > 0) {
            html += '<table class="template-preview-table">';
            html += '<thead><tr><th>Zona</th>';
            
            template.ranges.forEach(function(range) {
                html += '<th>' + range + ' kg</th>';
            });
            
            html += '</tr></thead><tbody>';
            
            for (var zone in template.zones) {
                html += '<tr><td>' + zone + '</td>';
                template.zones[zone].forEach(function(price) {
                    html += '<td>' + price.toFixed(2) + ' €</td>';
                });
                html += '</tr>';
            }
            
            html += '</tbody></table>';
        }
        
        $('#template-preview').html(html);
    }
    
    function handleZoneQuickAction(action) {
        switch (action) {
            case 'select-all':
                $('.zone-item input[type="checkbox"]').prop('checked', true);
                break;
                
            case 'select-none':
                $('.zone-item input[type="checkbox"]').prop('checked', false);
                break;
                
            case 'select-national':
                $('.zone-item input[type="checkbox"]').prop('checked', false);
                $('.zone-item[data-country="ES"] input[type="checkbox"]').prop('checked', true);
                break;
                
            case 'select-eu':
                $('.zone-item input[type="checkbox"]').prop('checked', false);
                $('.zone-item[data-eu="1"] input[type="checkbox"]').prop('checked', true);
                break;
        }
        
        updateSelectedZones();
    }
    
    function updateSelectedZones() {
        wizardData.zones = [];
        $('.zone-item input[type="checkbox"]:checked').each(function() {
            wizardData.zones.push($(this).val());
        });
        
        updateZoneCounter();
    }
    
    function updateZoneCounter() {
        var count = wizardData.zones.length;
        $('#selected-zones-count').text(count + ' zona' + (count !== 1 ? 's' : '') + ' seleccionada' + (count !== 1 ? 's' : ''));
    }
    
    function applyRangePreset(preset) {
        wizardData.ranges = [];
        
        switch (preset) {
            case 'light':
                wizardData.ranges = [
                    {from: 0, to: 0.5},
                    {from: 0.5, to: 1},
                    {from: 1, to: 2},
                    {from: 2, to: 5},
                    {from: 5, to: 10}
                ];
                break;
                
            case 'standard':
                wizardData.ranges = [
                    {from: 0, to: 1},
                    {from: 1, to: 5},
                    {from: 5, to: 10},
                    {from: 10, to: 20},
                    {from: 20, to: 30}
                ];
                break;
                
            case 'heavy':
                wizardData.ranges = [
                    {from: 0, to: 30},
                    {from: 30, to: 50},
                    {from: 50, to: 100},
                    {from: 100, to: 200},
                    {from: 200, to: 500}
                ];
                break;
                
            case 'custom':
                // No hacer nada, el usuario define sus propios rangos
                break;
        }
        
        displayRanges();
    }
    
    function addRange() {
        var from = parseFloat($('#range-from').val());
        var to = parseFloat($('#range-to').val());
        
        if (isNaN(from) || isNaN(to)) {
            showError('Introduce valores válidos para el rango');
            return;
        }
        
        if (from >= to) {
            showError('El valor "hasta" debe ser mayor que "desde"');
            return;
        }
        
        // Verificar solapamiento
        var overlap = wizardData.ranges.some(function(range) {
            return (from < range.to && to > range.from);
        });
        
        if (overlap) {
            showError('El rango se solapa con uno existente');
            return;
        }
        
        wizardData.ranges.push({from: from, to: to});
        wizardData.ranges.sort(function(a, b) { return a.from - b.from; });
        
        $('#range-from').val('');
        $('#range-to').val('');
        
        displayRanges();
    }
    
    function removeRange(index) {
        wizardData.ranges.splice(index, 1);
        displayRanges();
    }
    
    function displayRanges() {
        var html = '';
        
        if (wizardData.ranges.length === 0) {
            html = '<p class="text-muted">No hay rangos definidos</p>';
        } else {
            wizardData.ranges.forEach(function(range, index) {
                html += '<div class="range-item">';
                html += '<div class="range-item-values">';
                html += '<span>' + range.from.toFixed(2) + ' - ' + range.to.toFixed(2) + ' kg</span>';
                html += '</div>';
                html += '<div class="range-item-actions">';
                html += '<button type="button" class="btn btn-sm btn-danger remove-range" data-index="' + index + '">';
                html += '<i class="icon-trash"></i></button>';
                html += '</div>';
                html += '</div>';
            });
        }
        
        $('#range-list').html(html);
    }
    
    function buildFormulaFromUI() {
        var formula = {
            base: parseFloat($('#formula-base').val()) || 0,
            weightMultiplier: parseFloat($('#formula-weight-multiplier').val()) || 0,
            zoneMultiplier: parseFloat($('#formula-zone-multiplier').val()) || 1,
            distanceMultiplier: parseFloat($('#formula-distance-multiplier').val()) || 0
        };
        
        return formula;
    }
    
    function showReview() {
        var html = '';
        
        // Información básica
        html += '<div class="review-section">';
        html += '<h5><i class="icon-info-circle"></i> Información básica</h5>';
        html += '<dl class="review-info">';
        html += '<dt>Nombre:</dt><dd>' + wizardData.carrierName + '</dd>';
        html += '<dt>Tipo:</dt><dd>' + wizardData.carrierType + '</dd>';
        html += '<dt>Plantilla:</dt><dd>' + (templates[wizardData.template] ? templates[wizardData.template].name : 'Personalizada') + '</dd>';
        html += '</dl>';
        html += '</div>';
        
        // Zonas
        html += '<div class="review-section">';
        html += '<h5><i class="icon-globe"></i> Zonas seleccionadas</h5>';
        html += '<p>' + wizardData.zones.length + ' zonas activas</p>';
        html += '</div>';
        
        // Rangos
        html += '<div class="review-section">';
        html += '<h5><i class="icon-resize-horizontal"></i> Rangos de peso</h5>';
        html += '<ul>';
        wizardData.ranges.forEach(function(range) {
            html += '<li>' + range.from + ' - ' + range.to + ' kg</li>';
        });
        html += '</ul>';
        html += '</div>';
        
        // Precios
        html += '<div class="review-section">';
        html += '<h5><i class="icon-money"></i> Configuración de precios</h5>';
        html += '<dl class="review-info">';
        html += '<dt>Estrategia:</dt><dd>' + wizardData.priceStrategy + '</dd>';
        if (wizardData.priceStrategy === 'manual' && wizardData.basePrice > 0) {
            html += '<dt>Precio base:</dt><dd>' + wizardData.basePrice.toFixed(2) + ' €</dd>';
        }
        if (wizardData.handling > 0) {
            html += '<dt>Gastos de gestión:</dt><dd>' + wizardData.handling.toFixed(2) + ' €</dd>';
        }
        html += '</dl>';
        html += '</div>';
        
        // Vista previa de la matriz
        html += '<div class="review-section">';
        html += '<h5><i class="icon-th"></i> Vista previa de la matriz</h5>';
        html += generateMatrixPreview();
        html += '</div>';
        
        $('#review-content').html(html);
    }
    
    function generateMatrixPreview() {
        var html = '<div class="preview-matrix">';
        html += '<table class="table table-bordered table-sm">';
        html += '<thead><tr><th class="zone-col">Zona</th>';
        
        wizardData.ranges.forEach(function(range) {
            html += '<th>' + range.from + '-' + range.to + ' kg</th>';
        });
        
        html += '</tr></thead><tbody>';
        
        // Mostrar algunas zonas de ejemplo
        var sampleZones = wizardData.zones.slice(0, 5);
        var zoneNames = {
            '1': 'España',
            '2': 'Portugal',
            '3': 'Francia',
            '4': 'Alemania',
            '5': 'Italia'
        };
        
        sampleZones.forEach(function(zoneId) {
            html += '<tr>';
            html += '<td class="zone-col">' + (zoneNames[zoneId] || 'Zona ' + zoneId) + '</td>';
            
            wizardData.ranges.forEach(function(range, index) {
                var price = calculateSamplePrice(zoneId, range, index);
                html += '<td>' + price.toFixed(2) + ' €</td>';
            });
            
            html += '</tr>';
        });
        
        if (wizardData.zones.length > 5) {
            html += '<tr><td colspan="' + (wizardData.ranges.length + 1) + '" class="text-center">... y ' + (wizardData.zones.length - 5) + ' zonas más</td></tr>';
        }
        
        html += '</tbody></table>';
        html += '</div>';
        
        return html;
    }
    
    function calculateSamplePrice(zoneId, range, rangeIndex) {
        // Si hay plantilla, usar sus precios
        if (wizardData.template && templates[wizardData.template].zones) {
            var template = templates[wizardData.template];
            var zoneKey = Object.keys(template.zones)[0];
            if (template.zones[zoneKey] && template.zones[zoneKey][rangeIndex]) {
                return template.zones[zoneKey][rangeIndex];
            }
        }
        
        // Cálculo básico de ejemplo
        var basePrice = wizardData.basePrice || 5;
        var weightFactor = (range.from + range.to) / 2 * 0.5;
        var zoneFactor = parseInt(zoneId) * 0.5;
        
        return basePrice + weightFactor + zoneFactor + wizardData.handling;
    }
    
    function finishWizard() {
        // Mostrar confirmación
        if (!confirm('¿Estás seguro de que quieres crear el transportista con esta configuración?')) {
            return;
        }
        
        // Preparar datos para enviar
        var formData = {
            action: 'create_carrier_wizard',
            data: JSON.stringify(wizardData)
        };
        
        // Mostrar loading
        showLoading();
        
        // Enviar datos
        $.ajax({
            url: window.location.href,
            type: 'POST',
            data: formData,
            dataType: 'json',
            success: function(response) {
                hideLoading();
                
                if (response.success) {
                    showSuccess('Transportista creado correctamente');
                    
                    // Redirigir a la configuración del transportista
                    setTimeout(function() {
                        window.location.href = response.redirect_url;
                    }, 1500);
                } else {
                    showError(response.message || 'Error al crear el transportista');
                }
            },
            error: function() {
                hideLoading();
                showError('Error de conexión. Por favor, inténtalo de nuevo.');
            }
        });
    }
    
    function showLoading() {
        if ($('.wizard-loading').length === 0) {
            var loadingHtml = '<div class="wizard-loading">' +
                '<div class="loading-spinner"></div>' +
                '<p>Creando transportista...</p>' +
                '</div>';
            $('body').append(loadingHtml);
        }
        $('.wizard-loading').fadeIn();
    }
    
    function hideLoading() {
        $('.wizard-loading').fadeOut(function() {
            $(this).remove();
        });
    }
    
    function showError(message) {
        showNotification(message, 'error');
    }
    
    function showErrors(errors) {
        var message = errors.join('<br>');
        showNotification(message, 'error');
    }
    
    function showSuccess(message) {
        showNotification(message, 'success');
    }
    
    function showNotification(message, type) {
        type = type || 'info';
        
        var alertClass = 'alert-info';
        var iconClass = 'icon-info-circle';
        
        switch(type) {
            case 'success':
                alertClass = 'alert-success';
                iconClass = 'icon-check-circle';
                break;
            case 'error':
                alertClass = 'alert-danger';
                iconClass = 'icon-exclamation-circle';
                break;
            case 'warning':
                alertClass = 'alert-warning';
                iconClass = 'icon-exclamation-triangle';
                break;
        }
        
        var $notification = $('<div class="alert ' + alertClass + ' alert-dismissible wizard-notification">' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
            '<i class="' + iconClass + '"></i> ' + message +
            '</div>');
        
        $('.wizard-content').prepend($notification);
        
        // Auto-cerrar después de 5 segundos
        setTimeout(function() {
            $notification.fadeOut(function() {
                $(this).remove();
            });
        }, 5000);
        
        // Scroll al top
        $('.wizard-content').scrollTop(0);
    }
    
    // Funciones de utilidad
    function formatPrice(price) {
        return price.toFixed(2) + ' €';
    }
    
    function sortRanges() {
        wizardData.ranges.sort(function(a, b) {
            return a.from - b.from;
        });
    }
    
    // Guardar estado del wizard en localStorage
    function saveWizardState() {
        localStorage.setItem('matrizcarrier_wizard_state', JSON.stringify({
            step: currentStep,
            data: wizardData
        }));
    }
    
    function restoreWizardState() {
        var saved = localStorage.getItem('matrizcarrier_wizard_state');
        if (saved) {
            try {
                var state = JSON.parse(saved);
                wizardData = state.data;
                showStep(state.step);
                return true;
            } catch(e) {
                console.error('Error restaurando estado del wizard:', e);
            }
        }
        return false;
    }
    
    function clearWizardState() {
        localStorage.removeItem('matrizcarrier_wizard_state');
    }
    
    // Auto-guardar cada vez que se cambia de paso
    $(window).on('beforeunload', function() {
        if (currentStep > 1 && currentStep < totalSteps) {
            saveWizardState();
        }
    });
    
    // Intentar restaurar estado al cargar
    if (!restoreWizardState()) {
        // Si no hay estado guardado, empezar desde el principio
        showStep(1);
    }
    
    // Limpiar estado al completar
    $(document).on('wizard:completed', function() {
        clearWizardState();
    });
});