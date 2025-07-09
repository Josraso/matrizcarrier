// views/js/rules.js

$(document).ready(function() {
    'use strict';
    
    var currentRule = {
        id: null,
        name: '',
        type: 'price',
        conditions: [],
        actions: [],
        priority: 0,
        active: true
    };
    
    var conditionTypes = {
        'zone_name': {
            label: 'Nombre de zona',
            operators: ['equals', 'contains', 'starts_with', 'ends_with', 'regex'],
            valueType: 'text'
        },
        'zone_active': {
            label: 'Zona activa',
            operators: ['equals'],
            valueType: 'boolean'
        },
        'weight_from': {
            label: 'Peso desde',
            operators: ['equals', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal', 'between'],
            valueType: 'number'
        },
        'weight_to': {
            label: 'Peso hasta',
            operators: ['equals', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal', 'between'],
            valueType: 'number'
        },
        'current_price': {
            label: 'Precio actual',
            operators: ['equals', 'greater_than', 'less_than', 'greater_or_equal', 'less_or_equal', 'between'],
            valueType: 'number'
        },
        'zone_country': {
            label: 'País de la zona',
            operators: ['equals', 'not_equals', 'in'],
            valueType: 'select'
        }
    };
    
    var actionTypes = {
        'set_price': {
            label: 'Establecer precio',
            valueType: 'number'
        },
        'increase_percent': {
            label: 'Aumentar porcentaje',
            valueType: 'number'
        },
        'decrease_percent': {
            label: 'Disminuir porcentaje',
            valueType: 'number'
        },
        'add_fixed': {
            label: 'Sumar cantidad fija',
            valueType: 'number'
        },
        'multiply': {
            label: 'Multiplicar por',
            valueType: 'number'
        },
        'formula': {
            label: 'Aplicar fórmula',
            valueType: 'formula'
        },
        'copy_from_zone': {
            label: 'Copiar de zona',
            valueType: 'zone_select'
        },
        'round': {
            label: 'Redondear a',
            valueType: 'number'
        }
    };
    
    init();
    
    function init() {
        bindEvents();
        loadRules();
    }
    
    function bindEvents() {
        // Crear nueva regla
        $('#create-rule-btn').on('click', function() {
            resetRule();
            $('#ruleModal').modal('show');
        });
        
        // Editar regla
        $(document).on('click', '.edit-rule', function() {
            var ruleId = $(this).data('rule-id');
            loadRule(ruleId);
        });
        
        // Eliminar regla
        $(document).on('click', '.delete-rule', function() {
            var ruleId = $(this).data('rule-id');
            deleteRule(ruleId);
        });
        
        // Activar/desactivar regla
        $(document).on('change', '.rule-active-toggle', function() {
            var ruleId = $(this).data('rule-id');
            var active = $(this).is(':checked');
            toggleRule(ruleId, active);
        });
        
        // Añadir condición
        $('#add-condition-btn').on('click', function() {
            addCondition();
        });
        
        // Eliminar condición
        $(document).on('click', '.remove-condition', function() {
            $(this).closest('.rule-condition').remove();
            updateConditionsPreview();
        });
        
        // Cambiar tipo de condición
        $(document).on('change', '.condition-field', function() {
            var $condition = $(this).closest('.rule-condition');
            updateConditionOperators($condition);
        });
        
        // Añadir acción
        $('#add-action-btn').on('click', function() {
            addAction();
        });
        
        // Eliminar acción
        $(document).on('click', '.remove-action', function() {
            $(this).closest('.rule-action').remove();
            updateActionsPreview();
        });
        
        // Guardar regla
        $('#save-rule-btn').on('click', function() {
            saveRule();
        });
        
        // Probar regla
        $('#test-rule-btn').on('click', function() {
            testRule();
        });
        
        // Aplicar reglas seleccionadas
        $('#apply-selected-rules-btn').on('click', function() {
            applySelectedRules();
        });
        
        // Seleccionar todas las reglas
        $('#select-all-rules').on('change', function() {
            $('.rule-checkbox').prop('checked', $(this).is(':checked'));
            updateBulkActions();
        });
        
        // Cambio en checkbox de regla
        $(document).on('change', '.rule-checkbox', function() {
            updateBulkActions();
        });
        
        // Ordenar reglas
        if (typeof Sortable !== 'undefined') {
            new Sortable(document.getElementById('rules-list'), {
                handle: '.drag-handle',
                animation: 150,
                onEnd: function(evt) {
                    updateRulePriorities();
                }
            });
        }
        
        // Importar/Exportar reglas
        $('#export-rules-btn').on('click', function() {
            exportRules();
        });
        
        $('#import-rules-btn').on('click', function() {
            $('#import-rules-file').click();
        });
        
        $('#import-rules-file').on('change', function(e) {
            importRules(e.target.files[0]);
        });
    }
    
    function loadRules() {
    $.ajax({
        url: window.location.href,
        type: 'POST',
        data: {
            action: 'get_rules'
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                displayRules(response.rules);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error cargando reglas:', error);
            showError('Error al cargar las reglas');
        }
    });
}
    
    function displayRules(rules) {
        var html = '';
        
        if (rules.length === 0) {
            html = '<tr><td colspan="6" class="text-center">No hay reglas definidas</td></tr>';
        } else {
            rules.forEach(function(rule) {
                html += '<tr data-rule-id="' + rule.id + '">';
                html += '<td class="drag-handle"><i class="icon-move"></i></td>';
                html += '<td><input type="checkbox" class="rule-checkbox" value="' + rule.id + '"></td>';
                html += '<td>';
                html += '<strong>' + rule.name + '</strong>';
                if (rule.description) {
                    html += '<br><small class="text-muted">' + rule.description + '</small>';
                }
                html += '</td>';
                html += '<td>' + rule.type + '</td>';
                html += '<td class="text-center">' + rule.priority + '</td>';
                html += '<td class="text-center">';
                html += '<span class="switch prestashop-switch fixed-width-sm">';
                html += '<input type="radio" name="rule_active_' + rule.id + '" id="rule_active_on_' + rule.id + '" value="1"' + (rule.active ? ' checked' : '') + ' class="rule-active-toggle" data-rule-id="' + rule.id + '">';
                html += '<label for="rule_active_on_' + rule.id + '">Sí</label>';
                html += '<input type="radio" name="rule_active_' + rule.id + '" id="rule_active_off_' + rule.id + '" value="0"' + (!rule.active ? ' checked' : '') + ' class="rule-active-toggle" data-rule-id="' + rule.id + '">';
                html += '<label for="rule_active_off_' + rule.id + '">No</label>';
                html += '<a class="slide-button btn"></a>';
                html += '</span>';
                html += '</td>';
                html += '<td class="text-right">';
                html += '<div class="btn-group">';
                html += '<button class="btn btn-default btn-sm edit-rule" data-rule-id="' + rule.id + '"><i class="icon-edit"></i></button>';
                html += '<button class="btn btn-default btn-sm test-rule" data-rule-id="' + rule.id + '"><i class="icon-flask"></i></button>';
                html += '<button class="btn btn-danger btn-sm delete-rule" data-rule-id="' + rule.id + '"><i class="icon-trash"></i></button>';
                html += '</div>';
                html += '</td>';
                html += '</tr>';
            });
        }
        
        $('#rules-list').html(html);
    }
    
    function resetRule() {
        currentRule = {
            id: null,
            name: '',
            type: 'price',
            conditions: [],
            actions: [],
            priority: 0,
            active: true
        };
        
        $('#rule-id').val('');
        $('#rule-name').val('');
        $('#rule-description').val('');
        $('#rule-type').val('price');
        $('#rule-priority').val('0');
        $('#rule-active').prop('checked', true);
        
        $('#conditions-container').empty();
        $('#actions-container').empty();
        
        addCondition();
        addAction();
    }
    
    function loadRule(ruleId) {
        $.ajax({
            url: window.location.href,
            type: 'POST',
            data: {
                action: 'get_rule',
                rule_id: ruleId
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    currentRule = response.rule;
                    populateRuleForm();
                    if ($('#ruleModal').length > 0) {
    $('#ruleModal').modal('show');
} else {
    console.error('Modal de reglas no encontrado');
}
                }
            }
        });
    }
    
    function populateRuleForm() {
        $('#rule-id').val(currentRule.id);
        $('#rule-name').val(currentRule.name);
        $('#rule-description').val(currentRule.description);
        $('#rule-type').val(currentRule.type);
        $('#rule-priority').val(currentRule.priority);
        $('#rule-active').prop('checked', currentRule.active);
        
        // Condiciones
        $('#conditions-container').empty();
        if (currentRule.conditions.length === 0) {
            addCondition();
        } else {
            currentRule.conditions.forEach(function(condition) {
                addCondition(condition);
            });
        }
        
        // Acciones
        $('#actions-container').empty();
        if (currentRule.actions.length === 0) {
            addAction();
        } else {
            currentRule.actions.forEach(function(action) {
                addAction(action);
            });
        }
    }
    
    function addCondition(condition) {
        condition = condition || {field: '', operator: '', value: ''};
        
        var html = '<div class="rule-condition">';
        html += '<select class="form-control condition-field">';
        html += '<option value="">-- Seleccionar campo --</option>';
        
        for (var field in conditionTypes) {
            html += '<option value="' + field + '"' + (condition.field === field ? ' selected' : '') + '>';
            html += conditionTypes[field].label;
            html += '</option>';
        }
        
        html += '</select>';
        html += '<select class="form-control condition-operator">';
        html += '<option value="">-- Operador --</option>';
        html += '</select>';
        html += '<input type="text" class="form-control condition-value" value="' + (condition.value || '') + '" placeholder="Valor">';
        html += '<button type="button" class="btn btn-danger remove-condition"><i class="icon-trash"></i></button>';
        html += '</div>';
        
        var $condition = $(html);
        $('#conditions-container').append($condition);
        
        if (condition.field) {
            updateConditionOperators($condition);
            $condition.find('.condition-operator').val(condition.operator);
        }
        
        updateConditionsPreview();
    }
    
    function updateConditionOperators($condition) {
        var field = $condition.find('.condition-field').val();
        var $operator = $condition.find('.condition-operator');
        
        if (!field || !conditionTypes[field]) {
            $operator.html('<option value="">-- Operador --</option>');
            return;
        }
        
        var operators = conditionTypes[field].operators;
        var html = '<option value="">-- Operador --</option>';
        
        operators.forEach(function(op) {
            var label = getOperatorLabel(op);
            html += '<option value="' + op + '">' + label + '</option>';
        });
        
        $operator.html(html);
        
        // Actualizar tipo de input según el tipo de valor
        var valueType = conditionTypes[field].valueType;
        var $value = $condition.find('.condition-value');
        
        switch (valueType) {
            case 'number':
                $value.attr('type', 'number').attr('step', '0.01');
                break;
            case 'boolean':
                $value.replaceWith('<select class="form-control condition-value"><option value="1">Sí</option><option value="0">No</option></select>');
                break;
            case 'select':
                // Aquí deberías cargar opciones dinámicamente
                break;
            default:
                $value.attr('type', 'text');
        }
    }
    
    function getOperatorLabel(operator) {
        var labels = {
            'equals': 'Igual a',
            'not_equals': 'Diferente de',
            'contains': 'Contiene',
            'starts_with': 'Empieza con',
            'ends_with': 'Termina con',
            'greater_than': 'Mayor que',
            'less_than': 'Menor que',
            'greater_or_equal': 'Mayor o igual que',
            'less_or_equal': 'Menor o igual que',
            'between': 'Entre',
            'in': 'En la lista',
            'regex': 'Expresión regular'
        };
        
        return labels[operator] || operator;
    }
    
    function addAction(action) {
        action = action || {type: '', value: ''};
        
        var html = '<div class="rule-action">';
        html += '<select class="form-control action-type">';
        html += '<option value="">-- Seleccionar acción --</option>';
        
        for (var type in actionTypes) {
            html += '<option value="' + type + '"' + (action.type === type ? ' selected' : '') + '>';
            html += actionTypes[type].label;
            html += '</option>';
        }
        
        html += '</select>';
        html += '<input type="text" class="form-control action-value" value="' + (action.value || '') + '" placeholder="Valor">';
        html += '<button type="button" class="btn btn-danger remove-action"><i class="icon-trash"></i></button>';
        html += '</div>';
        
        $('#actions-container').append(html);
        updateActionsPreview();
    }
    
    function updateConditionsPreview() {
        // Actualizar vista previa de condiciones
        var conditions = [];
        $('.rule-condition').each(function() {
            var field = $(this).find('.condition-field').val();
            var operator = $(this).find('.condition-operator').val();
            var value = $(this).find('.condition-value').val();
            
            if (field && operator) {
                conditions.push({
                    field: field,
                    operator: operator,
                    value: value
                });
            }
        });
        
        currentRule.conditions = conditions;
    }
    
    function updateActionsPreview() {
        // Actualizar vista previa de acciones
        var actions = [];
        $('.rule-action').each(function() {
            var type = $(this).find('.action-type').val();
            var value = $(this).find('.action-value').val();
            
            if (type) {
                actions.push({
                    type: type,
                    value: value
                });
            }
        });
        
        currentRule.actions = actions;
    }
    
    function saveRule() {
        // Recopilar datos del formulario
        currentRule.name = $('#rule-name').val();
        currentRule.description = $('#rule-description').val();
        currentRule.type = $('#rule-type').val();
        currentRule.priority = parseInt($('#rule-priority').val()) || 0;
        currentRule.active = $('#rule-active').is(':checked');
        
        updateConditionsPreview();
        updateActionsPreview();
        
        // Validar
        if (!currentRule.name) {
            showError('El nombre de la regla es obligatorio');
            return;
        }
        
        if (currentRule.conditions.length === 0) {
            showError('Debe haber al menos una condición');
            return;
        }
        
        if (currentRule.actions.length === 0) {
            showError('Debe haber al menos una acción');
            return;
        }
        
        // Enviar
        $.ajax({
            url: window.location.href,
            type: 'POST',
            data: {
                action: 'save_rule',
                rule: JSON.stringify(currentRule)
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    showSuccess('Regla guardada correctamente');
                    $('#ruleModal').modal('hide');
                    loadRules();
                } else {
                    showError(response.message || 'Error al guardar la regla');
                }
            },
            error: function() {
                showError('Error de conexión');
            }
        });
    }
    
    function deleteRule(ruleId) {
        if (!confirm('¿Estás seguro de que quieres eliminar esta regla?')) {
            return;
        }
        
        $.ajax({
            url: window.location.href,
            type: 'POST',
            data: {
                action: 'delete_rule',
                rule_id: ruleId
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    showSuccess('Regla eliminada');
                    loadRules();
                } else {
                    showError(response.message || 'Error al eliminar la regla');
                }
            }
        });
    }
    
    function toggleRule(ruleId, active) {
        $.ajax({
            url: window.location.href,
            type: 'POST',
            data: {
                action: 'toggle_rule',
                rule_id: ruleId,
                active: active ? 1 : 0
            },
            dataType: 'json',
            success: function(response) {
                if (!response.success) {
                    showError(response.message || 'Error al actualizar la regla');
                    loadRules();
                }
            }
        });
    }
    
    function testRule() {
        updateConditionsPreview();
        updateActionsPreview();
        
        $('#testRuleModal').modal('show');
        
        // Simular aplicación de la regla
        var testResults = simulateRule(currentRule);
        displayTestResults(testResults);
    }
    
    function simulateRule(rule) {
        // Simulación básica
        var results = {
            totalCells: 0,
            matchingCells: 0,
            affectedCells: 0,
            examples: []
        };
        
        // Aquí deberías hacer una llamada AJAX real para probar la regla
        // Por ahora, simulamos algunos resultados
        results.totalCells = 150;
        results.matchingCells = 45;
        results.affectedCells = 45;
        
        results.examples = [
            {zone: 'España', range: '0-5kg', oldPrice: 5.95, newPrice: 7.14},
            {zone: 'España', range: '5-10kg', oldPrice: 8.95, newPrice: 10.74},
            {zone: 'Francia', range: '0-5kg', oldPrice: 12.95, newPrice: 15.54}
        ];
        
        return results;
    }
    
    function displayTestResults(results) {
        var html = '<div class="test-results">';
        html += '<div class="alert alert-info">';
        html += '<strong>Resultados de la simulación:</strong><br>';
        html += 'Total de celdas: ' + results.totalCells + '<br>';
        html += 'Celdas que cumplen las condiciones: ' + results.matchingCells + '<br>';
        html += 'Celdas que serán modificadas: ' + results.affectedCells;
        html += '</div>';
        
        if (results.examples.length > 0) {
            html += '<h5>Ejemplos de cambios:</h5>';
            html += '<table class="table table-bordered table-sm">';
            html += '<thead><tr><th>Zona</th><th>Rango</th><th>Precio actual</th><th>Precio nuevo</th><th>Diferencia</th></tr></thead>';
            html += '<tbody>';
            
            results.examples.forEach(function(example) {
                var diff = example.newPrice - example.oldPrice;
                var diffPercent = ((diff / example.oldPrice) * 100).toFixed(1);
                
                html += '<tr>';
                html += '<td>' + example.zone + '</td>';
                html += '<td>' + example.range + '</td>';
                html += '<td>' + example.oldPrice.toFixed(2) + ' €</td>';
                html += '<td>' + example.newPrice.toFixed(2) + ' €</td>';
                html += '<td class="' + (diff > 0 ? 'text-danger' : 'text-success') + '">';
                html += (diff > 0 ? '+' : '') + diff.toFixed(2) + ' € (' + (diff > 0 ? '+' : '') + diffPercent + '%)';
                html += '</td>';
                html += '</tr>';
            });
            
            html += '</tbody></table>';
        }
        
        html += '</div>';
        
        $('#test-results-container').html(html);
    }
    
    function applySelectedRules() {
        var selectedRules = [];
        $('.rule-checkbox:checked').each(function() {
            selectedRules.push($(this).val());
        });
        
        if (selectedRules.length === 0) {
            showError('Selecciona al menos una regla');
            return;
        }
        
        var carrierId = $('#carrier_id').val();
        if (!carrierId) {
            showError('Selecciona un transportista primero');
            return;
        }
        
        if (!confirm('¿Aplicar ' + selectedRules.length + ' regla(s) seleccionada(s)?')) {
            return;
        }
        
        showLoading();
        
        $.ajax({
            url: window.location.href,
            type: 'POST',
            data: {
                action: 'apply_rules',
                carrier_id: carrierId,
                rule_ids: selectedRules
            },
            dataType: 'json',
            success: function(response) {
                hideLoading();
                
                if (response.success) {
                    showSuccess('Reglas aplicadas: ' + response.affected + ' precios actualizados');
                    
                    // Recargar la matriz si está visible
                    if ($('#matrix-tab').is(':visible')) {
                        location.reload();
                    }
                } else {
                    showError(response.message || 'Error al aplicar las reglas');
                }
            },
            error: function() {
                hideLoading();
                showError('Error de conexión');
            }
        });
    }
    
    function updateBulkActions() {
        var checkedCount = $('.rule-checkbox:checked').length;
        
        if (checkedCount > 0) {
            $('#bulk-actions').show();
            $('#selected-count').text(checkedCount);
        } else {
            $('#bulk-actions').hide();
        }
    }
    
    function updateRulePriorities() {
        var priorities = [];
        
        $('#rules-list tr').each(function(index) {
            var ruleId = $(this).data('rule-id');
            if (ruleId) {
                priorities.push({
                    id: ruleId,
                    priority: index
                });
            }
        });
        
        $.ajax({
            url: window.location.href,
            type: 'POST',
            data: {
                action: 'update_priorities',
                priorities: JSON.stringify(priorities)
            },
            dataType: 'json',
            success: function(response) {
                if (!response.success) {
                    showError('Error al actualizar prioridades');
                    loadRules();
                }
            }
        });
    }
    
    function exportRules() {
        var selectedRules = [];
        $('.rule-checkbox:checked').each(function() {
            selectedRules.push($(this).val());
        });
        
        window.location.href = window.location.href + '&action=export_rules&rule_ids=' + selectedRules.join(',');
    }
    
    function importRules(file) {
        if (!file) return;
        
        var reader = new FileReader();
        reader.onload = function(e) {
            try {
                var rules = JSON.parse(e.target.result);
                
                if (!Array.isArray(rules)) {
                    throw new Error('Formato inválido');
                }
                
                if (confirm('¿Importar ' + rules.length + ' regla(s)?')) {
                    $.ajax({
                        url: window.location.href,
                        type: 'POST',
                        data: {
                            action: 'import_rules',
                            rules: JSON.stringify(rules)
                        },
                        dataType: 'json',
                        success: function(response) {
                            if (response.success) {
                                showSuccess('Reglas importadas correctamente');
                                loadRules();
                            } else {
                                showError(response.message || 'Error al importar');
                            }
                        }
                    });
                }
            } catch (error) {
                showError('Error al leer el archivo: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    }
    
    // Funciones auxiliares
    function showLoading() {
        if ($('.rules-loading').length === 0) {
            $('body').append('<div class="rules-loading"><div class="loading-spinner"></div></div>');
        }
        $('.rules-loading').show();
    }
    
    function hideLoading() {
        $('.rules-loading').hide();
    }
    
    function showError(message) {
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
        }
        
        var $notification = $('<div class="alert ' + alertClass + ' alert-dismissible fade in">' +
            '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
            '<i class="' + iconClass + '"></i> ' + message +
            '</div>');
        
        $('#rules-notifications').html($notification);
        
        setTimeout(function() {
            $notification.fadeOut();
        }, 5000);
    }
    
    // Editor de fórmulas
    $(document).on('change', '.action-type', function() {
        var type = $(this).val();
        var $value = $(this).siblings('.action-value');
        
        if (type === 'formula') {
            // Mostrar editor de fórmulas
            $value.replaceWith('<button type="button" class="btn btn-default formula-editor-btn">Editar fórmula</button>');
        } else if (type === 'copy_from_zone') {
            // Mostrar selector de zona
            loadZoneSelector($value);
        } else {
            // Restaurar input normal
            var valueType = actionTypes[type] ? actionTypes[type].valueType : 'text';
            if (valueType === 'number') {
                $value.attr('type', 'number').attr('step', '0.01');
            }
        }
    });
    
    $(document).on('click', '.formula-editor-btn', function() {
        openFormulaEditor($(this));
    });
    
    function openFormulaEditor($button) {
        // Aquí podrías abrir un modal con un editor de fórmulas más complejo
        var formula = prompt('Introduce la fórmula (usa {price}, {weight}, {zone_id}):');
        if (formula) {
            $button.data('formula', formula);
            $button.text('Fórmula: ' + formula.substring(0, 20) + '...');
        }
    }
    
    function loadZoneSelector($element) {
        $.ajax({
            url: window.location.href,
            type: 'POST',
            data: {
                action: 'get_zones'
            },
            dataType: 'json',
            success: function(response) {
                var html = '<select class="form-control action-value">';
                html += '<option value="">-- Seleccionar zona --</option>';
                
                response.zones.forEach(function(zone) {
                    html += '<option value="' + zone.id + '">' + zone.name + '</option>';
                });
                
                html += '</select>';
                
                $element.replaceWith(html);
            }
        });
    }
});